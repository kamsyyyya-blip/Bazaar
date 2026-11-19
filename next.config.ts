import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Listing uploads are capped at 4 MB total; allow multipart overhead only.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
