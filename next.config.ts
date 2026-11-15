import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Up to 5 listing photos of 6 MB each, plus multipart overhead.
      bodySizeLimit: "32mb",
    },
  },
};

export default nextConfig;
