// ─── iOS bundle: send relative /api/* fetches to the web app ─────────────────
// The static iOS build has no server, so fetch("/api/foo") would hit
// capacitor://localhost/api/foo and fail. This patches window.fetch once, at
// module load (before any component effect runs), to rewrite those calls to
// WEB_ORIGIN, where the same route handlers run. No-op on the web build.

import { IS_NATIVE_BUILD, WEB_ORIGIN } from "./platform";

type PatchedWindow = Window & { __artecksFetchPatched?: boolean };

function rewrite(url: string): string | null {
  if (url.startsWith("/api/")) return `${WEB_ORIGIN}${url}`;
  try {
    const u = new URL(url);
    if (u.origin === window.location.origin && u.pathname.startsWith("/api/")) {
      return `${WEB_ORIGIN}${u.pathname}${u.search}`;
    }
  } catch {
    /* not an absolute URL */
  }
  return null;
}

if (IS_NATIVE_BUILD && typeof window !== "undefined") {
  const w = window as PatchedWindow;
  if (!w.__artecksFetchPatched) {
    w.__artecksFetchPatched = true;
    const original = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string") {
        return original(rewrite(input) ?? input, init);
      }
      if (input instanceof URL) {
        const r = rewrite(input.toString());
        return original(r ?? input, init);
      }
      const r = rewrite(input.url);
      return original(r ? new Request(r, input) : input, init);
    };
  }
}

export {};
