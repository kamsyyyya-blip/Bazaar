"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProduct, listCartProductSlugs, removeCartItem } from "@/lib/db";
import { getDurableProduct } from "@/lib/durable-products";
import { createClient } from "@/lib/supabase/server";

export type CartActionState = { error?: string; success?: string };

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Only allow same-site paths so the form cannot bounce people off Bazaar. */
function safeNext(value: string, fallback: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function addToCartAction(_state: CartActionState, formData: FormData): Promise<CartActionState> {
  const slug = text(formData, "slug");
  const next = safeNext(text(formData, "next"), slug ? `/listing/${slug}` : "/cart");
  const user = await getCurrentUser();

  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  if (!slug) return { error: "This listing could not be added. Refresh and try again." };

  const product = await getDurableProduct(slug) ?? getProduct(slug);
  if (!product) return { error: "This listing is no longer available." };
  if (product.status === "sold") return { error: "This item has already sold." };
  if (product.ownerId ? product.ownerId === String(user.id) : product.seller === user.name) {
    return { error: "You can’t add your own listing to the cart." };
  }

  const existingCart = new Set([...(user.cart ?? []), ...listCartProductSlugs(user.email)]);
  if (existingCart.size >= 100 && !existingCart.has(slug)) {
    return { error: "Your cart is full. Remove an item before adding another." };
  }
  existingCart.add(slug);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { cart: [...existingCart] } });
  if (error) return { error: "We couldn’t save this to your cart. Please try again." };

  revalidatePath("/", "layout");
  revalidatePath(`/listing/${slug}`);
  revalidatePath("/cart");
  return { success: "Added to your cart." };
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const slug = text(formData, "slug");
  const user = await getCurrentUser();

  if (!user) redirect(`/signin?next=${encodeURIComponent("/cart")}`);
  if (slug) {
    const cart = (user.cart ?? []).filter((item) => item !== slug);
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ data: { cart } });
    if (error) redirect("/cart?error=could-not-remove");
    removeCartItem(user.email, slug);
  }

  revalidatePath("/", "layout");
  redirect("/cart");
}
