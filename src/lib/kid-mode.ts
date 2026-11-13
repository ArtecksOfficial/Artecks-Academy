// Kid Mode — a parent hands the device to a child.
//
// The backend issues a "kid token": the parent's login limited to play pages
// (no packages, no buying, no account settings). Leaving needs the parent PIN.
//
// Starting Kid Mode from this site:
//   1. get one kid token pair for chess.artecks.com
//   2. get a second pair for this site, which also retires the parent's token
//      on this device (so Back does not return to a logged-in parent)
//   3. open chess.artecks.com with pair 1 in the URL hash (#t=…), the same
//      hand-off the mini-games use. The hash never reaches a server.
// Two pairs because refresh tokens rotate: two sites sharing one would log
// each other out.

import { authHeaders, getRefreshToken, saveTokens } from "@/lib/auth-client";

/** The "Start Kid Mode" flow is hidden unless this is "true" at build time. */
export const KID_MODE_ENABLED = process.env.NEXT_PUBLIC_KID_MODE_ENABLED === "true";
export const CHESS_URL = (process.env.NEXT_PUBLIC_CHESS_URL ?? "https://chess.artecks.com").replace(/\/+$/, "");

const KEY = "artecks_kid_mode";

export interface KidSession { id: number; first_name: string }

export interface PinFailure {
  detail: string;
  attempts_left?: number;
  locked_until?: string;
}

export function getKidSession(): KidSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as KidSession) : null;
    return v && typeof v.id === "number" ? v : null;
  } catch {
    return null;
  }
}

async function post(path: string, body: unknown) {
  const r = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  }).catch(() => null);
  const data = r ? await r.json().catch(() => ({})) : {};
  return { ok: !!r?.ok, status: r?.status ?? 0, data };
}

/** Returns the chess URL to open, or an error code (pin_not_set, not_found, failed). */
export async function startKidMode(studentId: number): Promise<{ url?: string; error?: string }> {
  const forChess = await post("/api/kid-mode/enter", { student_id: studentId });
  if (!forChess.ok) return { error: forChess.data?.detail ?? "failed" };
  const forHere = await post("/api/kid-mode/enter", { student_id: studentId, refresh: getRefreshToken() });
  if (!forHere.ok) return { error: forHere.data?.detail ?? "failed" };

  saveTokens(forHere.data.access, forHere.data.refresh);
  const kid: KidSession = { id: forHere.data.kid.id, first_name: forHere.data.kid.first_name };
  localStorage.setItem(KEY, JSON.stringify(kid));

  const hash = new URLSearchParams({ t: forChess.data.access, r: forChess.data.refresh, kid: String(kid.id) });
  return { url: `${CHESS_URL}/#${hash.toString()}` };
}

/** Leave Kid Mode on this site with the parent PIN. Resolves to null on success. */
export async function exitKidMode(pin: string): Promise<PinFailure | null> {
  const r = await post("/api/kid-mode/exit", { pin, refresh: getRefreshToken() });
  if (!r.ok) return { detail: r.data?.detail ?? "failed", attempts_left: r.data?.attempts_left, locked_until: r.data?.locked_until };
  saveTokens(r.data.access, r.data.refresh);
  localStorage.removeItem(KEY);
  return null;
}

/** One sentence for a PIN error, in the page's language. */
export function pinErrorText(f: PinFailure, zh: boolean): string {
  switch (f.detail) {
    case "wrong_pin":
      return zh ? `PIN 不正確，還可以再試 ${f.attempts_left ?? 0} 次。` : `Wrong PIN. ${f.attempts_left ?? 0} ${f.attempts_left === 1 ? "try" : "tries"} left.`;
    case "pin_locked": {
      const at = f.locked_until ? new Date(f.locked_until).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
      return zh ? `錯誤次數過多，請在 ${at} 之後再試。` : `Too many wrong tries. Try again after ${at}.`;
    }
    case "wrong_password":
      return zh ? "密碼不正確。" : "That password is not right.";
    case "invalid_pin":
      return zh ? "PIN 需為 4 到 6 位數字。" : "The PIN must be 4 to 6 digits.";
    case "pin_not_set":
      return zh ? "請先設定家長 PIN。" : "Set a parent PIN first.";
    default:
      return zh ? "出了點問題，請再試一次。" : "Something went wrong. Please try again.";
  }
}
