"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUser, getPasswordHashByEmail, getUserByEmail, updateUser } from "@/lib/db";
import { HOME_COUNTRY, isCountryCode } from "@/lib/countries";
import { endSession, getCurrentUser, safeNext, startSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export type AuthState = { error?: string };
export type ProfileState = { error?: string; success?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const mode = String(formData.get("mode") ?? "signin");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rawCountry = String(formData.get("country") ?? "").trim().toUpperCase();
  const country = isCountryCode(rawCountry) ? rawCountry : HOME_COUNTRY;
  const county = String(formData.get("county") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (mode !== "signin" && mode !== "signup") return { error: "Choose sign in or create account." };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (!password || Buffer.byteLength(password, "utf8") > 1024) return { error: "Enter a valid password." };

  let user = getUserByEmail(email);
  if (mode === "signup") {
    if (password.length < 12) return { error: "Use a password with at least 12 characters." };
    if (password.length > 128) return { error: "Keep your password under 128 characters." };
    if (user) return { error: "An account with this email already exists. Sign in instead." };
    if (name.length < 2) {
      return { error: "Add your name so sellers know who is asking." };
    }
    if (name.length > 60) {
      return { error: "That name is a little too long." };
    }
    if (county.length > 90) {
      return { error: "Keep your state or province under 90 characters." };
    }
    const passwordHash = await hashPassword(password);
    try {
      user = createUser({ email, name, country, county, passwordHash });
    } catch {
      return { error: "We couldn’t create that account. Check the email and try again." };
    }
  } else {
    const passwordHash = getPasswordHashByEmail(email);
    if (!user) return { error: "Email or password is incorrect." };
    if (!passwordHash) {
      return { error: "This old demo account has no password. Create a new account with a different email." };
    }
    if (!(await verifyPassword(password, passwordHash))) {
      return { error: "Email or password is incorrect." };
    }
  }

  await startSession(user.id);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function updateProfileAction(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session expired. Sign in again to save changes." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const county = String(formData.get("county") ?? "").trim();
  const rawCountry = String(formData.get("country") ?? "").trim().toUpperCase();
  const country = isCountryCode(rawCountry) ? rawCountry : user.country;
  const phone = String(formData.get("phone") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (name.length < 2) return { error: "Your name needs at least two characters." };
  if (name.length > 60) return { error: "Keep your name under 60 characters." };
  if (bio.length > 280) return { error: "Keep your bio under 280 characters." };

  updateUser(user.id, { name, country, county, phone, bio });
  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return { success: "Saved — your profile is up to date." };
}

export async function signOutAction(): Promise<void> {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}
