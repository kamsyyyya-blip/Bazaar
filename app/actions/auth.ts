"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HOME_COUNTRY, isCountryCode } from "@/lib/countries";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };
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

  const supabase = await createClient();
  if (mode === "signup") {
    if (password.length < 12) return { error: "Use a password with at least 12 characters." };
    if (password.length > 128) return { error: "Keep your password under 128 characters." };
    if (name.length < 2) {
      return { error: "Add your name so sellers know who is asking." };
    }
    if (name.length > 60) {
      return { error: "That name is a little too long." };
    }
    if (county.length > 90) {
      return { error: "Keep your state or province under 90 characters." };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, country, county },
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
    });
    if (error) return { error: error.message };
    if (!data.session) {
      return { message: "Account created. Check your email to confirm your address, then sign in." };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Email or password is incorrect." };
  }

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

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { name, country, county, phone, bio },
  });
  if (error) return { error: "Could not save your profile. Please try again." };
  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return { success: "Saved — your profile is up to date." };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
