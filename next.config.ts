import type { NextConfig } from "next";

// Two build targets share this codebase:
//   • web (default) — the full Next.js app on Vercel, including the /api/*
//     route handlers that proxy to the Django backend on Railway.
//   • ios (BUILD_TARGET=ios) — a static export in out/ that Capacitor bundles
//     into the iOS app. It has no server; its fetch("/api/...") calls are sent
//     to the deployed web app (see src/lib/native-fetch.ts).
//
// Files named *.web.ts(x) only exist in the web build and *.ios.ts(x) only in
// the iOS build (e.g. route.web.ts, page.ios.tsx). Plain .ts(x) files are shared.
const isIos = process.env.BUILD_TARGET === "ios";

// Origins allowed to call /api/* cross-origin. capacitor://localhost is the
// origin of the iOS app's WebView.
const NATIVE_APP_ORIGIN = "capacitor://localhost";

const webConfig: NextConfig = {
  pageExtensions: ["web.tsx", "web.ts", "tsx", "ts", "jsx", "js"],
  async redirects() {
    return [
      {
        // The old account page was folded into /dashboard and /settings.
        source: "/account",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/bookings",
        destination: "/bookings/mine",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: NATIVE_APP_ORIGIN },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type" },
          { key: "Access-Control-Max-Age", value: "86400" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
  // output: "standalone" — removed: incompatible with `next start` on Railway
  // academy.artecks.com is a standalone subdomain micro-app
  // No image domains needed for v1 (all assets are inline/Tailwind)
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "academy.artecks.com",
        "localhost:3000",
      ],
    },
  },
};

const iosConfig: NextConfig = {
  output: "export",
  // Directory-style output (sessions/index.html) — the iOS app's router in
  // ios/App/App/AppViewController.swift resolves /sessions to that file.
  trailingSlash: true,
  pageExtensions: ["ios.tsx", "ios.ts", "tsx", "ts", "jsx", "js"],
  images: { unoptimized: true },
  // Skip .next/dev/types from `next dev` (web target) — see tsconfig.ios.json.
  typescript: { tsconfigPath: "tsconfig.ios.json" },
  env: {
    NEXT_PUBLIC_BUILD_TARGET: "ios",
  },
};

export default isIos ? iosConfig : webConfig;
