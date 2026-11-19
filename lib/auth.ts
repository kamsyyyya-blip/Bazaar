import { createClient } from "@/lib/supabase/server";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "./db";

const AVATAR_COLORS = ["#3778c2", "#ab5a42", "#738354", "#986b9c", "#c18436"];

/** Reads a verified Supabase user and maps their profile metadata for the app. */
export async function getCurrentUser(): Promise<User | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Supabase Auth is not configured; rendering this request as signed out.");
    return null;
  }

  // Keep Next's request-time cookies() signal outside the catch so Next can
  // correctly mark authenticated pages as dynamic during production builds.
  const supabase = await createClient();
  let user: SupabaseUser;
  try {
    const result = await supabase.auth.getUser();
    if (result.error || !result.data.user) return null;
    user = result.data.user;
  } catch (error) {
    // Public browsing should remain available during an Auth configuration or
    // network outage. Authenticated actions still require verified Supabase.
    console.error("Supabase Auth is unavailable while reading the current user", error);
    return null;
  }

  const metadata = user.user_metadata ?? {};
  const name = typeof metadata.name === "string" && metadata.name.trim()
    ? metadata.name.trim()
    : user.email?.split("@")[0] || "Bazaar member";

  return {
    id: user.id,
    email: user.email ?? "",
    name,
    country: typeof metadata.country === "string" ? metadata.country : "NG",
    county: typeof metadata.county === "string" ? metadata.county : "",
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    bio: typeof metadata.bio === "string" ? metadata.bio : "",
    avatarColor: AVATAR_COLORS[name.length % AVATAR_COLORS.length],
    createdAt: user.created_at,
    cart: Array.isArray(metadata.cart)
      ? metadata.cart.filter((slug: unknown): slug is string => typeof slug === "string").slice(0, 100)
      : [],
    favorites: Array.isArray(metadata.favorites)
      ? metadata.favorites.filter((slug: unknown): slug is string => typeof slug === "string").slice(0, 500)
      : [],
  };
}

/** Only allow same-site relative redirects. */
export function safeNext(value: FormDataEntryValue | null | undefined, fallback = "/profile"): string {
  const next = typeof value === "string" ? value.trim() : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
