"use client";
// ─── Family dashboard — each child's progress, plus classes left ─────────────
// One card per child: XP (this month, total, last 8 weeks), lessons taken,
// skills the coaches have worked on, the latest coach note, the next lesson
// and the child's own chess rating. Below: the class tracker for every package.

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CalendarClock, Gem, Loader2, Package, Sparkles, Swords, Trophy } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import LineLoginButton from "@/app/components/LineLoginButton";
import PackageTracker, { TrackerPackage } from "@/app/components/PackageTracker";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { CHESS_URL, getKidSession } from "@/lib/kid-mode";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Lesson { booking_id: number; start: string; coach: string; title: string }
interface Kid {
  id: number; first_name: string; display_name: string; age: number;
  xp_total: number; xp_month: number;
  xp_weeks: { week_start: string; xp: number }[];
  xp_by_source: { lesson: number; bonus: number; chess: number; arena: number };
  lessons_attended: number; lessons_this_month: number;
  last_lesson: Lesson | null; next_lesson: Lesson | null;
  skills: { tag: string; count: number }[];
  latest_note: (Lesson & { text: string; skill_tags: string[] }) | null;
  chess: { elo: number; best_elo: number; wins: number; losses: number; draws: number; last_played: string | null } | null;
}
interface Dashboard { family: { gems: number; classes_left: number; active_packages: number }; kids: Kid[] }

const TZ = "Asia/Taipei";
const card = "rounded-3xl bg-white border border-[#E2DDD2] p-5 sm:p-6 shadow-sm";

