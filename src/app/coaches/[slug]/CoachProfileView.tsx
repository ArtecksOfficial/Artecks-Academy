"use client";
// A teacher's own page: photo, headline, subjects, bio, open lesson times
// (tap one to book it), upcoming classes, and a form to message the teacher.

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarPlus, MessageCircle } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import CoachAvatar from "@/app/components/CoachAvatar";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { routes } from "@/lib/platform";
import type { CoachPageData } from "@/lib/coach-page";
import type { AcademySession } from "@/lib/types";
import MessageCoachForm from "./MessageCoachForm";

const TZ = "Asia/Taipei";

export default function CoachProfileView({ data, sessions }: { data: CoachPageData; sessions: AcademySession[] }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { coach, book_subject: subject, price_twd: price, open_times: openTimes } = data;
  const subjects = (coach.subjects || "").split(/[,，、]/).map((x) => x.trim()).filter(Boolean);
  const first = coach.name.split(" ")[0];
  const [areaIdx, setAreaIdx] = useState(0);
  const area = openTimes[areaIdx];

  const fmt = useMemo(() => ({
    day: new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TZ }),
    time: new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ }),
    full: new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", {
      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ,
    }),
  }), [zh]);

  const bookHref = (extra: Record<string, string> = {}) =>
    `/book?${new URLSearchParams({ subject: subject ?? "", coach: String(coach.id), ...extra }).toString()}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <SiteHeader />
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
        <Link href="/coaches" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A07C34] hover:underline w-fit">
          <ArrowLeft size={15} aria-hidden /> {zh ? "所有老師" : "All coaches"}
        </Link>

        {/* About */}
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
              {price ? (
                <p className="mt-3 text-sm text-[#5B6478]">
                  <span className="font-black text-[#13223F]">NT$ {price.toLocaleString()}</span> {zh ? "/ 60 分鐘課程" : "per 60-minute lesson"}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{zh ? "關於" : "About"} {first}</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-[#3A4256]">
              {coach.bio || (zh ? `${first} 的介紹即將更新。有任何問題，歡迎在下方留言。` : `${first}'s introduction is coming soon. Questions? Send a message below.`)}
            </p>
          </div>
        </section>

        {/* Schedule */}
        <section className="rounded-3xl border border-[#E2DDD2] bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif-tc text-2xl font-black text-[#13223F]">{zh ? `${first} 的可預約時間` : `When ${first} can teach`}</h2>
          {openTimes.length === 0 ? (
            <p className="mt-3 text-sm text-[#5B6478]">
              {zh
                ? `${first} 目前沒有開放的時段。請在下方留言，${first} 會和你約時間。`
                : `${first} has no open times listed right now. Send a message below and ${first} will find a time with you.`}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-[#5B6478]">
                {zh ? `接下來 ${data.open_days} 天的空檔，點選時間即可預約。` : `Open times in the next ${data.open_days} days. Tap a time to book it.`}
              </p>
              {openTimes.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2" role="tablist">
                  {openTimes.map((a, i) => (
                    <button key={a.area} type="button" role="tab" aria-selected={i === areaIdx} onClick={() => setAreaIdx(i)}
                      className={`rounded-full px-4 py-1.5 text-sm font-bold ${i === areaIdx ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-700"}`}>
                      {a.area || (zh ? "地點待定" : "Place to be agreed")}
                    </button>
                  ))}
                </div>
              )}
              {openTimes.length === 1 && area.area && (
                <p className="mt-3 text-sm font-semibold text-[#13223F]">📍 {area.area}</p>
              )}
              <ul className="mt-4 flex flex-col gap-3">
                {area.days.map((d) => (
                  <li key={d.date} className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className="w-32 shrink-0 pt-1.5 text-sm font-bold text-[#13223F]">{fmt.day.format(new Date(d.times[0]))}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {d.times.map((t) => (
                        <Link key={t} href={bookHref({ area: area.area, start: t })}
                          className="rounded-xl border border-[#E7C98A] bg-[#FBF5E8] px-3 py-1.5 text-sm font-bold text-[#13223F] hover:bg-[#C49A4A] hover:text-[#0E1E3A]">
                          {fmt.time.format(new Date(t))}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {subject && (
            <Link href={bookHref()}
              className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#C49A4A] px-4 py-3.5 text-sm font-black text-[#0E1E3A] hover:bg-[#D4AE63]">
              <CalendarPlus size={17} aria-hidden /> {zh ? `預約 ${first} 的課` : `Book a lesson with ${first}`}
            </Link>
          )}
        </section>

        {/* Group classes */}
        {sessions.length > 0 && (
          <section>
            <h2 className="font-serif-tc text-2xl font-black text-[#13223F]">{zh ? `${first} 的近期班級課` : `Upcoming classes with ${first}`}</h2>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link href={routes.session(s.id)} className="block rounded-2xl border border-[#E2DDD2] bg-white p-4 hover:shadow-md transition-shadow">
                    <p className="font-bold text-[#13223F]">{s.title}</p>
                    <p className="mt-1 text-sm text-[#5B6478]">{fmt.full.format(new Date(s.start_time))}</p>
                    <p className="text-sm text-[#5B6478]">{s.location_name}{s.price_twd ? ` · NT$${s.price_twd.toLocaleString()}` : ""}</p>
                    {s.is_full && <p className="mt-1 text-xs font-bold text-red-600">{zh ? "已額滿" : "Full"}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Message */}
        <section id="message" className="rounded-3xl border border-[#E2DDD2] bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2 font-serif-tc text-2xl font-black text-[#13223F]">
            <MessageCircle size={22} aria-hidden /> {zh ? `留言給 ${first}` : `Message ${first}`}
          </h2>
          <p className="mt-1 text-sm text-[#5B6478]">
            {zh ? `${first} 會收到 LINE 通知，並直接回覆你。` : `${first} gets your message on LINE and will reply to you directly.`}
          </p>
          <MessageCoachForm coachKey={coach.slug || String(coach.id)} firstName={first} zh={zh} />
        </section>
      </main>
    </div>
  );
}
