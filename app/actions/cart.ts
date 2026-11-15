"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { addCartItem, getProduct, removeCartItem } from "@/lib/db";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Only allow same-site paths so the form cannot bounce people off Bazaar. */
function safeNext(value: string, fallback: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function addToCartAction(formData: FormData): Promise<void> {
  const slug = text(formData, "slug");
  const product = slug ? getProduct(slug) : null;
  const next = safeNext(text(formData, "next"), slug ? `/listing/${slug}` : "/cart");
  const user = await getCurrentUser();

  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  if (!product || product.seller === user.name) redirect(next);

  addCartItem(user.email, product.slug);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const slug = text(formData, "slug");
  const user = await getCurrentUser();

  if (!user) redirect(`/signin?next=${encodeURIComponent("/cart")}`);
  if (slug) removeCartItem(user.email, slug);

  revalidatePath("/", "layout");
  redirect("/cart");
}
