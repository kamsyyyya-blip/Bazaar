import { createClient } from "@/lib/supabase/server";
import type { User } from "./db";

const AVATAR_COLORS = ["#3778c2", "#ab5a42", "#738354", "#986b9c", "#c18436"];

/** Reads a verified Supabase user and maps their profile metadata for the app. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

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
  };
}

/** Only allow same-site relative redirects. */
export function safeNext(value: FormDataEntryValue | null | undefined, fallback = "/profile"): string {
  const next = typeof value === "string" ? value.trim() : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
