import { NextResponse } from "next/server";
import { currencyForCountry } from "@/lib/currency";
import { getProduct, listCategories, listProducts, type Product } from "@/lib/db";
import { getDurableProduct, listDurableProducts } from "@/lib/durable-products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_RESULTS = 60;

function isMatchingDurableProduct(product: Product, query: string, category: string): boolean {
  if (product.status === "sold") return false;
  if (category && product.category !== category) return false;
  if (!query) return true;

  return [
    product.title,
    product.description,
    product.seller,
    product.location,
    product.county,
    product.categoryName,
    product.country,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function toPublicProduct(product: Product) {
  return {
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: product.price,
    currency: currencyForCountry(product.country),
    category: product.category,
    categoryName: product.categoryName,
    seller: product.seller,
    location: product.location,
    county: product.county,
    country: product.country,
    rating: product.rating,
    reviews: product.reviews,
    emoji: product.emoji,
    badge: product.badge,
    condition: product.condition,
    verified: product.verified,
    createdAt: product.createdAt,
    tintFrom: product.tintFrom,
    tintTo: product.tintTo,
    images: product.images.slice(0, 1),
  };
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const slug = searchParams.get("slug")?.trim() ?? "";
  const query = searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const category = searchParams.get("category")?.trim().slice(0, 80) ?? "";
  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "40", 10);
  const limit = Number.isFinite(parsedLimit) ? Math.min(MAX_RESULTS, Math.max(1, parsedLimit)) : 40;

  try {
    if (slug) {
      const product = getProduct(slug) ?? (await getDurableProduct(slug));
      if (!product || product.status === "sold") {
        return NextResponse.json({ error: "Listing not found." }, { status: 404 });
      }

      return NextResponse.json({ product: toPublicProduct(product) }, { headers: { "Cache-Control": "no-store" } });
    }

    const databaseProducts = listProducts({
      q: query,
      category,
      sort: "newest",
      imageMode: "cover",
      limit: MAX_RESULTS,
    });
    const databaseSlugs = new Set(databaseProducts.map((product) => product.slug));
    const durableProducts = (await listDurableProducts()).filter(
      (product) =>
        !databaseSlugs.has(product.slug) && isMatchingDurableProduct(product, query, category),
    );
    const products = [...databaseProducts, ...durableProducts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map(toPublicProduct);

    return NextResponse.json(
      { categories: listCategories(), products },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Could not load mobile marketplace listings", error);
    return NextResponse.json({ error: "Could not load listings. Please try again." }, { status: 500 });
  }
}
