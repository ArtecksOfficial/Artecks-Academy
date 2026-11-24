"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthContext";
import LineLoginButton from "@/app/components/LineLoginButton";
import GoogleLoginButton, { GoogleProvider } from "@/app/components/GoogleLoginButton";
import { saveAuth } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const { login } = useAuth();
  const zh = useLanguage().locale === "zh";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState<"" | "sending" | "sent" | "failed">("");

  async function resend() {
    setResent("sending");
    const r = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setResent(r?.ok ? "sent" : "failed");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setResent("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      // Only same-site relative paths, e.g. /login?next=/coach
      const next = new URLSearchParams(window.location.search).get("next") ?? "";
      router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } else {
      setUnverified(/verif/i.test(result.error ?? ""));
      setError(zh
        ? (/verif/i.test(result.error ?? "") ? "請先點開驗證信，完成電子郵件驗證。" : "電子郵件或密碼不正確，請再試一次。")
        : (result.error ?? "Login failed."));
    }
  }

  async function handleGoogle(accessToken: string) {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && d.access && d.refresh && d.user) {
      saveAuth(d.access, d.refresh, d.user);
      const next = new URLSearchParams(window.location.search).get("next") ?? "";
      window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
      return;
    }
    setLoading(false);
    setError(d.detail || (zh ? "Google 登入失敗，請再試一次。" : "Google sign-in didn't work. Please try again."));
  }

  return (
    <div className="min-h-screen bg-[#0E1E3A] flex items-center justify-center px-4">
      {/* Logo */}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Artecks" className="h-10 w-auto mx-auto mb-4 invert" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{zh ? "歡迎回來" : "Welcome back"}</h1>
          <p className="text-white/50 text-sm mt-1">{zh ? "登入你的 Artecks 學院帳號" : "Sign in to your Artecks Academy account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
              {unverified && (
                <div className="mt-3">
                  {resent === "sent" ? (
                    <p className="text-emerald-300">
                      {zh ? `已寄出新的驗證信到 ${email}，請查看收件匣（和垃圾信件匣）。` : `New link sent to ${email}. Check your inbox (and spam).`}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={resend}
                      disabled={resent === "sending" || !email}
                      className="font-semibold text-[#E7C98A] underline underline-offset-2 disabled:opacity-50"
                    >
                      {resent === "sending" ? (zh ? "寄送中…" : "Sending…") : (zh ? "重新寄送驗證信" : "Resend verification email")}
                    </button>
                  )}
                  {resent === "failed" && (
                    <p className="mt-1 text-red-300">{zh ? "寄送失敗，請稍後再試。" : "Couldn't send it. Please try again in a minute."}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{zh ? "電子郵件" : "Email"}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] focus:bg-white/8 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="block text-sm font-medium text-white/70">{zh ? "密碼" : "Password"}</label>
              <Link href="/forgot-password" className="text-xs text-[#E7C98A] hover:text-[#F3DFAE] font-medium transition-colors">
                {zh ? "忘記密碼？" : "Forgot password?"}
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C49A4A] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C49A4A] hover:bg-[#D4AE63] disabled:opacity-50 disabled:cursor-not-allowed text-[#0E1E3A] font-bold font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? (zh ? "登入中…" : "Signing in…") : (zh ? "登入" : "Sign in")}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5 text-xs text-white/30">
          <span className="flex-1 h-px bg-white/10" /> {zh ? "或" : "or"} <span className="flex-1 h-px bg-white/10" />
        </div>
        <div className="space-y-3">
          <GoogleProvider>
            <GoogleLoginButton onToken={handleGoogle} onError={setError} />
          </GoogleProvider>
          <LineLoginButton label={zh ? "使用 LINE 登入" : "Log in with LINE"} />
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          {zh ? "還沒有帳號？" : "Don\u2019t have an account?"}{" "}
          <Link href="/signup" className="text-[#E7C98A] hover:text-[#F3DFAE] font-medium transition-colors">
            {zh ? "註冊" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
