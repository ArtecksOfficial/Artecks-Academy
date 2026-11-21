// ─── Referral links (/book?ref=CODE) ──────────────────────────────────────────
// A parent who opens someone's link keeps the code for 30 days, so it still counts
// if they look around first and book or buy a package later.

const KEY = "artecks_ref";
const DAYS = 30;

export function captureRef(): string {
  if (typeof window === "undefined") return "";
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref") ?? "";
    if (/^[A-Za-z0-9]{4,12}$/.test(fromUrl)) {
      const code = fromUrl.toUpperCase();
      localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
      return code;
    }
    const raw = localStorage.getItem(KEY);
    if (!raw) return "";
    const { code, at } = JSON.parse(raw) as { code: string; at: number };
    if (Date.now() - at > DAYS * 86_400_000) {
      localStorage.removeItem(KEY);
      return "";
    }
    return code || "";
  } catch {
    return "";
  }
}

export interface RefCheck { valid: boolean; code?: string; from_name?: string; half_lesson_twd?: number }
export interface MyReferral {
  url: string | null;
  code: string | null;
  rewards_available: number;
  free_lessons_available: number;
  families_joined: number;
  half_lesson_twd: number;
  welcome_available: boolean;
}

export async function checkRef(code: string): Promise<RefCheck> {
  if (!code) return { valid: false };
  try {
    const r = await fetch(`/api/referrals/check?ref=${encodeURIComponent(code)}`);
    return r.ok ? await r.json() : { valid: false };
  } catch {
    return { valid: false };
  }
}

export async function myReferral(headers: Record<string, string>, code = ""): Promise<MyReferral | null> {
  try {
    const r = await fetch(`/api/referrals/mine${code ? `?ref=${encodeURIComponent(code)}` : ""}`, { headers });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
