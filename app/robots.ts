import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = configured || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://bazaarr-lac.vercel.app");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/settings", "/cart", "/favorites", "/messages", "/my-listings", "/signin"],
    },
    sitemap: `${origin.replace(/\/$/, "")}/sitemap.xml`,
  };
}
