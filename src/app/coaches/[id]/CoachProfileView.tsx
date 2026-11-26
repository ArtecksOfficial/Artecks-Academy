"use client";
// A teacher's own page: photo, headline, subjects, bio, upcoming classes, and how to book.

import Link from "next/link";
import { ArrowLeft, CalendarPlus, MessageCircle } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import CoachAvatar from "@/app/components/CoachAvatar";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { routes } from "@/lib/platform";
import type { AcademySession, Coach } from "@/lib/types";

const LINE_URL = "https://line.me/R/ti/p/@843yqhoa";

export default function CoachProfileView({ coach, sessions }: { coach: Omit<Coach, "line_id">; sessions: AcademySession[] }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const subjects = (coach.subjects || "").split(/[,，、]/).map((x) => x.trim()).filter(Boolean);
  const teachesChess = !coach.subjects || /chess|西洋棋|棋/i.test(coach.subjects);
  const first = coach.name.split(" ")[0];
  const fmt = new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Taipei",
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <SiteHeader />
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
        <Link href="/coaches" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A07C34] hover:underline w-fit">
          <ArrowLeft size={15} aria-hidden /> {zh ? "所有老師" : "All coaches"}
        </Link>

        <section className="rounded-3xl border border-[#E2DDD2] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <CoachAvatar coach={coach} className="h-28 w-28 sm:h-36 sm:w-36 rounded-full"
              initialsClassName="bg-[#13223F] text-4xl font-black text-[#E7C98A]" />
            <div className="min-w-0">
              <h1 className="font-serif-tc text-3xl sm:text-4xl font-black text-[#13223F]">
                {coach.name}{coach.name_zh && <span className="ml-2 text-xl font-semibold text-[#5B6478]">{coach.name_zh}</span>}
              </h1>
              {coach.title && <p className="mt-1 text-sm font-semibold text-[#A07C34]">{coach.title}</p>}
              {subjects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {subjects.map((x) => (
                    <span key={x} className="rounded-full bg-[#FBF5E8] px-3 py-1 text-xs font-bold text-[#A07C34]">{x}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {coach.bio && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{zh ? "關於" : "About"} {first}</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-[#3A4256]">{coach.bio}</p>
            </div>
          )}
        </section>

        {sessions.length > 0 && (
          <section>
            <h2 className="font-serif-tc text-2xl font-black text-[#13223F]">{zh ? `${first} 的近期課程` : `Upcoming classes with ${first}`}</h2>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link href={routes.session(s.id)} className="block rounded-2xl border border-[#E2DDD2] bg-white p-4 hover:shadow-md transition-shadow">
                    <p className="font-bold text-[#13223F]">{s.title}</p>
                    <p className="mt-1 text-sm text-[#5B6478]">{fmt.format(new Date(s.start_time))}</p>
                    <p className="text-sm text-[#5B6478]">{s.location_name}{s.price_twd ? ` · NT$${s.price_twd.toLocaleString()}` : ""}</p>
                    {s.is_full && <p className="mt-1 text-xs font-bold text-red-600">{zh ? "已額滿" : "Full"}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-3xl border border-[#E2DDD2] bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-3">
          {teachesChess && (
            <Link href="/book?subject=chess" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#C49A4A] px-4 py-3.5 text-sm font-black text-[#0E1E3A] hover:bg-[#D4AE63]">
              <CalendarPlus size={17} aria-hidden /> {zh ? "預約課程" : "Book a lesson"}
            </Link>
          )}
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#06C755] px-4 py-3.5 text-sm font-black text-white hover:opacity-90">
            <MessageCircle size={17} aria-hidden /> {zh ? `LINE 詢問 ${first} 的課程` : `Ask about lessons with ${first}`}
          </a>
        </section>
      </main>
    </div>
  );
}
