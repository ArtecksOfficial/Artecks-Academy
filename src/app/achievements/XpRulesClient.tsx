"use client";
// ─── How XP works — the kids' XP rules, in one place ─────────────────────────
// Shown at /achievements while parent achievements are paused. Numbers come from
// the public leaderboard API, so they always match what the backend awards.

import SiteHeader from "@/app/components/SiteHeader";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CalendarCheck, Loader2, NotebookPen, Sparkles, Swords, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Rules {
  prize: string;
  lesson_xp: number;
  homework_xp?: number;
  homework_weekly_max?: number;
  arena_xp?: { participation: number; win: number; podium: number[] };
  groups: { key: string; label: string }[];
}

const card = "rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm";

function Row({ icon, label, note, xp }: { icon: React.ReactNode; label: string; note?: string; xp: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-3">
      <span className="mt-0.5 text-[#A07C34] flex-shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-gray-900">{label}</span>
        {note && <span className="block text-xs text-gray-500 mt-0.5">{note}</span>}
      </span>
      <b className="text-sm font-black text-[#A07C34] tabular-nums whitespace-nowrap">{xp}</b>
    </li>
  );
}

export default function XpRulesClient() {
  const { locale } = useLanguage();
  const zh = locale !== "en";
  const [rules, setRules] = useState<Rules | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard?period=month")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Rules | null) => (d && typeof d.lesson_xp === "number" ? setRules(d) : setFailed(true)))
      .catch(() => setFailed(true));
  }, []);

  const weeklyMax = rules?.homework_weekly_max ?? 5;
  const arena = rules?.arena_xp;
  const podium = arena?.podium ?? [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <SiteHeader />

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col gap-5">
        <div>
          <h1 className="font-serif-tc text-3xl sm:text-4xl font-black text-gray-900 tracking-tight inline-flex items-center gap-3">
            <Sparkles className="text-amber-500" size={30} /> {zh ? "XP 怎麼賺" : "How XP works"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            {zh
              ? "孩子上課、完成作業、參加 Arena 都能賺 XP。XP 代表努力和進步，不能花用，用來在排行榜上和同齡孩子比一比。"
              : "Kids earn XP for lessons, homework and the Arena. XP shows effort and progress. It can't be spent: it's how kids compare with others their age on the leaderboard."}
          </p>
        </div>

        {rules === null && !failed && <Loader2 className="animate-spin text-gray-300" size={20} />}
        {failed && (
          <p className="text-sm text-gray-500">{zh ? "暫時無法載入 XP 規則，請稍後再試。" : "Couldn't load the XP rules right now. Please try again later."}</p>
        )}

        {rules && (
          <>
            {/* Earning */}
            <section className={card}>
              <h2 className="text-sm font-black text-gray-900">{zh ? "怎麼賺 XP" : "Ways to earn XP"}</h2>
              <ul className="mt-4 flex flex-col gap-2">
                <Row icon={<CalendarCheck size={18} />} xp={`+${rules.lesson_xp} XP`}
                  label={zh ? "出席一堂課" : "Attend a lesson"}
                  note={zh ? "教練在課後確認出席。" : "The teacher marks attendance after the lesson."} />
                {(rules.homework_xp ?? 0) > 0 && (
                  <Row icon={<NotebookPen size={18} />} xp={`+${rules.homework_xp} XP`}
                    label={zh ? "完成老師出的作業" : "Finish homework from your teacher"}
                    note={zh
                      ? `老師在下次上課時打勾完成。每位孩子每週（週一至週日）前 ${weeklyMax} 份有 XP。`
                      : `The teacher ticks it done at the next lesson. The first ${weeklyMax} each week (Mon–Sun) earn XP.`} />
                )}
                {arena && (
                  <>
                    <Row icon={<Swords size={18} />} xp={`+${arena.participation} XP`}
                      label={zh ? "參加 Academy Arena" : "Play in the Academy Arena"}
                      note={zh ? "每月的實體比賽，出席就有。" : "Our monthly in-person event. Just show up."} />
                    <Row icon={<Swords size={18} />} xp={`+${arena.win} XP`}
                      label={zh ? "Arena 每贏一盤" : "Each Arena game won"} />
                    {podium.length > 0 && (
                      <Row icon={<Trophy size={18} />} xp={`${podium.map((x) => `+${x}`).join(" / ")} XP`}
                        label={zh ? "Arena 前三名加碼" : "Arena top 3 bonus"}
                        note={zh ? "第 1 / 2 / 3 名" : "1st / 2nd / 3rd place"} />
                    )}
                  </>
                )}
              </ul>
            </section>

            {/* Leaderboard */}
            <section className={card}>
              <h2 className="text-sm font-black text-gray-900 inline-flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" /> {zh ? "排行榜規則" : "Leaderboard rules"}
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-gray-700 list-disc pl-5">
                <li>{zh ? "每月 1 日（台北時間）重新開始，所有孩子從零起跑。" : "The board starts over on the 1st of every month (Taipei time), so everyone gets a fresh start."}</li>
                <li>
                  {zh ? "依年齡分組比較：" : "Kids compete within their age group: "}
                  <b>{rules.groups.map((g) => g.label).join(zh ? "、" : ", ")}</b>
                  {zh ? " 歲。" : " years."}
                </li>
                <li>{zh ? "累積總 XP 會一直保留，不會因每月重新開始而消失。" : "Total XP is kept forever. The monthly restart only affects the monthly board."}</li>
                <li>{zh ? "每位學生都會出現在排行榜上，只顯示名字，不會顯示照片或姓氏。" : "Every student is on the leaderboard by first name only: no photo, no surname."}</li>
              </ul>
              <p className="mt-4 inline-block rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5">
                🎁 {zh ? "每累積 1,000 XP，家長可獲得 Artecks 商店 9 折優惠券" : "Every 1,000 XP earns your family a 10% Artecks Store coupon"}
              </p>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link href="/leaderboard" className="rounded-2xl bg-[#13223F] hover:bg-[#1C3157] text-white text-sm font-bold px-5 py-3 inline-flex items-center gap-2">
                <Trophy size={16} /> {zh ? "看排行榜" : "See the leaderboard"}
              </Link>
              <Link href="/dashboard" className="rounded-2xl bg-white border border-gray-200 text-gray-900 text-sm font-bold px-5 py-3 inline-flex items-center gap-2">
                <BookOpen size={16} /> {zh ? "孩子的進度" : "Your kids' progress"}
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
