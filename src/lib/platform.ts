// ─── Build-target helpers ─────────────────────────────────────────────────────
// IS_NATIVE_BUILD is true only in the static iOS bundle (BUILD_TARGET=ios).
// It is inlined at build time, so the web build tree-shakes the native branches.

export const IS_NATIVE_BUILD = process.env.NEXT_PUBLIC_BUILD_TARGET === "ios";

/** The deployed web app. The iOS bundle sends /api/* calls and payment pages here. */
export const WEB_ORIGIN = (
  process.env.NEXT_PUBLIC_ACADEMY_URL || "https://academy.artecks.com"
).replace(/\/+$/, "");

/** Absolute URL on the web app in the iOS build; unchanged path on the web. */
export function webUrl(path: string): string {
  return IS_NATIVE_BUILD ? `${WEB_ORIGIN}${path}` : path;
}

/** Origin to use in links that leave the app (share links, payment return URLs). */
export function publicOrigin(): string {
  if (IS_NATIVE_BUILD || typeof window === "undefined") return WEB_ORIGIN;
  return window.location.origin;
}

const q = (v: string | number) => encodeURIComponent(String(v));

// Routes with a runtime id. A static export can't pre-render /session/123, so
// the iOS build serves them as /session/?id=123 (see the page.ios.tsx files).
export const routes = {
  session: (id: string | number) =>
    IS_NATIVE_BUILD ? `/session/?id=${q(id)}` : `/session/${id}`,
  report: (bookingId: string | number) =>
    IS_NATIVE_BUILD ? `/report/?id=${q(bookingId)}` : `/report/${bookingId}`,
  feedback: (bookingId: string | number, token: string) =>
    IS_NATIVE_BUILD
      ? `/feedback/?id=${q(bookingId)}&t=${q(token)}`
      : `/feedback/${bookingId}?t=${q(token)}`,
  // A coach's own page (iOS: coach-profile/page.ios.tsx).
  coach: (c: { id: number; slug?: string | null }): string => {
    const key = c.slug || String(c.id);
    return IS_NATIVE_BUILD ? `/coach-profile/?id=${q(key)}` : `/coaches/${key}`;
  },
  join: (token: string) =>
    IS_NATIVE_BUILD ? `/join/?token=${q(token)}` : `/join/${token}`,
};
