import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "themusicuniverse.com",
      },
      {
        protocol: "https",
        hostname: "mtqqvkbpulvbxjtezcqy.supabase.co",
      },
    ],
  },
};

export default nextConfig;