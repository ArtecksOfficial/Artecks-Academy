"use client";
// ─── HomePageContent ──────────────────────────────────────────────────────────
// Client component — receives server-fetched data and renders with live i18n.

import HeroBoard from "./HeroBoard";
import AuthButton from "./AuthButton";
import BrochureBanner from "./BrochureBanner";
import { MapPin, Clock, Users, Crown, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { AcademySession, Coach, Provider } from "@/lib/types";
import HomeSubscribeButton from "./HomeSubscribeButton";
import { useLanguage, LanguageToggle } from "@/lib/i18n/LanguageContext";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "zh" ? "zh-TW" : "en-US", {
    timeZone: "Asia/Taipei", weekday: "short", month: "short", day: "numeric",
  });
}
function fmtTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale === "zh" ? "zh-TW" : "en-US", {
    timeZone: "Asia/Taipei", hour: "numeric", minute: "2-digit", hour12: true,
  });
}
function durationMins(start: string, end: string | null) {
  if (!end) return null;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}
function uniqueCoaches(sessions: AcademySession[]): Coach[] {
  const seen = new Set<number>();
  const coaches: Coach[] = [];
  for (const s of sessions) {
    if (s.coach && !seen.has(s.coach.id)) { seen.add(s.coach.id); coaches.push(s.coach); }
  }
  return coaches;
}

