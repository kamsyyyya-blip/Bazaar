import { cookies } from "next/headers";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createSession, deleteSession, getUserBySession, type User } from "./db";

export const SESSION_COOKIE = "bazaar_session";
const SESSION_DAYS = 30;
const SESSION_TTL_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

function sessionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random secret with at least 32 characters.");
  }
  return createHash("sha256").update(secret).digest();
}

function sealSession(user: User): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(), iv);
  const payload = Buffer.from(JSON.stringify({ user, expiresAt: Date.now() + SESSION_TTL_MS }));
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function openSession(token: string): User | null {
  try {
    const [version, ivText, tagText, encryptedText, extra] = token.split(".");
    if (version !== "v1" || !ivText || !tagText || !encryptedText || extra !== undefined) return null;
    const decipher = createDecipheriv("aes-256-gcm", sessionKey(), Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const payload = JSON.parse(plaintext) as { user?: User; expiresAt?: number };
    if (!payload.user || typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) return null;
    const user = payload.user;
    if (typeof user.id !== "number" || typeof user.email !== "string" || typeof user.name !== "string") return null;
    return user;
  } catch {
    return null;
  }
}

/** Reads the signed-in user from the session cookie. Safe in Server Components. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  if (token.startsWith("v1.")) return openSession(token);
  return getUserBySession(token);
}

/** Creates a database session and writes the httpOnly cookie. Server Actions only. */
export async function startSession(user: User): Promise<void> {
  let token: string;
  let expiresAt: Date;
  if (process.env.AUTH_SECRET) {
    token = sealSession(user);
    expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  } else if (process.env.NODE_ENV !== "production") {
    const databaseSession = createSession(user.id);
    token = databaseSession.token;
    expiresAt = new Date(databaseSession.expiresAt);
  } else {
    throw new Error("Set AUTH_SECRET in the deployment environment before enabling sign-in.");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Clears the current session from the database and the cookie jar. Server Actions only. */
export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && !token.startsWith("v1.")) deleteSession(token);
  store.delete(SESSION_COOKIE);
}

export async function refreshCurrentSession(user: User): Promise<void> {
  await startSession(user);
}

/** Only allow same-site relative redirects. */
export function safeNext(value: FormDataEntryValue | null | undefined, fallback = "/profile"): string {
  const next = typeof value === "string" ? value.trim() : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
