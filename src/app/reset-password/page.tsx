"use client";
// Step 2 of a password reset: the emailed link (/reset-password?uid=…&token=…) lands here.

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ResetPasswordPage() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setUid(q.get("uid") ?? "");
    setToken(q.get("token") ?? "");
    setReady(true);
  }, []);

  const badLink = ready && (!uid || !token);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(zh ? "兩次輸入的密碼不一樣。" : "The two passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: password }),
      });
      if (res.ok) { setDone(true); return; }
      const data = await res.json().catch(() => ({}));
      // Django returns either { detail } or { new_password: [reasons] }.
      const reasons = Array.isArray(data?.new_password) ? data.new_password.join(" ") : "";
      if (reasons) setError(reasons);
      else setError(zh ? "這個重設連結已失效，請重新申請。" : "This reset link is no longer valid. Please request a new one.");
    } catch {
      setError(zh ? "連線失敗，請稍後再試。" : "Connection failed. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors";

  return (
    <div className="min-h-screen bg-[#0E1E3A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Artecks" className="h-10 w-auto mx-auto mb-4 invert" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{zh ? "設定新密碼" : "Set a new password"}</h1>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm px-4 py-4 rounded-xl">
              {zh ? "密碼已更新，請用新密碼登入。" : "Your password has been updated. Log in with the new one."}
            </div>
            <Link href="/login" className="block w-full bg-[#C49A4A] hover:bg-[#D4AE63] text-[#0E1E3A] font-bold text-center font-semibold py-3 rounded-xl transition-colors text-sm">
              {zh ? "前往登入" : "Go to log in"}
            </Link>
          </div>
        ) : badLink ? (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-4 rounded-xl">
              {zh ? "這個連結不完整或已失效。" : "This link is incomplete or no longer valid."}
            </div>
            <Link href="/forgot-password" className="block w-full bg-[#C49A4A] hover:bg-[#D4AE63] text-[#0E1E3A] font-bold text-center font-semibold py-3 rounded-xl transition-colors text-sm">
              {zh ? "重新申請重設連結" : "Request a new link"}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "新密碼" : "New password"}</label>
              <input id="new-password" type="password" required minLength={8} autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "再輸入一次" : "Type it again"}</label>
              <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
            </div>
            <button type="submit" disabled={loading || !ready}
              className="w-full bg-[#C49A4A] hover:bg-[#D4AE63] disabled:opacity-50 disabled:cursor-not-allowed text-[#0E1E3A] font-bold font-semibold py-3 rounded-xl transition-colors text-sm">
              {loading ? (zh ? "儲存中…" : "Saving…") : (zh ? "儲存新密碼" : "Save new password")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
