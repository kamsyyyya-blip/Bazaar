"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUser, getUserByEmail, updateUser } from "@/lib/db";
import { HOME_COUNTRY, isCountryCode } from "@/lib/countries";
import { endSession, getCurrentUser, safeNext, startSession } from "@/lib/auth";

export type AuthState = { error?: string };
export type ProfileState = { error?: string; success?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const rawCountry = String(formData.get("country") ?? "").trim().toUpperCase();
  const country = isCountryCode(rawCountry) ? rawCountry : HOME_COUNTRY;
  const county = String(formData.get("county") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  let user = getUserByEmail(email);
  if (!user) {
    if (name.length < 2) {
      return { error: "Add your name so sellers know who is asking." };
    }
    if (name.length > 60) {
      return { error: "That name is a little too long." };
    }
    if (county.length > 90) {
      return { error: "Keep your state or province under 90 characters." };
    }
    user = createUser({ email, name, country, county });
  } else if (user.country !== country) {
    updateUser(user.id, { country });
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
