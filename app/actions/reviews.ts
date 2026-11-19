"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createReview, getProduct, sellerSlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDurableProduct } from "@/lib/durable-products";
import { saveDurableReview } from "@/lib/durable-reviews";

export type ReviewState = { error?: string; success?: boolean };

export async function addReviewAction(_state: ReviewState, formData: FormData): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Sign in to leave a review." };
  }

  const slug = String(formData.get("slug") ?? "");
  const durableProduct = await getDurableProduct(slug);
  const product = durableProduct ?? getProduct(slug);
  if (!product) {
    return { error: "That listing is no longer available." };
  }

  const rating = Number(formData.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 12) {
    return { error: "Tell buyers a little more — at least 12 characters." };
  }
  if (body.length > 800) {
    return { error: "Keep your review under 800 characters." };
  }

  try {
    if (durableProduct) {
      await saveDurableReview({
        productSlug: product.slug,
        authorName: user.name,
        rating,
        body,
      });
      updateTag("durable-reviews");
    } else {
      createReview({
        productSlug: product.slug,
        authorName: user.name,
        authorEmail: user.email,
        rating,
        body,
      });
    }
  } catch (error) {
    console.error("Failed to save review", error);
    return { error: "Your review could not be saved. Please try again." };
  }

  revalidatePath(`/listing/${product.slug}`);
  revalidatePath(`/seller/${sellerSlug(product.seller)}`);

  return { success: true };
}
