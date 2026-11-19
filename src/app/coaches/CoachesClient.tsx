"use client";
// ─── Coaches & programs — its own page (was only a section of the homepage) ──
// The coaching team (from the backend), the programs and prices, why Artecks,
// and the next steps (book, packages, LINE).

import Link from "next/link";
import { CalendarPlus, MessageCircle, Package } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import BrochureBanner from "@/app/components/BrochureBanner";
import TeachWithUs from "@/app/components/TeachWithUs";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Coach } from "@/lib/types";

const LINE_URL = "https://line.me/R/ti/p/@843yqhoa";

export default function CoachesClient({ coaches }: { coaches: Omit<Coach, "line_id">[] }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <SiteHeader />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col gap-12">
        <header>
          <p className="text-sm font-semibold text-[#A07C34]">{zh ? "林口 · 台北 · 1–9 年級" : "Linkou & Taipei · Grades 1–9"}</p>
          <h1 className="mt-1 font-serif-tc text-3xl sm:text-4xl font-black text-[#13223F]">{zh ? "教練與課程" : "Coaches & programs"}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5B6478]">
            {zh
              ? "全英語授課的西洋棋課。每堂 60 分鐘，可選一對一、一對二或小班。我們會依孩子的程度與地點安排最適合的教練。"
              : "Chess lessons taught fully in English. 60-minute lessons, 1-on-1, paired or small group. We match each child with the coach who fits their level and location best."}
          </p>
        </header>

        {coaches.length > 0 && (
          <section aria-labelledby="team">
            <h2 id="team" className="font-serif-tc text-2xl font-black text-[#13223F]">{zh ? "我們的教練" : "Our coaches"}</h2>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coaches.map((c) => {
                const initials = c.avatar_initials || c.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <li key={c.id} className="rounded-3xl border border-[#E2DDD2] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#13223F] text-sm font-black text-[#E7C98A]">{initials}</span>
                      <div className="min-w-0">
                        <p className="font-black text-[#13223F] truncate">{c.name}{c.name_zh && <span className="ml-1.5 font-semibold text-[#5B6478]">{c.name_zh}</span>}</p>
                        {c.title && <p className="text-xs font-semibold text-[#A07C34]">{c.title}</p>}
                      </div>
                    </div>
                    {c.subjects && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.subjects.split(/[,，、]/).map((x) => x.trim()).filter(Boolean).map((x) => (
                          <span key={x} className="rounded-full bg-[#FBF5E8] px-2.5 py-0.5 text-[11px] font-bold text-[#A07C34]">{x}</span>
                        ))}
                      </div>
                    )}
                    {c.bio && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#5B6478]">{c.bio}</p>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-label={zh ? "課程與特色" : "Programs and why us"}>
          <BrochureBanner locale={locale} />
        </section>

        <section className="rounded-3xl border border-[#E2DDD2] bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif-tc text-2xl font-black text-[#13223F]">{zh ? "下一步" : "Next steps"}</h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/book" className="flex items-center justify-center gap-2 rounded-2xl bg-[#C49A4A] px-4 py-3.5 text-sm font-black text-[#0E1E3A] hover:bg-[#D4AE63]">
              <CalendarPlus size={17} aria-hidden /> {zh ? "預約課程" : "Book a lesson"}
            </Link>
            <Link href="/packages" className="flex items-center justify-center gap-2 rounded-2xl bg-[#13223F] px-4 py-3.5 text-sm font-black text-white hover:bg-[#1c2f55]">
              <Package size={17} aria-hidden /> {zh ? "課程套票" : "Lesson packages"}
            </Link>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-[#06C755] px-4 py-3.5 text-sm font-black text-white hover:opacity-90">
              <MessageCircle size={17} aria-hidden /> {zh ? "LINE 詢問" : "Ask us on LINE"}
            </a>
          </div>
        </section>

        <TeachWithUs />
      </main>
    </div>
  );
}
