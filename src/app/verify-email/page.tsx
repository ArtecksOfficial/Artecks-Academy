"use client";
// The link in the verification email (/verify-email?uid=…&token=…) lands here.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function VerifyEmailPage() {
  const zh = useLanguage().locale === "zh";
  const [state, setState] = useState<"working" | "ok" | "bad">("working");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const uid = q.get("uid");
    const token = q.get("token");
    if (!uid || !token) { setState("bad"); return; }
    fetch(`/api/auth/verify-email?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`)
      .then((r) => setState(r.ok ? "ok" : "bad"))
      .catch(() => setState("bad"));
  }, []);

  return (
    <div className="min-h-screen bg-[#0E1E3A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-6">{state === "ok" ? "✅" : state === "bad" ? "⚠️" : "⏳"}</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          {state === "working" && (zh ? "正在驗證…" : "Verifying…")}
          {state === "ok" && (zh ? "電子郵件已驗證" : "Email verified")}
          {state === "bad" && (zh ? "這個連結無效或已過期" : "This link didn't work")}
        </h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          {state === "ok" && (zh ? "現在可以登入你的帳號了。" : "You can sign in now.")}
          {state === "bad" && (zh ? "請到登入頁面，按「重新寄送驗證信」取得新的連結。" : "Go to the sign-in page and tap “Resend verification email” for a new link.")}
        </p>
        {state !== "working" && (
          <Link href="/login" className="inline-block bg-[#C49A4A] hover:bg-[#D4AE63] text-[#0E1E3A] font-bold py-3 px-8 rounded-xl transition-colors text-sm">
            {zh ? "前往登入" : "Sign in"}
          </Link>
        )}
      </div>
    </div>
  );
}
