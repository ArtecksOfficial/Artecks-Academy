"use client";
// ─── My account — one place for a family's gems, lessons left and kids' XP ───

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gem, Loader2, Package, Trophy } from "lucide-react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/app/components/AuthContext";
import AuthButton from "@/app/components/AuthButton";
import LineLoginButton from "@/app/components/LineLoginButton";
import { authHeaders } from "@/lib/auth-client";

interface Kid { id: number; first_name: string; display_name: string; age: number; xp_month: number; xp_total: number; leaderboard_opt_in: boolean }
interface Mine { gems: number; gem_value_twd: number; credits: Record<"private" | "pair" | "group", number> }

const card = "rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm";

export default function AccountClient() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { user, isLoading } = useAuth();
  const [mine, setMine] = useState<Mine | null>(null);
  const [kids, setKids] = useState<Kid[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const h = { headers: authHeaders() };
    fetch("/api/packages/mine", h).then((r) => (r.ok ? r.json() : null)).then(setMine).catch(() => {});
    fetch("/api/students", h).then((r) => (r.ok ? r.json() : [])).then((d) => setKids(Array.isArray(d) ? d : [])).catch(() => setKids([]));
  }, [user]);

  const credits = mine?.credits;
  const totalCredits = credits ? credits.private + credits.pair + credits.group : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB" }}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <span className="text-sm font-black text-gray-900 hidden sm:inline">Artecks Academy</span>
          </Link>
          <div className="flex items-center gap-2"><AuthButton locale={locale} /><LanguageToggle /></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
        <h1 className="text-3xl font-black text-gray-900">{zh ? "我的帳戶" : "My account"}</h1>

        {isLoading ? (
          <Loader2 className="animate-spin text-gray-300" />
        ) : !user ? (
          <section className={`${card} flex flex-col gap-3`}>
            <p className="text-sm text-gray-600">
              {zh ? "登入後即可查看寶石、剩餘堂數和孩子的 XP。" : "Log in to see your gems, lessons left and your kids' XP."}
            </p>
            <LineLoginButton next="/account" label={zh ? "使用 LINE 登入" : "Continue with LINE"} />
            <Link href="/login?next=/account" className="text-center text-sm font-bold text-indigo-600">{zh ? "用 Email 登入" : "Log in with email"}</Link>
          </section>
        ) : (
          <>
            {/* Gems */}
            <section className={card}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-gray-900 inline-flex items-center gap-2"><Gem size={16} className="text-violet-600" /> {zh ? "家庭寶石" : "Family gems"}</h2>
                <Link href="/packages" className="text-xs font-bold text-indigo-600">{zh ? "用寶石折抵 →" : "Use for a discount →"}</Link>
              </div>
              <p className="mt-3 text-4xl font-black text-violet-700">{mine ? mine.gems.toLocaleString() : "…"}</p>
              {mine && (
                <p className="text-xs text-gray-500 mt-1">
                  {zh ? `約可折 NT$${(mine.gems * mine.gem_value_twd).toLocaleString()}（每筆套票最多折 10%）` : `Worth about NT$${(mine.gems * mine.gem_value_twd).toLocaleString()} off (up to 10% per package)`}
                </p>
              )}
              <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <li className="rounded-xl bg-gray-50 px-3 py-2">♟ {zh ? "孩子在 chess.artecks.com 下棋" : "Kids playing on chess.artecks.com"}</li>
                <li className="rounded-xl bg-gray-50 px-3 py-2">✅ {zh ? "每出席一堂 +5" : "+5 per lesson attended"}</li>
                <li className="rounded-xl bg-gray-50 px-3 py-2">📝 {zh ? "每次課後回饋 +15" : "+15 per lesson feedback"}</li>
                <li className="rounded-xl bg-gray-50 px-3 py-2">🎉 {zh ? "上完整套課程 +100" : "+100 for finishing a package"}</li>
              </ul>
            </section>

            {/* Lessons left */}
            <section className={card}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-gray-900 inline-flex items-center gap-2"><Package size={16} className="text-indigo-600" /> {zh ? "剩餘堂數" : "Lessons left"}</h2>
                <Link href="/packages" className="text-xs font-bold text-indigo-600">{zh ? "購買套票 →" : "Buy a package →"}</Link>
              </div>
              {credits && totalCredits > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {([["private", zh ? "一對一" : "1-on-1"], ["pair", zh ? "一對二" : "1-on-2"], ["group", zh ? "團體" : "Group"]] as const).map(([k, label]) => (
                    <div key={k} className="rounded-2xl bg-indigo-50 py-3">
                      <p className="text-2xl font-black text-indigo-700">{credits[k]}</p>
                      <p className="text-[11px] font-semibold text-gray-600">{label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">{mine ? (zh ? "目前沒有套票。" : "No package yet.") : "…"}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Link href="/book" className="flex-1 text-center rounded-xl bg-indigo-600 text-white text-sm font-bold py-2.5">{zh ? "預約課程" : "Book a lesson"}</Link>
                <Link href="/bookings/mine" className="flex-1 text-center rounded-xl border border-gray-200 text-sm font-bold text-gray-700 py-2.5">{zh ? "我的預約" : "My bookings"}</Link>
              </div>
            </section>

            {/* Kids & XP */}
            <section className={card}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-gray-900 inline-flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> {zh ? "我的孩子 · XP" : "My kids · XP"}</h2>
                <Link href="/leaderboard" className="text-xs font-bold text-indigo-600">{zh ? "管理 · 排行榜 →" : "Manage · Leaderboard →"}</Link>
              </div>
              {kids === null ? (
                <p className="mt-3 text-sm text-gray-400">…</p>
              ) : kids.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">
                  {zh ? "還沒有加入孩子。孩子上課出席就會自動出現，或到排行榜頁新增。" : "No kids yet. They appear after their first attended lesson, or add them on the leaderboard page."}
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {kids.map((k) => (
                    <li key={k.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                      <span className="text-sm font-bold text-gray-900">
                        {k.first_name} <span className="text-xs font-normal text-gray-500">· {k.age}</span>
                        {!k.leaderboard_opt_in && <span className="ml-2 text-[10px] text-gray-400">{zh ? "未上榜" : "not on board"}</span>}
                      </span>
                      <span className="text-xs text-gray-600 text-right">
                        <b className="text-amber-600 text-sm">{k.xp_month}</b> {zh ? "本月 XP" : "XP this month"}<br />{k.xp_total} {zh ? "總計" : "total"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
