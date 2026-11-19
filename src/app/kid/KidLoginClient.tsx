"use client";
// ─── Kids log in here on their own device ────────────────────────────────────
// The parent makes the login (Settings → My kids → Kid login). The child types
// it here and goes straight to chess.artecks.com as themselves, in Kid Mode:
// nothing to buy, no gems to spend, no account settings.

import { useState, FormEvent } from "react";
import { Loader2, Swords } from "lucide-react";
import { CHESS_URL } from "@/lib/kid-mode";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";

export default function KidLoginClient() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/kid-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok || !d.access) {
      setBusy(false);
      setErr(r?.status === 429
        ? (zh ? "嘗試太多次了，請等一分鐘再試。" : "Too many tries. Wait a minute and try again.")
        : r?.status === 401
          ? (zh ? "帳號或密碼不對，請再試一次或問爸爸媽媽。" : "That username or password isn't right. Try again or ask your parent.")
          : (zh ? "現在無法登入，請稍後再試。" : "Can't log in right now. Please try again soon."));
      return;
    }
    // Same hand-off as "Start Kid Mode": tokens travel in the URL hash, which never reaches a server.
    const hash = new URLSearchParams({ t: d.access, r: d.refresh, kid: String(d.kid?.id ?? "") });
    window.location.assign(`${CHESS_URL}/#${hash.toString()}`);
  }

  const input = "w-full rounded-2xl border-2 border-[#E2DDD2] bg-white px-4 py-3.5 text-lg font-semibold text-[#13223F] focus:outline-none focus:border-[#C49A4A]";

  return (
    <div className="min-h-screen bg-[#0E1E3A] flex flex-col">
      <div className="flex justify-end p-4"><LanguageToggle /></div>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-[#F6F4EF] p-6 sm:p-8 shadow-2xl flex flex-col gap-4">
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#13223F] text-[#E7C98A]">
              <Swords size={30} aria-hidden />
            </span>
            <h1 className="mt-4 font-serif-tc text-2xl font-black text-[#13223F]">{zh ? "小朋友登入" : "Kids, log in to play!"}</h1>
            <p className="mt-1 text-sm text-gray-600">{zh ? "用爸爸媽媽幫你設定的帳號和密碼。" : "Use the username and password your parent made for you."}</p>
          </div>
          <label className="text-sm font-bold text-[#13223F]">
            {zh ? "帳號" : "Username"}
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" autoCorrect="off"
              autoComplete="username" spellCheck={false} required className={`mt-1 ${input}`} />
          </label>
          <label className="text-sm font-bold text-[#13223F]">
            {zh ? "密碼" : "Password"}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
              required className={`mt-1 ${input}`} />
          </label>
          {err && <p role="alert" className="text-sm font-semibold text-red-600">{err}</p>}
          <button type="submit" disabled={busy || !username.trim() || !password}
            className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-[#C49A4A] py-4 text-lg font-black text-[#0E1E3A] disabled:opacity-50">
            {busy ? <Loader2 className="animate-spin" size={20} /> : <Swords size={20} aria-hidden />}
            {zh ? "開始下棋" : "Play chess"}
          </button>
          <p className="text-center text-xs text-gray-500">
            {zh ? "家長：在「設定 → 我的孩子」為孩子建立登入帳號。" : "Parents: make your child's login in Settings → My kids."}
          </p>
        </form>
      </main>
    </div>
  );
}
