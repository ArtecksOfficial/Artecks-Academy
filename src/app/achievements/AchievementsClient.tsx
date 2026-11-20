"use client";
// ─── Parent achievements — the family's private badge book ───────────────────
// Badges grouped by theme, with progress toward the locked ones, plus the
// perks (free late reschedule, bonus lesson) the family has earned. Private to
// the family: there is no parent ranking anywhere.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gem, Gift, Loader2, Lock, MessageCircle } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import LineLoginButton from "@/app/components/LineLoginButton";
import { useAuth } from "@/app/components/AuthContext";
import { useAchievements } from "@/app/components/AchievementsContext";
import { authHeaders } from "@/lib/auth-client";
import { getKidSession } from "@/lib/kid-mode";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { rewardText, type AchievementsOverview, type Badge, type Perk } from "@/lib/achievements";
import { GEMS_ENABLED } from "@/lib/gems";

const card = "rounded-3xl bg-white border border-[#E2DDD2] p-5 sm:p-6 shadow-sm";
const LINE_URL = "https://line.me/R/ti/p/@843yqhoa";

export default function AchievementsClient() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { user, isLoading } = useAuth();
  const { refresh } = useAchievements();
  const [data, setData] = useState<AchievementsOverview | null | "error">(null);
  const [kidMode, setKidMode] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (getKidSession()) { setKidMode(true); return; }
    fetch("/api/achievements", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: AchievementsOverview) => { setData(d); if (d.new?.length) refresh(); })
      .catch(() => setData("error"));
  }, [user, refresh]);

  const fmtDay = (iso: string) => new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { timeZone: "Asia/Taipei", year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <SiteHeader />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col gap-5">
        <div>
          <h1 className="font-serif-tc text-3xl font-black text-[#13223F]">{zh ? "家長成就" : "Family achievements"}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {zh ? "陪孩子學習的每一步都值得慶祝。徽章只有您的家人看得到。" : "Every step of your child's journey is worth celebrating. Only your family can see these."}
          </p>
        </div>

        {isLoading ? (
          <Loader2 className="animate-spin text-gray-300" />
        ) : !user ? (
          <section className={`${card} max-w-md flex flex-col gap-4`}>
            <p className="text-sm text-gray-700">{zh ? "登入後即可查看並解鎖徽章。" : "Log in to see and unlock your badges."}</p>
            <LineLoginButton next="/achievements" label={zh ? "使用 LINE 登入" : "Continue with LINE"} />
            <Link href="/login?next=/achievements" className="text-center text-sm font-bold text-[#A07C34]">{zh ? "用 Email 登入" : "Log in with email"}</Link>
          </section>
        ) : kidMode ? (
          <p className={`${card} text-sm text-gray-700`}>
            {zh ? "這台裝置目前是兒童模式。家長輸入 PIN 離開後即可查看。" : "This device is in Kid Mode. Parents can see this after leaving Kid Mode with their PIN."}
          </p>
        ) : data === null ? (
          <Loader2 className="animate-spin text-gray-300" />
        ) : data === "error" ? (
          <p role="alert" className={`${card} text-sm text-red-700`}>{zh ? "目前無法載入，請稍後再試。" : "We couldn't load this right now. Please try again in a moment."}</p>
        ) : (
          <>
            <Summary data={data} zh={zh} />
            {data.perks.length > 0 && <Perks perks={data.perks} zh={zh} fmtDay={fmtDay} />}
            {data.groups.map((g) => {
              const badges = data.badges.filter((b) => b.group === g.key);
              if (!badges.length) return null;
              return (
                <section key={g.key}>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5B6478]">{zh ? g.zh : g.en}</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {badges.map((b) => <BadgeCard key={b.code} badge={b} zh={zh} fmtDay={fmtDay} />)}
                  </ul>
                </section>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}

function Summary({ data, zh }: { data: AchievementsOverview; zh: boolean }) {
  const { unlocked, total, gems_earned } = data.summary;
  const pct = total ? Math.round((unlocked / total) * 100) : 0;
  const next = data.badges
    .filter((b) => !b.unlocked && b.progress > 0)
    .sort((a, b) => b.progress / b.target - a.progress / a.target)[0];
  return (
    <section className="rounded-3xl bg-[#13223F] p-5 sm:p-6 text-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E7C98A]">{zh ? "已解鎖" : "Unlocked"}</p>
          <p className="mt-1 text-4xl font-black leading-none">{unlocked}<span className="text-xl text-white/50"> / {total}</span></p>
        </div>
        {GEMS_ENABLED && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-[#E7C98A]">
            <Gem size={14} /> {zh ? `徽章已獲得 ${gems_earned} 顆寶石` : `${gems_earned} gems earned from badges`}
          </p>
        )}
      </div>
      <div className="mt-4 h-2 rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-[#C49A4A] transition-all" style={{ width: `${pct}%` }} />
      </div>
      {next && (
        <p className="mt-3 text-sm text-white/80">
          {zh ? "下一個：" : "Next up: "}
          <span className="font-bold text-white">{next.icon} {zh ? next.title.zh : next.title.en}</span>
          {" "}({next.progress}/{next.target})
        </p>
      )}
    </section>
  );
}

function Perks({ perks, zh, fmtDay }: { perks: Perk[]; zh: boolean; fmtDay: (s: string) => string }) {
  const available = perks.filter((p) => p.status === "available");
  return (
    <section className={card}>
      <h2 className="inline-flex items-center gap-2 text-base font-black text-[#13223F]"><Gift size={16} className="text-[#A07C34]" />{zh ? "我的獎勵" : "Your perks"}</h2>
      <p className="mt-1 text-xs text-gray-500">
        {available.length
          ? (zh ? `您有 ${available.length} 個可使用的獎勵。` : `You have ${available.length} perk${available.length === 1 ? "" : "s"} ready to use.`)
          : (zh ? "所有獎勵都已使用。" : "All your perks have been used.")}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {perks.map((p) => (
          <li key={p.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 ${p.status === "available" ? "border-[#E7C98A] bg-[#FBF5E8]" : "border-[#EEEAE1] bg-[#F6F4EF] opacity-70"}`}>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#13223F]">{zh ? p.label.zh : p.label.en}</p>
              <p className="text-xs text-gray-600">
                {p.status === "available"
                  ? (zh ? p.how.zh : p.how.en)
                  : (zh ? `已於 ${p.used_at ? fmtDay(p.used_at) : ""} 使用` : `Used${p.used_at ? ` on ${fmtDay(p.used_at)}` : ""}`)}
              </p>
              {p.from_badge && <p className="mt-0.5 text-[11px] text-gray-400">{zh ? `來自「${p.from_badge.zh}」` : `From “${p.from_badge.en}”`}</p>}
            </div>
            {p.status === "available" && (
              <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#06C755] px-3 py-2 text-xs font-bold text-white hover:opacity-90">
                <MessageCircle size={13} /> {zh ? "LINE 使用" : "Use on LINE"}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BadgeCard({ badge: b, zh, fmtDay }: { badge: Badge; zh: boolean; fmtDay: (s: string) => string }) {
  const pct = Math.min(100, Math.round((b.progress / Math.max(1, b.target)) * 100));
  return (
    <li className={`flex gap-3 rounded-2xl border p-4 ${b.unlocked ? "border-[#E7C98A] bg-white shadow-sm" : "border-[#E2DDD2] bg-white/60"}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${b.unlocked ? "bg-[#FBF5E8] ring-2 ring-[#E7C98A]" : "bg-gray-100 grayscale opacity-50"}`}>
        <span aria-hidden>{b.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-black ${b.unlocked ? "text-[#13223F]" : "text-gray-600"}`}>
          {zh ? b.title.zh : b.title.en}
          {!b.unlocked && <Lock size={11} className="ml-1.5 inline -mt-0.5 text-gray-400" aria-label={zh ? "未解鎖" : "Locked"} />}
        </p>
        <p className="mt-0.5 text-xs text-gray-600">{zh ? b.description.zh : b.description.en}</p>
        {b.reward.en && (
          <p className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${b.unlocked ? "bg-[#13223F] text-[#E7C98A]" : "bg-gray-100 text-gray-500"}`}>
            🎁 {rewardText(b.reward, zh)}
          </p>
        )}
        {b.unlocked ? (
          b.unlocked_at && <p className="mt-1.5 text-[11px] text-[#A07C34] font-semibold">{zh ? `${fmtDay(b.unlocked_at)} 解鎖` : `Unlocked ${fmtDay(b.unlocked_at)}`}</p>
        ) : b.target > 1 ? (
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-gray-100"><div className="h-1.5 rounded-full bg-[#C49A4A]" style={{ width: `${pct}%` }} /></div>
            <p className="mt-1 text-[11px] text-gray-500">{b.progress} / {b.target}</p>
          </div>
        ) : null}
      </div>
    </li>
  );
}
