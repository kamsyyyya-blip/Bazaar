"use server";

import { revalidatePath } from "next/cache";
import { createReview, getProduct, sellerSlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export type ReviewState = { error?: string; success?: boolean };

export async function addReviewAction(_state: ReviewState, formData: FormData): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Sign in to leave a review." };
  }

  const slug = String(formData.get("slug") ?? "");
  const product = getProduct(slug);
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

  createReview({
    productSlug: slug,
    authorName: user.name,
    authorEmail: user.email,
    rating,
    body,
  });

  revalidatePath(`/listing/${slug}`);
  revalidatePath(`/seller/${sellerSlug(product.seller)}`);

  return { success: true };
}
