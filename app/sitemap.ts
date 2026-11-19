import type { MetadataRoute } from "next";
import { listDurableProducts } from "@/lib/durable-products";

export const dynamic = "force-dynamic";

function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate = configured || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://bazaarr-lac.vercel.app");
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.hostname === "localhost" ? url.origin : "https://bazaarr-lac.vercel.app";
  } catch {
    return "https://bazaarr-lac.vercel.app";
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const products = await listDurableProducts();
  return [
    { url: origin, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/#trending`, changeFrequency: "daily", priority: 0.8 },
    ...products.map((product) => ({
      url: `${origin}/listing/${encodeURIComponent(product.slug)}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