function scrollTo(id: string) {
  if (id === "home") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({ session, locale, t }: {
  session: AcademySession;
  locale: string;
  t: (k: DictionaryKey) => string;
}) {
  const canBook = session.booking_open && !session.is_full && session.status === "open";
  const dur = durationMins(session.start_time, session.end_time);

  return (
    <a
      href={`/session/${session.id}`}
      className="group bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {fmtDate(session.start_time, locale)}
          </span>
          <span className="text-xs text-gray-400 font-medium">{fmtTime(session.start_time, locale)}</span>
        </div>
        {session.is_full ? (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{t("statusFull")}</span>
        ) : session.status === "cancelled" ? (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">{t("statusCancelled")}</span>
        ) : canBook ? (
          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{t("statusOpen")}</span>
        ) : null}
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{session.title}</p>
        {session.topic && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{session.topic}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {dur && (
          <span className="flex items-center gap-1"><Clock size={11} className="text-gray-400" />{dur} {t("durationMin")}</span>
        )}
        <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{session.location_name ?? "TBD"}</span>
        {!session.is_full && (
          <span className="flex items-center gap-1">
            <Users size={11} className="text-gray-400" />
            {locale === "zh"
              ? `剩 ${session.available_spots} 個名額`
              : `${session.available_spots} spot${session.available_spots !== 1 ? "s" : ""} left`}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        {session.coach ? (
          <span className="text-xs text-gray-500 font-medium">
            {t("withCoach")}{locale === "zh" ? "：" : " "}
            <span className="text-gray-800 font-bold">
              {locale === "zh" && session.coach.name_zh ? session.coach.name_zh : session.coach.name}
            </span>
          </span>
        ) : <span />}
        <span className="text-sm font-black text-indigo-600">
          {session.price_twd ? `NT$${session.price_twd.toLocaleString()}` : t("priceFree")}
        </span>
      </div>
    </a>
  );
}

// ── Coach Card ────────────────────────────────────────────────────────────────

function CoachCard({ coach, locale, t }: { coach: Coach; locale: string; t: (k: DictionaryKey) => string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xl font-black"
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
        >
          {coach.avatar_initials || coach.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-black text-gray-900 text-base">
            {locale === "zh" && coach.name_zh ? coach.name_zh : coach.name}
          </p>
          {coach.name_zh && locale === "en" && (
            <p className="text-xs text-gray-400 font-medium">{coach.name_zh}</p>
          )}
          <p className="text-xs text-indigo-600 font-semibold mt-0.5">{coach.title}</p>
        </div>
      </div>
      {coach.bio && (
        <p className="text-sm text-gray-500 leading-relaxed flex-1">{coach.bio}</p>
      )}
      <a
        href="/sessions"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold py-2.5 transition-colors"
      >
        {t("viewSessions")} <ChevronRight size={14} />
      </a>
    </div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  const renderAnswer = (text: string) => {
    const blocks = text.split("\n\n");
    return blocks.map((block, bi) => {
      const lines = block.split("\n");
      const isList = lines.every(l => l.startsWith("• "));
      if (isList) {
        return (
          <ul key={bi} className="list-disc list-inside space-y-1 mt-2">
            {lines.map((l, li) => (
              <li key={li}>{l.slice(2)}</li>
            ))}
          </ul>
        );
      }
      const mixed = lines.some(l => l.startsWith("• "));
      if (mixed) {
        return (
          <div key={bi} className="mt-2 space-y-1">
            {lines.map((l, li) =>
              l.startsWith("• ") ? (
                <div key={li} className="flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span>{l.slice(2)}</span>
                </div>
              ) : (
                <p key={li} className={li > 0 ? "mt-1" : ""}>{l}</p>
              )
            )}
          </div>
        );
      }
      return <p key={bi} className={bi > 0 ? "mt-2" : ""}>{block}</p>;
    });
  };

  return (
    <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-bold text-gray-900 text-sm">{q}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-4">
          <div className="text-sm text-gray-600 leading-relaxed">{renderAnswer(a)}</div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  sessions: AcademySession[];
  provider: Provider | null;
}

export default function HomePageContent({ sessions, provider }: Props) {
  const { locale, t } = useLanguage();

  const coaches = uniqueCoaches(sessions);
  const upcoming = sessions
    .filter(s => s.status !== "cancelled" && s.booking_open)
    .slice(0, 9);
  const plan = provider?.plans[0] ?? null;

  const zh = locale === "zh";
  const navLinks: { label: string; href?: string; id?: string }[] = [
    { label: zh ? "教練與課程" : "Coaches & programs", id: "coaches-programs" },
    { label: zh ? "預約課程" : "Book", href: "/book" },
    { label: zh ? "課程套票" : "Packages", href: "/packages" },
    { label: zh ? "🏆 排行榜" : "🏆 Leaderboard", href: "/leaderboard" },
    { label: t("navFaq"), id: "faq" },
    { label: zh ? "聯絡我們" : "Contact", id: "line-contact" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F6F2", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <p className="text-sm font-black text-gray-900 leading-none">Artecks Academy</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <MapPin size={11} className="text-indigo-500" />
              <span className="font-semibold text-indigo-600">{t("locationLabel")}</span>
            </div>
            <AuthButton locale={locale} />
            <LanguageToggle />
          </div>
        </div>

        {/* ── Anchor nav ── */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-3 sm:px-5 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {navLinks.map(({ label, href, id }) => href ? (
              <a key={label} href={href}
                className="flex-shrink-0 text-xs font-semibold text-gray-600 hover:text-[#A07C34] px-3 py-2.5 transition-colors whitespace-nowrap">
                {label}
              </a>
            ) : (
              <button key={label} onClick={() => scrollTo(id!)}
                className="flex-shrink-0 text-xs font-semibold text-gray-600 hover:text-[#A07C34] px-3 py-2.5 transition-colors whitespace-nowrap">
                {label}
              </button>
            ))}

          </div>
        </div>
      </header>

      {/* ── Hero: the board is the one bold element ── */}
      <section id="home" className="relative overflow-hidden" style={{ background: "#0E1E3A" }}>
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "repeating-conic-gradient(#C49A4A 0% 25%, transparent 0% 50%)", backgroundSize: "72px 72px" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="flex flex-col gap-7">
            <p className="text-sm text-[#C49A4A] font-semibold">
              {zh ? "林口 · 台北 · 1–9 年級" : "Linkou & Taipei · Grades 1–9"}
            </p>
            <h1 className="font-serif-tc text-[2.15rem] leading-[1.2] sm:text-6xl sm:leading-[1.1] font-black text-white tracking-tight">
              {t("heroTitle1")}
              <span className="block font-bold text-[#E9DCC0]">{t("heroTitle2")}</span>
            </h1>
            <p className="text-base sm:text-lg text-[#C9D2E3] max-w-md leading-relaxed">{t("whyChessSub")}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://lin.ee/6cna1xVd" target="_blank" rel="noopener noreferrer"
                className="inline-flex justify-center items-center rounded-xl px-6 py-3.5 text-base font-black text-[#0E1E3A] bg-[#C49A4A] hover:bg-[#D3AB5C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9DCC0]">
                {t("heroTrialCta")}
              </a>
              <a href="/book"
                className="inline-flex justify-center items-center rounded-xl px-6 py-3.5 text-base font-bold text-white border border-white/30 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9DCC0]">
                {t("heroBookCta")}
              </a>
            </div>
            <p className="text-xs text-[#9FAAC0] -mt-3">{t("heroTrialNote")}</p>
          </div>
          <HeroBoard caption={zh ? "每一步都用英文說出來——孩子邊下棋邊學英文。" : "Every move is said in English — kids learn the language while they play."} />
        </div>
        {/* Facts, folded into the hero instead of a row of cards */}
        <div className="relative border-t border-white/10">
          <dl className="max-w-6xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-y-4 text-white">
            {[
              { v: "40+", l: zh ? "位學員" : "students taught" },
              { v: zh ? "2024 全國冠軍" : "2024 champion", l: zh ? "創辦人（公開組）" : "founder, national open" },
              { v: zh ? "一對一 · 小班" : "1-on-1 & groups", l: zh ? "依年齡與程度配對" : "matched by age & level" },
              { v: "100%", l: zh ? "英語授課" : "taught in English" },
            ].map(({ v, l }) => (
              <div key={l} className="sm:border-l sm:first:border-l-0 border-white/10 sm:pl-6 sm:first:pl-0">
                <dt className="sr-only">{l}</dt>
                <dd className="font-serif-tc text-xl font-bold text-[#E9DCC0]">{v}</dd>
                <dd className="text-xs text-[#9FAAC0] mt-0.5">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 flex flex-col gap-20">

        {/* ── Coaches & programs (from the printed brochure) ── */}
        <BrochureBanner locale={locale} />

        {/* ── Why chess: a plain list, each point marked by a piece ── */}
        <section id="why-chess" style={{ scrollMarginTop: "120px" }}>
          <h2 className="font-serif-tc text-3xl font-black text-[#13223F]">{t("whyChessTitle")}</h2>
          <p className="mt-2 text-sm text-[#5B6478] max-w-lg">{t("whyChessSub")}</p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {(["♙", "♘", "♗", "♖", "♕", "♔"] as const).map((piece, i) => {
              const n = i + 1;
              return (
                <li key={n} className="flex gap-4">
                  <span aria-hidden="true" className="text-3xl leading-none text-[#C49A4A] w-8 flex-shrink-0">{piece}</span>
                  <div>
                    <p className="font-bold text-[#13223F]">{t(`whyChess${n}Title` as DictionaryKey)}</p>
                    <p className="mt-1 text-sm text-[#5B6478] leading-relaxed">{t(`whyChess${n}Desc` as DictionaryKey)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Roadmap: a real sequence, so it is numbered ── */}
        <section>
          <h2 className="font-serif-tc text-3xl font-black text-[#13223F]">{t("roadmapTitle")}</h2>
          <p className="mt-2 text-sm text-[#5B6478]">{t("roadmapSub")}</p>
          <ol className="mt-8 grid sm:grid-cols-4 gap-6 relative">
            <span aria-hidden="true" className="hidden sm:block absolute top-5 left-5 right-5 h-px bg-[#C49A4A]/40" />
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="relative flex sm:flex-col gap-4">
                <span className="relative z-10 w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-serif-tc font-black text-[#0E1E3A] bg-[#E9DCC0] ring-4 ring-[#F7F6F2]">{n}</span>
                <div>
                  <p className="text-xs font-semibold text-[#A07C34]">{t(`roadmapL${n}Badge` as DictionaryKey)}</p>
                  <p className="mt-0.5 font-bold text-[#13223F]">{t(`roadmapL${n}Title` as DictionaryKey)}</p>
                  <p className="mt-1 text-sm text-[#5B6478] leading-relaxed">{t(`roadmapL${n}Desc` as DictionaryKey)}</p>
                  <p className="mt-2 text-xs text-[#8A92A3]">{t(`roadmapL${n}Skills` as DictionaryKey).split(" · ").join("、")}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── LINE Contact ── */}
        <section id="line-contact" className="rounded-2xl overflow-hidden" style={{ scrollMarginTop: "120px", background: "#06C755" }}>
          <div className="p-8 sm:p-10 flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-serif-tc text-3xl font-black text-white">{t("lineTitle")}</h2>
              <p className="text-sm text-green-100/80 mt-1">{t("lineSub")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { labelKey: "lineClubLabel" as DictionaryKey, descKey: "lineClubDesc" as DictionaryKey, href: "https://line.me/R/ti/g/t8ChQN7Uxm", btnKey: "lineJoin" as DictionaryKey },
                { labelKey: "linePrivateLabel" as DictionaryKey, descKey: "linePrivateDesc" as DictionaryKey, href: "https://lin.ee/6cna1xVd", btnKey: "lineContact" as DictionaryKey },
              ]).map(({ labelKey, descKey, href, btnKey }) => (
                <a key={labelKey} href={href} target="_blank" rel="noopener noreferrer"
                  className="bg-white/15 hover:bg-white/25 border border-white/30 rounded-2xl p-5 flex flex-col gap-3 transition-all group">
                  <p className="font-black text-white text-base">{t(labelKey)}</p>
                  <p className="text-sm text-green-100/80 leading-relaxed flex-1">{t(descKey)}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-green-900 bg-white px-4 py-2 rounded-xl w-fit group-hover:bg-green-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                    {t(btnKey)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ scrollMarginTop: "120px" }}>
          <div className="mb-8 text-center">
            <h2 className="font-serif-tc text-3xl font-black text-[#13223F]">{t("faqTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("faqSub")}</p>
          </div>
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            {([
              { qKey: "faq1Q" as DictionaryKey, aKey: "faq1A" as DictionaryKey },
              { qKey: "faq2Q" as DictionaryKey, aKey: "faq2A" as DictionaryKey },
                        { qKey: "faq3Q" as DictionaryKey, aKey: "faq3A" as DictionaryKey },
              { qKey: "faq4Q" as DictionaryKey, aKey: "faq4A" as DictionaryKey },
              { qKey: "faq5Q" as DictionaryKey, aKey: "faq5A" as DictionaryKey },
              { qKey: "faq6Q" as DictionaryKey, aKey: "faq6A" as DictionaryKey },
            ]).map(({ qKey, aKey }) => (
              <FaqItem key={qKey} q={t(qKey)} a={t(aKey)} />
            ))}
          </div>
        </section>


        {/* ── Footer ── */}
        <footer className="border-t border-gray-200 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#C49A4A]">♞</span>
            <span className="font-bold text-gray-500">Artecks Academy</span>
            <span>· Linkou, New Taipei</span>
          </div>

        </footer>

      </div>
    </div>
  );
}
