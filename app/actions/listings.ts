"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createProduct, deleteProduct, listCategories } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CONDITIONS } from "@/lib/filters";
import { HOME_COUNTRY, isCountryCode } from "@/lib/countries";
import { currencyForCountry, toMinorUnits } from "@/lib/currency";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_PHOTO_TOTAL_BYTES, isAllowedPhotoType } from "@/lib/photos";
import { removeProductImages, saveProductImages } from "@/lib/uploads";
import { saveDurableProduct } from "@/lib/durable-products";

export type SellState = { error?: string };

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createListingAction(_state: SellState, formData: FormData): Promise<SellState> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent("/sell")}`);

  const title = text(formData, "title");
  const description = text(formData, "description");
  const categorySlug = text(formData, "category");
  const condition = text(formData, "condition");
  const location = text(formData, "location");
  const county = text(formData, "county");
  const rawCountry = text(formData, "country").toUpperCase();
  const country = isCountryCode(rawCountry) ? rawCountry : user.country || HOME_COUNTRY;
  const priceInput = text(formData, "price").replace(/[$,\s]/g, "");
  const priceAmount = Number(priceInput);
  const currency = currencyForCountry(country);
  const price = toMinorUnits(priceAmount, currency);

  if (title.length < 4) return { error: "Give your listing a title with at least 4 characters." };
  if (title.length > 90) return { error: "Keep the title under 90 characters." };
  if (description.length < 20) {
    return { error: "Add a description of at least 20 characters so buyers know what to expect." };
  }
  if (description.length > 2000) return { error: "Keep the description under 2,000 characters." };

  const category = listCategories().find((item) => item.slug === categorySlug);
  if (!category) return { error: "Choose a category for your listing." };

  if (!Number.isFinite(priceAmount) || priceAmount < 1 || priceAmount > 1_000_000_000) {
    return { error: `Enter a price between 1 and 1,000,000,000 ${currency}.` };
  }

  if (location.length < 2) return { error: "Add the city buyers can collect from." };
  if (location.length > 80) return { error: "Keep the city under 80 characters." };
  if (county.length < 2) return { error: "Add the state or province your listing is in." };
  if (county.length > 90) return { error: "Keep the state or province under 90 characters." };
  if (!CONDITIONS.includes(condition as (typeof CONDITIONS)[number])) {
    return { error: "Choose the condition of your item." };
  }

  const photoEntries = formData.getAll("images");
  const photos = photoEntries.filter(
    (entry): entry is File => entry instanceof File && entry.size > 0,
  );

  if (photos.length > MAX_PHOTOS) {
    return { error: `Add up to ${MAX_PHOTOS} photos per listing.` };
  }
  if (photos.reduce((total, photo) => total + photo.size, 0) > MAX_PHOTO_TOTAL_BYTES) {
    return { error: "Keep all photos together under 4 MB so the listing can upload successfully." };
  }
  for (const photo of photos) {
    if (!isAllowedPhotoType(photo.type)) {
      return { error: "Photos must be JPG, PNG, WebP or GIF images." };
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: "Each photo must be 6 MB or smaller." };
    }
  }

  let imageNames: string[] = [];
  try {
    imageNames = await saveProductImages(photos);
  } catch {
    return { error: "We couldn't save those photos. Try smaller JPG or PNG files." };
  }

  let product: ReturnType<typeof createProduct>;
  try {
    const created = createProduct({
      title,
      description,
      price,
      category: category.slug,
      seller: user.name,
      location,
      county,
      country,
      condition,
      emoji: category.emoji,
      tintFrom: category.tintFrom,
      tintTo: category.tintTo,
      images: imageNames,
    });
    product = { ...created, ownerId: String(user.id), status: "active" };
  } catch (error) {
    console.error("Failed to create listing", error);
    try { await removeProductImages(imageNames); } catch (cleanupError) {
      console.error("Failed to clean up listing photos", cleanupError);
    }
    return { error: "Your listing could not be saved. Please try again in a moment." };
  }

  try {
    await saveDurableProduct(product);
  } catch (error) {
    console.error("Failed to save listing to durable storage", error);
    deleteProduct(product.slug);
    try { await removeProductImages(imageNames); } catch (cleanupError) {
      console.error("Failed to clean up listing photos", cleanupError);
    }
    return { error: "We couldn't keep this listing online. Please try again in a moment." };
  }

  updateTag("durable-products");
  revalidatePath("/", "layout");
  redirect(`/listing/${product.slug}`);
}
