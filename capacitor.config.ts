import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.artecks.academy",
  appName: "Artecks Academy",
  // Static export from `npm run build:ios` (BUILD_TARGET=ios next build).
  webDir: "out",
  server: {
    // The WebView origin is capacitor://localhost. next.config.ts (web build)
    // allows exactly this origin on /api/*; change both together.
    iosScheme: "capacitor",
    hostname: "localhost",
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
