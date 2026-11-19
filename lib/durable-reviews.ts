import "server-only";
import { randomUUID } from "node:crypto";
import { list, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import type { Review } from "@/lib/db";

const REVIEW_PREFIX = "bazaar/reviews/";
const blobStorageConfigured = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

export type DurableReviewData = {
  reviews: Review[];
  count: number;
  averageRating: number;
};

function ratingFromPath(pathname: string): number {
  const filename = pathname.split("/").at(-1) ?? "";
  const rating = Number(filename.split("-", 1)[0]);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 0;
}

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false;
  const review = value as Partial<Review>;
  return (
    typeof review.id === "string" &&
    typeof review.productSlug === "string" &&
    typeof review.authorName === "string" &&
    Number.isInteger(review.rating) &&
    (review.rating ?? 0) >= 1 &&
    (review.rating ?? 0) <= 5 &&
    typeof review.body === "string" &&
    typeof review.createdAt === "string"
  );
}

async function readReview(url: string): Promise<Review | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    const value: unknown = await response.json();
    return isReview(value) ? value : null;
  } catch {
    return null;
  }
}

export async function saveDurableReview(input: {
  productSlug: string;
  authorName: string;
  rating: number;
  body: string;
}): Promise<void> {
  if (!blobStorageConfigured()) {
    throw new Error("A Vercel Blob store is not connected to this deployment.");
  }

  const id = randomUUID();
  const review: Review = {
    id,
    productSlug: input.productSlug,
    authorName: input.authorName,
    rating: input.rating,
    body: input.body,
    createdAt: new Date().toISOString(),
  };

  await put(`${REVIEW_PREFIX}${input.productSlug}/${input.rating}-${id}.json`, JSON.stringify(review), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  });
}

const getDurableReviewsCached = unstable_cache(
  async (productSlug: string, limit: number): Promise<DurableReviewData> => {
    const blobs: Awaited<ReturnType<typeof list>>["blobs"] = [];
    let cursor: string | undefined;

    try {
      do {
        const result = await list({ prefix: `${REVIEW_PREFIX}${productSlug}/`, limit: 1000, cursor });
        blobs.push(...result.blobs);
        cursor = result.hasMore ? result.cursor : undefined;
      } while (cursor);
    } catch (error) {
      console.error("Could not list durable reviews", error);
      return { reviews: [], count: 0, averageRating: 0 };
    }

    const ratings = blobs.map((blob) => ratingFromPath(blob.pathname)).filter((rating) => rating > 0);
    const recent = blobs
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, limit);
    const reviews = (await Promise.all(recent.map((blob) => readReview(blob.url))))
      .filter((review): review is Review => review !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      reviews,
      count: ratings.length,
      averageRating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0,
    };
  },
  ["bazaar-durable-reviews"],
  { revalidate: 3600, tags: ["durable-reviews"] },
);

export async function getDurableReviews(productSlug: string, limit = 20): Promise<DurableReviewData> {
  if (!blobStorageConfigured()) return { reviews: [], count: 0, averageRating: 0 };
  return getDurableReviewsCached(productSlug, Math.max(1, Math.min(100, Math.floor(limit))));
}

const listDurableSellerReviewsCached = unstable_cache(
  async (productSlugs: string[], limit: number): Promise<DurableReviewData> => {
    const wanted = new Set(productSlugs);
    const blobs: Awaited<ReturnType<typeof list>>["blobs"] = [];
    let cursor: string | undefined;

    try {
      do {
        const result = await list({ prefix: REVIEW_PREFIX, limit: 1000, cursor });
        blobs.push(...result.blobs);
        cursor = result.hasMore ? result.cursor : undefined;
      } while (cursor);
    } catch (error) {
      console.error("Could not list durable seller reviews", error);
      return { reviews: [], count: 0, averageRating: 0 };
    }

    const sellerBlobs = blobs.filter((blob) => {
        const productSlug = blob.pathname.slice(REVIEW_PREFIX.length).split("/", 1)[0];
        return wanted.has(productSlug);
      });
    const ratings = sellerBlobs.map((blob) => ratingFromPath(blob.pathname)).filter((rating) => rating > 0);
    const recent = sellerBlobs
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, limit);

    const reviews = (await Promise.all(recent.map((blob) => readReview(blob.url))))
      .filter((review): review is Review => review !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      reviews,
      count: ratings.length,
      averageRating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0,
    };
  },
  ["bazaar-durable-seller-reviews"],
  { revalidate: 3600, tags: ["durable-reviews"] },
);

export async function listDurableSellerReviews(productSlugs: string[], limit = 4): Promise<DurableReviewData> {
  if (!blobStorageConfigured() || productSlugs.length === 0) {
    return { reviews: [], count: 0, averageRating: 0 };
  }
  return listDurableSellerReviewsCached([...new Set(productSlugs)].sort(), Math.max(1, Math.min(100, Math.floor(limit))));
}
