"use client";
// Step 1 of a password reset: the parent enters their email and Django emails a link.

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ForgotPasswordPage() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else setError(zh ? "無法寄出重設信，請稍後再試。" : "We couldn't send the reset email. Please try again shortly.");
    } catch {
      setError(zh ? "連線失敗，請稍後再試。" : "Connection failed. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0d2a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Artecks" className="h-10 w-auto mx-auto mb-4 invert" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{zh ? "忘記密碼" : "Forgot your password?"}</h1>
          <p className="text-white/50 text-sm mt-1">
            {zh ? "輸入註冊時的 Email，我們會寄一封重設密碼的信給您。" : "Enter the email you signed up with and we'll send you a link to set a new password."}
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm px-4 py-4 rounded-xl leading-relaxed">
            {zh
              ? "如果這個 Email 有註冊帳號，重設密碼的信已經寄出。請查看收件匣（也請看一下垃圾信件匣）。"
              : "If that email has an account, a reset link is on its way. Check your inbox, and your spam folder too."}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? (zh ? "寄送中…" : "Sending…") : (zh ? "寄送重設連結" : "Send reset link")}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-white/40 mt-6">
          {zh ? "用 LINE 註冊的嗎？直接用 LINE 登入即可。" : "Signed up with LINE? Just log in with LINE instead."}{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            {zh ? "回到登入" : "Back to log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
