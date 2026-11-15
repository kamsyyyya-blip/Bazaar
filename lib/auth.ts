import { cookies } from "next/headers";
import { createSession, deleteSession, getUserBySession, type User } from "./db";

export const SESSION_COOKIE = "bazaar_session";

/** Reads the signed-in user from the session cookie. Safe in Server Components. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySession(token);
}

/** Creates a database session and writes the httpOnly cookie. Server Actions only. */
export async function startSession(userId: number): Promise<void> {
  const { token, expiresAt } = createSession(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Clears the current session from the database and the cookie jar. Server Actions only. */
export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) deleteSession(token);
  store.delete(SESSION_COOKIE);
}

/** Only allow same-site relative redirects. */
export function safeNext(value: FormDataEntryValue | null | undefined, fallback = "/profile"): string {
  const next = typeof value === "string" ? value.trim() : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
