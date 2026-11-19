"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProduct } from "@/lib/db";
import { getDurableProduct } from "@/lib/durable-products";
import { createClient } from "@/lib/supabase/server";

export type FavoriteState = { error?: string; saved?: boolean };

export async function toggleFavoriteAction(_state: FavoriteState, formData: FormData): Promise<FavoriteState> {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) || slug.length > 120) {
    return { error: "That listing could not be found." };
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/listing/${slug}`)}`);

  const product = getProduct(slug) ?? await getDurableProduct(slug);
  if (!product) return { error: "That listing is no longer available." };

  const favorites = new Set(user.favorites ?? []);
  const saved = !favorites.has(slug);
  if (saved) {
    if (favorites.size >= 500) return { error: "You have reached the 500 saved listing limit." };
    favorites.add(slug);
  } else {
    favorites.delete(slug);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { favorites: [...favorites] } });
  if (error) return { error: "Your saved listings could not be updated. Please try again." };

  revalidatePath("/favorites");
  revalidatePath(`/listing/${slug}`);
  return { saved };
}
