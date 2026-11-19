"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { deleteProduct, listCategories, sellerSlug } from "@/lib/db";
import { currencyForCountry, toMinorUnits } from "@/lib/currency";
import { deleteDurableProduct, getDurableProduct, updateDurableProduct } from "@/lib/durable-products";
import { CONDITIONS } from "@/lib/filters";
import { removeProductImages } from "@/lib/uploads";

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function ownedListing(slug: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/my-listings")}`);
  const product = await getDurableProduct(slug);
  if (!product || product.ownerId !== String(user.id)) return { user, product: null };
  return { user, product };
}

export type SellerListingState = { error?: string; success?: string };

export async function updateListingAction(_state: SellerListingState, formData: FormData): Promise<SellerListingState> {
  const slug = value(formData, "slug");
  const { product } = await ownedListing(slug);
  if (!product) return { error: "This listing is unavailable or does not belong to your account." };

  const title = value(formData, "title");
  const description = value(formData, "description");
  const priceInput = value(formData, "price").replace(/[,$\s]/g, "");
  const amount = Number(priceInput);
  const category = listCategories().find((item) => item.slug === value(formData, "category"));
  const condition = value(formData, "condition");
  const location = value(formData, "location");
  const county = value(formData, "county");
  if (title.length < 4 || title.length > 90) return { error: "The title must be 4 to 90 characters." };
  if (description.length < 20 || description.length > 2000) return { error: "The description must be 20 to 2,000 characters." };
  if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000_000) return { error: "Enter a valid price." };
  if (!category) return { error: "Choose a valid category." };
  if (!CONDITIONS.includes(condition as (typeof CONDITIONS)[number])) return { error: "Choose an item condition." };
  if (location.length < 2 || location.length > 80 || county.length < 2 || county.length > 90) return { error: "Enter a valid city and state or province." };

  try {
    await updateDurableProduct({
      ...product,
      title,
      description,
      price: toMinorUnits(amount, currencyForCountry(product.country)),
      category: category.slug,
      categoryName: category.name,
      emoji: category.emoji,
      tintFrom: category.tintFrom,
      tintTo: category.tintTo,
      condition,
      location,
      county,
    });
  } catch (error) {
    console.error("Could not update listing", error);
    return { error: "Your changes could not be saved. Please try again." };
  }
  updateTag("durable-products");
  revalidatePath("/");
  revalidatePath(`/listing/${slug}`);
  revalidatePath(`/seller/${sellerSlug(product.seller)}`);
  revalidatePath("/my-listings");
  return { success: "Listing updated." };
}

export async function setListingStatusAction(formData: FormData): Promise<void> {
  const slug = value(formData, "slug");
  const status = value(formData, "status");
  if (status !== "active" && status !== "sold") return;
  const { product } = await ownedListing(slug);
  if (!product) return;
  await updateDurableProduct({ ...product, status });
  updateTag("durable-products");
  revalidatePath("/");
  revalidatePath(`/listing/${slug}`);
  revalidatePath("/my-listings");
}

export async function deleteListingAction(formData: FormData): Promise<void> {
  const slug = value(formData, "slug");
  const { product } = await ownedListing(slug);
  if (!product) return;
  await deleteDurableProduct(slug);
  deleteProduct(slug);
  try {
    await removeProductImages(product.images);
  } catch (error) {
    console.error("Listing removed but its stored images could not be removed", error);
  }
  updateTag("durable-products");
  revalidatePath("/");
  revalidatePath("/my-listings");
  revalidatePath(`/seller/${sellerSlug(product.seller)}`);
}
