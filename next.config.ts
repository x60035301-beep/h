import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/purchase-orders/[id]/pdf": ["./assets/fonts/NotoSansCJKsc-Regular.otf"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
