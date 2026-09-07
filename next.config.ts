import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/bookings",
        destination: "/bookings/mine",
        permanent: true,
      },
    ];
  },
  // output: "standalone" — removed: incompatible with `next start` on Railway
  // academy.artecks.com is a standalone subdomain micro-app
  // No image domains needed for v1 (all assets are inline/Tailwind)
  images: {
    remotePatterns: [],
  },
  // Allow the Artecks core API to be called from Server Actions
  // without triggering the default CSP fetch restrictions
  experimental: {
    serverActions: {
      allowedOrigins: [
        "academy.artecks.com",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
