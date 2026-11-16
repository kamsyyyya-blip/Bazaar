import { list, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/db";

const PRODUCT_PREFIX = "bazaar/listings/";
const blobStorageConfigured = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<Product>;
  return (
    typeof product.slug === "string" &&
    typeof product.title === "string" &&
    typeof product.description === "string" &&
    typeof product.category === "string" &&
    typeof product.seller === "string" &&
    typeof product.price === "number" &&
    typeof product.categoryName === "string" &&
    typeof product.county === "string" &&
    typeof product.country === "string" &&
    Array.isArray(product.images) &&
    product.images.every((image) => typeof image === "string")
  );
}

async function readProduct(url: string): Promise<Product | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    const value: unknown = await response.json();
    return isProduct(value) ? value : null;
  } catch {
    return null;
  }
}

export async function saveDurableProduct(product: Product): Promise<void> {
  if (!blobStorageConfigured()) {
    throw new Error("A Vercel Blob store is not connected to this deployment.");
  }

  await put(`${PRODUCT_PREFIX}${product.slug}.json`, JSON.stringify(product), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });
}

const readDurableProductCached = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const pathname = `${PRODUCT_PREFIX}${slug}.json`;
      const result = await list({ prefix: pathname, limit: 10 });
      const blob = result.blobs.find((item) => item.pathname === pathname);
      return blob ? readProduct(blob.url) : null;
    } catch (error) {
      console.error("Could not read listing from durable storage", error);
      return null;
    }
  },
  ["bazaar-durable-product"],
  { revalidate: 60, tags: ["durable-products"] },
);

const listDurableProductsCached = unstable_cache(
  async (): Promise<Product[]> => {
    const products: Product[] = [];
    let cursor: string | undefined;

    try {
      do {
        const result = await list({ prefix: PRODUCT_PREFIX, limit: 1000, cursor });
        const page = await Promise.all(result.blobs.map((blob) => readProduct(blob.url)));
        products.push(...page.filter((product): product is Product => product !== null));
        cursor = result.hasMore ? result.cursor : undefined;
      } while (cursor);
    } catch (error) {
      console.error("Could not list products from durable storage", error);
    }

    return products;
  },
  ["bazaar-durable-products"],
  { revalidate: 60, tags: ["durable-products"] },
);

export async function getDurableProduct(slug: string): Promise<Product | null> {
  if (!blobStorageConfigured()) return null;
  return readDurableProductCached(slug);
}

export async function listDurableProducts(): Promise<Product[]> {
  if (!blobStorageConfigured()) return [];
  return listDurableProductsCached();
}
