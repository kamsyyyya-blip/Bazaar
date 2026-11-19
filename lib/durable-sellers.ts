import "server-only";
import type { Product, Seller } from "@/lib/db";
import { sellerSlug } from "@/lib/db";
import { listDurableProducts } from "@/lib/durable-products";
import { listDurableSellerReviews } from "@/lib/durable-reviews";

const AVATAR_COLORS = ["#3778c2", "#ab5a42", "#738354", "#986b9c", "#c18436"];

function buildSeller(products: Product[]): Seller | null {
  if (products.length === 0) return null;

  const sorted = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const first = sorted[0];
  const name = first.seller;
  const categories = [...new Set(sorted.map((product) => product.categoryName))];
  const rating = Math.round((sorted.reduce((total, product) => total + product.rating, 0) / sorted.length) * 10) / 10;
  const reviews = sorted.reduce((total, product) => total + product.reviews, 0);
  const joined = sorted.reduce(
    (earliest, product) => (product.createdAt < earliest ? product.createdAt : earliest),
    first.createdAt,
  );

  return {
    slug: sellerSlug(name),
    name,
    location: first.location,
    county: first.county,
    verified: sorted.every((product) => product.verified),
    rating,
    reviews,
    listings: sorted.length,
    categories,
    joined,
    bio: `${name} is an independent seller based in ${first.location}. They list ${categories
      .slice(0, 3)
      .join(", ")
      .toLowerCase()} to buyers around ${first.county}. Expect honest descriptions, quick replies and careful packing.`,
    avatarColor: AVATAR_COLORS[name.length % AVATAR_COLORS.length],
    products: sorted,
  };
}

export function mergeSellerProfiles(...profiles: Array<Seller | null>): Seller | null {
  const products = new Map<string, Product>();
  for (const profile of profiles) {
    for (const product of profile?.products ?? []) products.set(product.slug, product);
  }
  const merged = buildSeller([...products.values()]);
  return merged ?? profiles.find((profile): profile is Seller => profile !== null) ?? null;
}

export function getDurableSellerForListing(product: Product): Seller {
  return {
    slug: sellerSlug(product.seller),
    name: product.seller,
    location: product.location,
    county: product.county,
    verified: product.verified,
    rating: product.rating,
    reviews: product.reviews,
    listings: 1,
    categories: [product.categoryName],
    joined: product.createdAt,
    bio: `${product.seller} is an independent seller based in ${product.location}. Browse their listing in ${product.categoryName.toLowerCase()} around ${product.county}.`,
    avatarColor: AVATAR_COLORS[product.seller.length % AVATAR_COLORS.length],
    products: [product],
  };
}

export async function getDurableSellerBySlug(slug: string): Promise<Seller | null> {
  const products = await listDurableProducts();
  const sellerProducts = products.filter((product) => sellerSlug(product.seller) === slug);
  return buildSeller(sellerProducts);
}

export async function getDurableSellerReviews(seller: Seller) {
  return listDurableSellerReviews(seller.products.map((product) => product.slug), 4);
}
