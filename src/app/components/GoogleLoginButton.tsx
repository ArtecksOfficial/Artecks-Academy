"use client";
// "Continue with Google" (Academy) — same popup flow as the store (implicit token → /api/auth/google/).
// In-app browsers (LINE, Facebook…) block Google sign-in, so we send people to a real browser.
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState, type ReactNode } from "react";


const CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

export function GoogleProvider({ children }: { children: ReactNode }) {
  return CLIENT_ID ? <GoogleOAuthProvider clientId={CLIENT_ID}>{children}</GoogleOAuthProvider> : <>{children}</>;
}

function inAppBrowser() {
  const ua = navigator.userAgent;
  const iosWebView = /iPhone|iPad|iPod/.test(ua) && /AppleWebKit/.test(ua) && !/Safari\//.test(ua);
  const app = /FBAN|FBAV|Instagram|Line\/|TikTok/i.test(ua) || (/Android/.test(ua) && /\bwv\b/.test(ua));
  return { blocked: iosWebView || app, line: /Line\//i.test(ua) };
}

const Icon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C33.9 7.9 29.2 6 24 6 13 6 4 15 4 26s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C33.9 7.9 29.2 6 24 6 16.3 6 9.7 9.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 46c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.8-4.5 2.9-7.2 2.9-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 46 24 46z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C38.7 36.5 44 30.7 44 26c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

const cls = "w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#F6F4EF] py-3 text-sm font-bold text-[#0E1E3A] disabled:opacity-60 transition-colors";

function Inner({ onToken, onError }: { onToken: (t: string) => void; onError: (m: string) => void }) {
  const t = (en: string, zh: string) => `${en} · ${zh}`;
  const [env, setEnv] = useState<{ blocked: boolean; line: boolean } | null>(null);
  useEffect(() => setEnv(inAppBrowser()), []);
  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: (r) => onToken(r.access_token),
    onError: () => onError(t("Google sign-in was cancelled.", "已取消 Google 登入。")),
    onNonOAuthError: () => onError(t("Google sign-in couldn't finish. Try again.", "Google 登入未完成，請再試一次。")),
  });
  if (!env) return null;
  if (env.line) {
    return (
      <button type="button" className={cls} onClick={() => {
        const u = new URL(location.href); u.searchParams.set("openExternalBrowser", "1"); location.href = u.toString();
      }}>
        <Icon /> {t("Open in your browser to use Google", "用瀏覽器開啟才能使用 Google 登入")}
      </button>
    );
  }
  if (env.blocked) {
    return <p className="text-center text-xs text-white/50">{t("To use Google, open this page in Safari or Chrome.", "要用 Google 登入，請在 Safari 或 Chrome 開啟此頁。")}</p>;
  }
  return <button type="button" className={cls} onClick={() => login()}><Icon /> {t("Continue with Google", "使用 Google 登入")}</button>;
}

export default function GoogleButton(props: { onToken: (t: string) => void; onError: (m: string) => void }) {
  return CLIENT_ID ? <Inner {...props} /> : null;
}
