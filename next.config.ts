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
      {
        protocol: "https",
        hostname: "s1.ticketm.net",
      },
    ],
  },
};

export default nextConfig;