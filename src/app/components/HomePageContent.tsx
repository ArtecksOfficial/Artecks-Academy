"use client";
// ─── HomePageContent ──────────────────────────────────────────────────────────
// Client component — receives server-fetched data and renders with live i18n.

import { MapPin, Clock, Users, Crown, ArrowRight, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { AcademySession, Coach, Provider } from "@/lib/types";
import HomeSubscribeButton from "./HomeSubscribeButton";
import AuthButton from "./AuthButton";
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
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
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

  const navLinks = [
    { label: locale === "zh" ? "首頁" : "Home", id: "home" },
    { label: t("navWhyChess"), id: "why-chess" },
    { label: t("navSessions"), id: "sessions" },
    { label: t("navTestimonials"), id: "testimonials" },
    { label: t("navFaq"), id: "faq" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <p className="text-sm font-black text-gray-900 leading-none">Linkou Artecks Academy</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <MapPin size={11} className="text-indigo-500" />
              <span className="font-semibold text-indigo-600">{t("locationLabel")}</span>
            </div>
            <LanguageToggle />
            <AuthButton />
          </div>
        </div>

        {/* ── Anchor nav ── */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-3 sm:px-5 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="flex-shrink-0 text-xs font-semibold text-gray-500 hover:text-indigo-600 px-3 py-2.5 transition-colors whitespace-nowrap"
              >
                {label}
              </button>
            ))}

          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: "#0a0818", overflow: "hidden", position: "relative", minHeight: "520px" }}>
        {/* Background photo */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(https://images.pexels.com/photos/39191114/pexels-photo-39191114.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)`,
          backgroundSize: "cover", backgroundPosition: "center 70%", opacity: 0.45,
        }} />
        {/* Gradient overlay */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(10,8,24,0.92) 0%, rgba(49,46,129,0.55) 60%, rgba(10,8,24,0.75) 100%)",
        }} />
        {/* Accent glow */}
        <div aria-hidden="true" style={{
          position: "absolute", top: "-120px", right: "-80px", width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", pointerEvents: "none",
        }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32 flex flex-col gap-8">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-3 py-1 rounded-full tracking-widest uppercase">
              林口 · Linkou · New Taipei
            </span>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/60 px-3 py-1 rounded-full tracking-wide flex items-center gap-1">
              🇬🇧 {locale === "zh" ? "全英語授課" : "Taught in English"}
            </span>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-3 max-w-2xl">
            <h1 className="text-5xl sm:text-7xl font-black text-white leading-[1.0] tracking-tight"
              style={{ textShadow: "0 4px 32px rgba(0,0,0,0.8)" }}>
              {t("heroTitle1")}
              <br />
              <span style={{ background: "linear-gradient(90deg,#a5b4fc,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("heroTitle2")}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-indigo-200/90 max-w-lg leading-relaxed" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}>
              {t("whyChessSub")}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a href="/sessions"
              className="inline-flex items-center gap-2 text-sm font-black px-7 py-3.5 rounded-xl transition-all shadow-xl"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", boxShadow: "0 8px 32px rgba(99,102,241,0.45)" }}>
              {t("heroCta")} <ArrowRight size={15} />
            </a>
            {plan && <HomeSubscribeButton planId={plan.id} discountPercent={plan.discount_percent} />}
          </div>

          {/* Social proof bar */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {[
              { v: "40+", l: locale === "zh" ? "位學員" : "Students Taught" },
              { v: "★★★★★", l: locale === "zh" ? "家長評價" : "Parent Reviews" },
              { v: "100%", l: locale === "zh" ? "全英語授課" : "English Instruction" },
            ].map(({ v, l }) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">{v}</span>
                <span className="text-xs text-indigo-300 font-medium">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-4">
          {[
            { icon: "♟", stat: locale === "zh" ? "專業教練" : "Expert Coaches", sub: locale === "zh" ? "Artecks 認證" : "Artecks Certified" },
            { icon: "🧒", stat: locale === "zh" ? "5 歲以上" : "Ages 5 & Up", sub: locale === "zh" ? "從零開始" : "Absolute beginners welcome" },
            { icon: "👥", stat: locale === "zh" ? "小班教學" : "Max 8 Students", sub: locale === "zh" ? "每位教練最多 8 人" : "Per coach, every session" },
            { icon: "🇬🇧", stat: locale === "zh" ? "全英語授課" : "100% English", sub: locale === "zh" ? "林口唯一英語棋課" : "Only English chess in Linkou" },
          ].map(({ icon, stat, sub }) => (
            <div key={stat} className="bg-white rounded-2xl border border-gray-200 px-4 py-4 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">{icon}</span>
              <p className="text-sm font-black text-gray-900">{stat}</p>
              <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Trial CTA ── */}
        <section className="rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #451a03 0%, #78350f 100%)" }}>
          <div aria-hidden="true" style={{
            position: "absolute", top: "-80px", left: "-80px", width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)", pointerEvents: "none",
          }} />
          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-6xl flex-shrink-0 select-none">♟</div>
            <div className="flex flex-col gap-3 flex-1">
              <span className="text-xs font-bold text-amber-400 bg-amber-900/50 border border-amber-700/50 px-2.5 py-1 rounded-full w-fit uppercase tracking-wide">
                {t("trialBadge")}
              </span>
              <h3 className="text-2xl font-black text-white">{t("trialTitle")}</h3>
              <p className="text-sm text-amber-100/80 leading-relaxed max-w-xl">{t("trialSub")}</p>
            </div>
            <a
              href="/sessions"
              className="flex-shrink-0 inline-flex items-center gap-2 font-black text-sm px-6 py-3.5 rounded-xl transition-all whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", boxShadow: "0 8px 24px rgba(245,158,11,0.4)" }}
            >
              {t("trialCta")} <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* ── English Callout ── */}
        <section className="rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" }}>
          <div aria-hidden="true" style={{
            position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px",
            background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)", pointerEvents: "none",
          }} />
          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-6xl flex-shrink-0 select-none">🇬🇧</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-900/50 border border-emerald-700/50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {locale === "zh" ? "林口唯一" : "Linkou Exclusive"}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{t("englishCalloutTitle")}</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{t("englishCalloutDesc")}</p>
            </div>
          </div>
        </section>

        {/* ── Why Chess ── */}
        <section id="why-chess" style={{ scrollMarginTop: "120px" }}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900">{t("whyChessTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("whyChessSub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { iconKey: "whyChess1Icon" as DictionaryKey, titleKey: "whyChess1Title" as DictionaryKey, descKey: "whyChess1Desc" as DictionaryKey, color: "bg-blue-50 border-blue-100" },
              { iconKey: "whyChess2Icon" as DictionaryKey, titleKey: "whyChess2Title" as DictionaryKey, descKey: "whyChess2Desc" as DictionaryKey, color: "bg-amber-50 border-amber-100" },
              { iconKey: "whyChess3Icon" as DictionaryKey, titleKey: "whyChess3Title" as DictionaryKey, descKey: "whyChess3Desc" as DictionaryKey, color: "bg-violet-50 border-violet-100" },
              { iconKey: "whyChess4Icon" as DictionaryKey, titleKey: "whyChess4Title" as DictionaryKey, descKey: "whyChess4Desc" as DictionaryKey, color: "bg-rose-50 border-rose-100" },
              { iconKey: "whyChess5Icon" as DictionaryKey, titleKey: "whyChess5Title" as DictionaryKey, descKey: "whyChess5Desc" as DictionaryKey, color: "bg-orange-50 border-orange-100" },
              { iconKey: "whyChess6Icon" as DictionaryKey, titleKey: "whyChess6Title" as DictionaryKey, descKey: "whyChess6Desc" as DictionaryKey, color: "bg-emerald-50 border-emerald-100" },
            ]).map(({ iconKey, titleKey, descKey, color }) => (
              <div key={titleKey} className={`rounded-2xl border p-6 flex flex-col gap-3 ${color}`}>
                <span className="text-3xl">{t(iconKey)}</span>
                <p className="font-black text-gray-900 text-sm">{t(titleKey)}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skill Roadmap ── */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900">{t("roadmapTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("roadmapSub")}</p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-200 -translate-x-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { badge: t("roadmapL1Badge"), title: t("roadmapL1Title"), desc: t("roadmapL1Desc"), skills: t("roadmapL1Skills"), color: "bg-indigo-50 border-indigo-200", badge_color: "bg-indigo-600 text-white", num: "01" },
                { badge: t("roadmapL2Badge"), title: t("roadmapL2Title"), desc: t("roadmapL2Desc"), skills: t("roadmapL2Skills"), color: "bg-violet-50 border-violet-200", badge_color: "bg-violet-600 text-white", num: "02" },
                { badge: t("roadmapL3Badge"), title: t("roadmapL3Title"), desc: t("roadmapL3Desc"), skills: t("roadmapL3Skills"), color: "bg-blue-50 border-blue-200", badge_color: "bg-blue-600 text-white", num: "03" },
                { badge: t("roadmapL4Badge"), title: t("roadmapL4Title"), desc: t("roadmapL4Desc"), skills: t("roadmapL4Skills"), color: "bg-emerald-50 border-emerald-200", badge_color: "bg-emerald-600 text-white", num: "04" },
              ] as const).map(({ badge, title, desc, skills, color, badge_color, num }) => (
                <div key={num} className={`rounded-2xl border p-6 flex flex-col gap-3 ${color} hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${badge_color}`}>{badge}</span>
                    <span className="text-3xl font-black text-gray-100 select-none">{num}</span>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-base">{title}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {skills.split(" · ").map(s => (
                      <span key={s} className="text-[11px] font-semibold text-gray-500 bg-white/70 border border-gray-200 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Upcoming sessions ── */}
        <section id="sessions" style={{ scrollMarginTop: "120px" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900">{t("upcomingTitle")}</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {upcoming.length > 0
                  ? `${upcoming.length} ${t("upcomingSubOpen")}`
                  : t("upcomingSubEmpty")}
              </p>
            </div>
            {upcoming.length > 0 && (
              <a href="/sessions" className="hidden sm:flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                {t("calendarView")} <ChevronRight size={14} />
              </a>
            )}
          </div>

          {upcoming.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map(s => <SessionCard key={s.id} session={s} locale={locale} t={t} />)}
              </div>
              <div className="mt-4 text-center">
                <a href="/sessions" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:underline">
                  {t("seeAllSessions")} <ChevronRight size={14} />
                </a>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 px-8 text-center flex flex-col items-center gap-4">
              <span className="text-5xl">♟</span>
              <div>
                <p className="text-base font-bold text-gray-600">{t("emptyTitle")}</p>
                <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">{t("emptyDesc")}</p>
              </div>
              {plan && (
                <div className="mt-2 flex flex-col items-center gap-3">
                  <HomeSubscribeButton planId={plan.id} discountPercent={plan.discount_percent} />
                  {plan && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Crown size={11} className="text-yellow-500" />
                      {locale === "zh"
                        ? `會員每堂課享 ${plan.discount_percent}% 折扣`
                        : `Members save ${plan.discount_percent}% on every session`}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" style={{ scrollMarginTop: "120px" }}>
          <style>{`
            @keyframes marquee-scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .marquee-track { animation: marquee-scroll 40s linear infinite; }
            .marquee-track:hover { animation-play-state: paused; }
          `}</style>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900">{t("testimonialsTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("testimonialsSub")}</p>
          </div>
          <div className="overflow-hidden -mx-4 sm:-mx-6">
            <div className="marquee-track flex gap-4 w-max">
              {([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10] as const).map((n, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 w-72 flex-shrink-0 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{t(`testimonial${n}Quote` as DictionaryKey)}</p>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm font-bold text-gray-900">{t(`testimonial${n}Name` as DictionaryKey)}</p>
                    <p className="text-xs text-gray-400">{t(`testimonial${n}Role` as DictionaryKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Coaches (from sessions API) ── */}
        {coaches.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">{t("coachesTitle")}</h2>
              <p className="text-sm text-gray-500 mt-1">{t("coachesSub")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coaches.map(c => <CoachCard key={c.id} coach={c} locale={locale} t={t} />)}
            </div>
          </section>
        )}

        {/* ── Coach spotlight (always visible) ── */}
        {coaches.length === 0 && (
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-gray-900">{t("coachSpotlightTitle")}</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col sm:flex-row items-start gap-6 hover:shadow-md transition-shadow max-w-2xl mx-auto">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 text-white text-2xl font-black"
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
              >
                IC
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-black text-gray-900 text-lg">{t("coachSpotlightName")}</p>
                <p className="text-xs text-indigo-600 font-semibold">{t("coachSpotlightCredential")}</p>
                <p className="text-sm text-gray-500 leading-relaxed mt-1">{t("coachSpotlightBio")}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section id="faq" style={{ scrollMarginTop: "120px" }}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900">{t("faqTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("faqSub")}</p>
          </div>
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            {([
              { qKey: "faq1Q" as DictionaryKey, aKey: "faq1A" as DictionaryKey },
              { qKey: "faq2Q" as DictionaryKey, aKey: "faq2A" as DictionaryKey },
              { qKey: "faq3Q" as DictionaryKey, aKey: "faq3A" as DictionaryKey },
              { qKey: "faq4Q" as DictionaryKey, aKey: "faq4A" as DictionaryKey },
              { qKey: "faq5Q" as DictionaryKey, aKey: "faq5A" as DictionaryKey },
            ]).map(({ qKey, aKey }) => (
              <FaqItem key={qKey} q={t(qKey)} a={t(aKey)} />
            ))}
          </div>
        </section>


        {/* ── LINE Contact ── */}
        <section className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #06C755 0%, #00a544 100%)" }}>
          <div className="p-8 sm:p-10 flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">{t("lineTitle")}</h2>
              <p className="text-sm text-green-100/80 mt-1">{t("lineSub")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { labelKey: "lineClubLabel" as DictionaryKey, descKey: "lineClubDesc" as DictionaryKey, href: "https://line.me/R/ti/g/t8ChQN7Uxm" },
                { labelKey: "linePrivateLabel" as DictionaryKey, descKey: "linePrivateDesc" as DictionaryKey, href: "https://line.me/R/ti/g/wFsD8CkSGR" },
              ]).map(({ labelKey, descKey, href }) => (
                <a key={labelKey} href={href} target="_blank" rel="noopener noreferrer"
                  className="bg-white/15 hover:bg-white/25 border border-white/30 rounded-2xl p-5 flex flex-col gap-3 transition-all group">
                  <p className="font-black text-white text-base">{t(labelKey)}</p>
                  <p className="text-sm text-green-100/80 leading-relaxed flex-1">{t(descKey)}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-green-900 bg-white px-4 py-2 rounded-xl w-fit group-hover:bg-green-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                    {t("lineJoin")}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-200 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-base">♟</span>
            <span className="font-bold text-gray-500">Artecks Academy</span>
            <span>· Linkou, New Taipei</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/sessions" className="hover:text-indigo-600 transition-colors font-medium">{t("footerBook")}</a>
            <a href="/bookings/mine" className="hover:text-indigo-600 transition-colors font-medium">{t("footerBookings")}</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