export default function DashboardClient() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<Dashboard | null | "error">(null);
  const [tracker, setTracker] = useState<TrackerPackage[]>([]);
  const [kidMode, setKidMode] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (getKidSession()) { setKidMode(true); return; }
    const h = { headers: authHeaders() };
    fetch("/api/dashboard", h).then((r) => (r.ok ? r.json() : Promise.reject())).then(setData).catch(() => setData("error"));
    fetch("/api/packages/tracker", h).then((r) => (r.ok ? r.json() : null))
      .then((d) => setTracker(d && Array.isArray(d.packages) ? d.packages : [])).catch(() => {});
  }, [user]);

  const fmtDay = (iso: string) => new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { timeZone: TZ, month: "short", day: "numeric", weekday: "short" }).format(new Date(iso));
  const fmtTime = (iso: string) => new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-5">
        <div>
          <h1 className="font-serif-tc text-3xl font-black text-[#13223F]">{zh ? "學習總覽" : "Dashboard"}</h1>
          <p className="mt-1 text-sm text-gray-600">{zh ? "孩子的進步、上過的課，以及還剩幾堂。" : "How your kids are progressing, what they've covered, and how many classes are left."}</p>
        </div>

        {isLoading ? (
          <Loader2 className="animate-spin text-gray-300" />
        ) : !user ? (
          <section className={`${card} max-w-md flex flex-col gap-4`}>
            <p className="text-sm text-gray-700">{zh ? "登入後即可查看孩子的學習進度。" : "Log in to see your kids' progress."}</p>
            <LineLoginButton next="/dashboard" label={zh ? "使用 LINE 登入" : "Continue with LINE"} />
            <Link href="/login?next=/dashboard" className="text-center text-sm font-bold text-[#A07C34]">{zh ? "用 Email 登入" : "Log in with email"}</Link>
          </section>
        ) : kidMode ? (
          <p className={`${card} text-sm text-gray-700`}>
            {zh ? "這台裝置目前是兒童模式。家長輸入 PIN 離開後即可查看學習總覽。" : "This device is in Kid Mode. Parents can see the dashboard after leaving Kid Mode with their PIN."}
          </p>
        ) : data === null ? (
          <Loader2 className="animate-spin text-gray-300" />
        ) : data === "error" ? (
          <p role="alert" className={`${card} text-sm text-red-700`}>{zh ? "目前無法載入，請稍後再試。" : "We couldn't load this right now. Please try again in a moment."}</p>
        ) : (
          <>
            {/* Family at a glance */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Tile icon={<Package size={15} />} label={zh ? "剩餘堂數" : "Classes left"} value={data.family.classes_left}
                hint={data.family.active_packages ? (zh ? `${data.family.active_packages} 組套票` : `${data.family.active_packages} active package${data.family.active_packages === 1 ? "" : "s"}`) : (zh ? "尚無套票" : "No package yet")}
                href={data.family.active_packages ? "#tracker" : "/packages"} />
              <Tile icon={<Gem size={15} />} label={zh ? "家庭寶石" : "Family gems"} value={data.family.gems} hint={zh ? "可折抵套票" : "For package discounts"} href="/account" />
              <Tile icon={<BookOpen size={15} />} label={zh ? "本月上課" : "Lessons this month"} value={data.kids.reduce((n, k) => n + k.lessons_this_month, 0)} hint={zh ? "所有孩子" : "All kids"} />
              <Tile icon={<Sparkles size={15} />} label={zh ? "本月 XP" : "XP this month"} value={data.kids.reduce((n, k) => n + k.xp_month, 0)} hint={zh ? "所有孩子" : "All kids"} href="/leaderboard" />
            </section>

            {data.kids.length === 0 ? (
              <section className={card}>
                <p className="text-sm text-gray-700">{zh ? "還沒有孩子的資料。孩子上過第一堂課後會自動出現，也可以到排行榜頁新增。" : "No kids yet. A child appears here after their first lesson, or you can add one on the leaderboard page."}</p>
                <Link href="/leaderboard" className="mt-3 inline-block text-sm font-bold text-[#A07C34]">{zh ? "新增孩子 →" : "Add a child →"}</Link>
              </section>
            ) : (
              data.kids.map((k) => <KidCard key={k.id} kid={k} zh={zh} fmtDay={fmtDay} fmtTime={fmtTime} />)
            )}

            {tracker.length > 0 && (
              <section id="tracker" className={`${card} scroll-mt-24`}>
                <h2 className="text-base font-black text-[#13223F]">{zh ? "上課進度" : "Class tracker"}</h2>
                <p className="mt-1 mb-4 text-xs text-gray-500">{zh ? "每上完一堂，這裡會顯示套票還剩幾堂。" : "After every class, see how many are left in the package."}</p>
                <PackageTracker packages={tracker} zh={zh} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Tile({ icon, label, value, hint, href }: { icon: React.ReactNode; label: string; value: number; hint: string; href?: string }) {
  const body = (
    <>
      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B6478]"><span className="text-[#A07C34]">{icon}</span>{label}</p>
      <p className="mt-1.5 text-3xl font-black text-[#13223F] leading-none">{value.toLocaleString()}</p>
      <p className="mt-1.5 text-[11px] text-gray-500">{hint}</p>
    </>
  );
  const cls = "rounded-2xl bg-white border border-[#E2DDD2] p-4 shadow-sm";
  if (!href) return <div className={cls}>{body}</div>;
  return href.startsWith("#")
    ? <a href={href} className={`${cls} hover:border-[#C49A4A] transition-colors`}>{body}</a>
    : <Link href={href} className={`${cls} hover:border-[#C49A4A] transition-colors`}>{body}</Link>;
}

function KidCard({ kid, zh, fmtDay, fmtTime }: { kid: Kid; zh: boolean; fmtDay: (s: string) => string; fmtTime: (s: string) => string }) {
  const sources = [
    { key: "lesson", label: zh ? "上課" : "Lessons", xp: kid.xp_by_source.lesson },
    { key: "chess", label: zh ? "線上下棋" : "Chess site", xp: kid.xp_by_source.chess },
    { key: "arena", label: "Arena", xp: kid.xp_by_source.arena },
    { key: "bonus", label: zh ? "教練加分" : "Coach bonus", xp: kid.xp_by_source.bonus },
  ].filter((s) => s.xp > 0);
  const games = kid.chess ? kid.chess.wins + kid.chess.losses + kid.chess.draws : 0;

  return (
    <section className={card} aria-labelledby={`kid-${kid.id}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`kid-${kid.id}`} className="font-serif-tc text-2xl font-black text-[#13223F]">
          {kid.first_name} <span className="font-sans text-sm font-semibold text-gray-500">· {kid.age}{zh ? " 歲" : ""}</span>
        </h2>
        {kid.next_lesson ? (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#13223F]">
            <CalendarClock size={14} className="text-[#A07C34]" />
            {zh ? "下一堂：" : "Next lesson: "}{fmtDay(kid.next_lesson.start)} · {fmtTime(kid.next_lesson.start)}
            {kid.next_lesson.coach && <> · {zh ? `教練 ${kid.next_lesson.coach}` : `Coach ${kid.next_lesson.coach}`}</>}
          </p>
        ) : (
          <Link href="/book" className="text-xs font-bold text-[#A07C34]">{zh ? "預約下一堂 →" : "Book the next lesson →"}</Link>
        )}
      </header>

      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label={zh ? "本月 XP" : "XP this month"} value={kid.xp_month.toLocaleString()} />
        <Stat label={zh ? "累積 XP" : "Total XP"} value={kid.xp_total.toLocaleString()} />
        <Stat label={zh ? "上過的課" : "Lessons taken"} value={String(kid.lessons_attended)} sub={kid.last_lesson ? (zh ? `最近：${fmtDay(kid.last_lesson.start)}` : `Last: ${fmtDay(kid.last_lesson.start)}`) : undefined} />
        <Stat label={zh ? "棋力分數" : "Chess rating"} value={kid.chess ? String(kid.chess.elo) : "—"}
          sub={kid.chess ? (games ? (zh ? `${kid.chess.wins} 勝 ${kid.chess.losses} 敗 ${kid.chess.draws} 和` : `${kid.chess.wins}W ${kid.chess.losses}L ${kid.chess.draws}D`) : (zh ? "還沒下過棋" : "No games yet")) : (zh ? "開始兒童模式後顯示" : "Shown after Kid Mode play")} />
      </dl>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold text-[#5B6478]">{zh ? "最近 8 週的 XP" : "XP over the last 8 weeks"}</h3>
          <WeekBars weeks={kid.xp_weeks} zh={zh} />
          {sources.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
              {sources.map((s) => <span key={s.key}><b className="text-[#13223F]">{s.xp.toLocaleString()}</b> {s.label}</span>)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B6478]"><Trophy size={13} className="text-[#A07C34]" />{zh ? "練習過的主題" : "Skills worked on"}</h3>
            {kid.skills.length ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {kid.skills.map((s) => (
                  <li key={s.tag} className="rounded-full bg-[#F6F4EF] border border-[#E2DDD2] px-2.5 py-1 text-xs font-semibold text-[#13223F]">
                    {s.tag} <span className="text-gray-500 font-normal">× {s.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-gray-500">{zh ? "教練寫下課後紀錄後，主題會出現在這裡。" : "Topics appear here once a coach writes a lesson report."}</p>
            )}
          </div>

          {kid.latest_note && (
            <div className="rounded-2xl bg-[#F6F4EF] p-4">
              <h3 className="text-xs font-bold text-[#5B6478]">
                {zh ? "教練最近的紀錄" : "Latest coach note"} · {fmtDay(kid.latest_note.start)}{kid.latest_note.coach && <> · {kid.latest_note.coach}</>}
              </h3>
              <p className="mt-1.5 text-sm text-[#13223F] leading-relaxed">{kid.latest_note.text}</p>
              <Link href={`/report/${kid.latest_note.booking_id}`} className="mt-2 inline-block text-xs font-bold text-[#A07C34]">{zh ? "看完整課後報告 →" : "Open the full report →"}</Link>
            </div>
          )}

          {kid.chess && (
            <a href={CHESS_URL} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A07C34]">
              <Swords size={13} /> {zh ? `最高分 ${kid.chess.best_elo}・到 chess.artecks.com 練習` : `Best rating ${kid.chess.best_elo} · practise on chess.artecks.com`}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-[#F6F4EF] px-4 py-3">
      <dt className="text-[11px] font-bold text-[#5B6478]">{label}</dt>
      <dd className="mt-1 text-2xl font-black text-[#13223F] leading-none">{value}</dd>
      {sub && <dd className="mt-1 text-[11px] text-gray-500">{sub}</dd>}
    </div>
  );
}

// Eight bars, one per week (Monday start, Taipei). The value sits on each bar,
// so the chart reads without hovering; a text summary is provided for screen readers.
function WeekBars({ weeks, zh }: { weeks: { week_start: string; xp: number }[]; zh: boolean }) {
  const max = Math.max(1, ...weeks.map((w) => w.xp));
  const label = (iso: string) => {
    const [, m, d] = iso.split("-").map(Number);
    return `${m}/${d}`;
  };
  const total = weeks.reduce((n, w) => n + w.xp, 0);
  return (
    <figure className="mt-2">
      <div className="flex h-32 items-end gap-1.5" role="img"
        aria-label={zh ? `最近 8 週共 ${total} XP：${weeks.map((w) => `${label(w.week_start)} 週 ${w.xp}`).join("、")}` : `${total} XP over the last 8 weeks: ${weeks.map((w) => `week of ${label(w.week_start)} ${w.xp}`).join(", ")}`}>
        {weeks.map((w, i) => (
          <div key={w.week_start} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-bold text-[#13223F]">{w.xp > 0 ? w.xp : ""}</span>
            <div className={`w-full rounded-t-md ${i === weeks.length - 1 ? "bg-[#C49A4A]" : "bg-[#1C3157]"} ${w.xp === 0 ? "opacity-20" : ""}`}
              style={{ height: `${w.xp === 0 ? 3 : Math.max(6, Math.round((w.xp / max) * 78))}%` }} />
          </div>
        ))}
      </div>
      <figcaption className="mt-1 flex gap-1.5 text-[10px] text-gray-500">
        {weeks.map((w, i) => <span key={w.week_start} className={`flex-1 text-center ${i === weeks.length - 1 ? "font-bold text-[#A07C34]" : ""}`}>{i === weeks.length - 1 ? (zh ? "本週" : "This wk") : label(w.week_start)}</span>)}
      </figcaption>
    </figure>
  );
}
