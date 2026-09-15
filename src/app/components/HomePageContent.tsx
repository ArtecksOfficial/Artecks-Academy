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
            <div className="ml-auto flex-shrink-0 py-1.5">
              <a
                href="/sessions"
                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-1.5 rounded-lg transition-colors"
              >
                {t("heroCta")} <ArrowRight size={11} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: "#0f0d2a", overflow: "hidden", position: "relative" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(https://images.pexels.com/photos/39191114/pexels-photo-39191114.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)`,
            backgroundSize: "cover", backgroundPosition: "center 75%", opacity: 1,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(15,13,42,0.35) 0%, rgba(15,13,42,0.25) 50%, rgba(15,13,42,0.55) 100%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-36 flex flex-col gap-6">
          <div className="flex flex-col gap-5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-3 py-1 rounded-full tracking-wide uppercase w-fit">
                林口 · Linkou · New Taipei
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-700/50 px-3 py-1 rounded-full tracking-wide w-fit">
                {t("englishBadge")}
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.8)" }}>
              {t("heroTitle1")}<br />
              <span style={{ color: "#818CF8" }}>{t("heroTitle2")}</span>
            </h1>
            <p className="text-base text-indigo-100 max-w-md leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              {t("whyChessSub")}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <a
                href="/sessions"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-black px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                {t("heroCta")} <ArrowRight size={15} />
              </a>
              {plan && <HomeSubscribeButton planId={plan.id} discountPercent={plan.discount_percent} />}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">

        {/* ── Trust pills ── */}
        <div className="flex flex-wrap justify-center gap-3 -mt-4">
          {[
            { icon: "♟", label: t("trustCoaches") },
            { icon: "👶", label: t("trustAges") },
            { icon: "👥", label: t("trustGroups") },
            { icon: "🇬🇧", label: t("englishBadge") },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-full shadow-sm">
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>

        {/* ── English Callout ── */}
        <section className="rounded-3xl overflow-hidden border border-emerald-200" style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" }}>
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-5xl flex-shrink-0">🇬🇧</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-emerald-900">{t("englishCalloutTitle")}</h3>
              <p className="text-sm text-emerald-800 leading-relaxed max-w-xl">{t("englishCalloutDesc")}</p>
            </div>
          </div>
        </section>

        {/* ── Why Chess ── */}
        <section id="why-chess" style={{ scrollMarginTop: "90px" }}>
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

        {/* ── Upcoming sessions ── */}
        <section id="sessions" style={{ scrollMarginTop: "90px" }}>
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
        <section id="testimonials" style={{ scrollMarginTop: "90px" }}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900">{t("testimonialsTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("testimonialsSub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { quoteKey: "testimonial1Quote" as DictionaryKey, nameKey: "testimonial1Name" as DictionaryKey, roleKey: "testimonial1Role" as DictionaryKey },
              { quoteKey: "testimonial2Quote" as DictionaryKey, nameKey: "testimonial2Name" as DictionaryKey, roleKey: "testimonial2Role" as DictionaryKey },
              { quoteKey: "testimonial3Quote" as DictionaryKey, nameKey: "testimonial3Name" as DictionaryKey, roleKey: "testimonial3Role" as DictionaryKey },
            ]).map(({ quoteKey, nameKey, roleKey }) => (
              <div key={nameKey} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="text-indigo-400 text-3xl leading-none font-black select-none">&ldquo;</div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1 -mt-2">{t(quoteKey)}</p>
                <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
                  >
                    {t(nameKey).slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t(nameKey)}</p>
                    <p className="text-xs text-gray-400">{t(roleKey)}</p>
                  </div>
                </div>
              </div>
            ))}
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
        <section id="faq" style={{ scrollMarginTop: "90px" }}>
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
