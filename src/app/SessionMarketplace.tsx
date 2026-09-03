"use client";

import { useState, useMemo, useRef } from "react";
import type { AcademySession } from "@/lib/types";
import { MapPin, Clock, Users, Star, ChevronRight, Filter } from "lucide-react";

// ── Coaches ───────────────────────────────────────────────────────────────────

const COACHES = [
  {
    id: "issac",
    name: "Issac Chang",
    nameZH: "張老師",
    title: "Head Coach · Artecks Founder",
    rating: 5.0,
    reviews: 24,
    bio: "Founder of Artecks and lead chess educator at Linkou Academy. Passionate about making chess accessible and fun for youth.",
    avatar: "IC",
    color: "#4F46E5",
  },
  {
    id: "michael",
    name: "Michael Ladror",
    nameZH: "麥可老師",
    title: "Chess Instructor",
    rating: 4.9,
    reviews: 18,
    bio: "Experienced chess instructor specialising in tactics, strategy, and helping beginners build a solid foundation.",
    avatar: "ML",
    color: "#0EA5E9",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TZ = "Asia/Taipei";

function toTaipei(iso: string) {
  return new Date(new Date(iso).toLocaleString("en-US", { timeZone: TZ }));
}

function fmtMonth(d: Date) {
  return d.toLocaleString("en-US", { month: "short" });
}
function fmtDay(d: Date) {
  return d.getDate();
}
function fmtWeekday(d: Date) {
  return d.toLocaleString("en-US", { weekday: "short" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
function fmtDateFull(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}
function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// ── Date strip ────────────────────────────────────────────────────────────────

function DateStrip({
  days,
  sessionDates,
  selected,
  onSelect,
}: {
  days: Date[];
  sessionDates: Set<string>;
  selected: string | null;
  onSelect: (d: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {/* "All" chip */}
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
          selected === null
            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200"
            : "border-gray-200 bg-white text-gray-500 hover:border-indigo-300"
        }`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide">All</span>
        <span className="text-base font-black mt-0.5">★</span>
      </button>

      {days.map((d) => {
        const key = isoDate(d);
        const hasSessions = sessionDates.has(key);
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(isSelected ? null : key)}
            disabled={!hasSessions}
            className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs transition-all ${
              isSelected
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200"
                : hasSessions
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-400 cursor-pointer"
                : "border-gray-100 bg-white text-gray-300 cursor-default"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wide font-semibold">
              {fmtMonth(d)}
            </span>
            <span className="text-lg font-black leading-none mt-0.5">{fmtDay(d)}</span>
            <span className="text-[10px] mt-0.5">{fmtWeekday(d)}</span>
            {hasSessions && (
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  isSelected ? "bg-white" : "bg-indigo-500"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: AcademySession }) {
  const isOpen = session.status === "open" && session.booking_open && !session.is_full;
  const spotsLeft = session.available_spots;
  const fillPct = session.max_seats > 0
    ? Math.round(((session.max_seats - spotsLeft) / session.max_seats) * 100)
    : 0;
  const start = toTaipei(session.start_time);

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden flex">
      {/* Date panel */}
      <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center bg-indigo-50 border-r border-indigo-100 py-5 px-2 gap-0.5">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
          {fmtMonth(start)}
        </span>
        <span className="text-3xl font-black text-indigo-700 leading-none">
          {fmtDay(start)}
        </span>
        <span className="text-[10px] font-semibold text-indigo-400">
          {fmtWeekday(start)}
        </span>
        <span className="text-[10px] text-indigo-500 mt-1 font-medium">
          {fmtTime(session.start_time)}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              session.is_full
                ? "bg-red-50 text-red-500 border-red-200"
                : isOpen
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}
          >
            {session.is_full ? "Full" : isOpen ? "Open" : "Closed"}
          </span>
          {session.age_group && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
              {session.age_group}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-black text-gray-900 leading-snug truncate">
          {session.title}
        </h3>
        {session.topic && (
          <p className="text-xs text-gray-400 -mt-1 truncate">{session.topic}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
          {session.location_name && (
            <span className="flex items-center gap-1">
              <MapPin size={10} className="text-indigo-300" />
              {session.location_name}
            </span>
          )}
          {session.end_time && (
            <span className="flex items-center gap-1">
              <Clock size={10} className="text-indigo-300" />
              {fmtTime(session.start_time)} – {fmtTime(session.end_time)}
            </span>
          )}
        </div>

        {/* Spots bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
            <span className="flex items-center gap-1">
              <Users size={9} />
              {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
            </span>
            <span>{fillPct}% filled</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                fillPct >= 80 ? "bg-red-400" : fillPct >= 50 ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* CTA panel */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 gap-3 border-l border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-medium">per session</p>
          <p className="text-lg font-black text-gray-900">
            NT${(session.price_twd ?? 0).toLocaleString()}
          </p>
        </div>
        {isOpen ? (
          <a
            href={`/session/${session.id}`}
            className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition-colors whitespace-nowrap"
          >
            Book <ChevronRight size={12} />
          </a>
        ) : (
          <div className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 whitespace-nowrap cursor-not-allowed">
            {session.is_full ? "Full" : "Closed"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Coach card ────────────────────────────────────────────────────────────────

function CoachCard({ coach }: { coach: typeof COACHES[0] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-sm"
        style={{ backgroundColor: coach.color }}
      >
        {coach.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-black text-gray-900">{coach.name}</h3>
            <p className="text-xs text-gray-400 font-medium">{coach.title}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Star size={12} fill="currentColor" />
            {coach.rating.toFixed(1)}
            <span className="text-gray-400 font-normal">({coach.reviews})</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{coach.bio}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SessionMarketplace({ sessions }: { sessions: AcademySession[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Build 28-day strip starting today (Taipei time)
  const today = toTaipei(new Date().toISOString());
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const sessionDates = useMemo(() => {
    const s = new Set<string>();
    sessions.forEach((sess) => {
      s.add(isoDate(toTaipei(sess.start_time)));
    });
    return s;
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedDate && isoDate(toTaipei(s.start_time)) !== selectedDate) return false;
      if (experienceFilter !== "all" && s.age_group) {
        if (!s.age_group.toLowerCase().includes(experienceFilter)) return false;
      }
      return true;
    });
  }, [sessions, selectedDate, experienceFilter]);

  const openCount = sessions.filter(
    (s) => s.status === "open" && s.booking_open && !s.is_full
  ).length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F6F7FB", fontFamily: "var(--font-inter), sans-serif" }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 border-b border-gray-200"
        style={{ backgroundColor: "white" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ backgroundColor: "#4F46E5" }}
            >
              <span className="text-white text-sm font-black" style={{ fontFamily: "var(--font-jakarta)" }}>A</span>
            </div>
            <div>
              <p
                className="text-sm font-black text-gray-900 leading-none"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                Artecks Academy
              </p>
              <p className="text-[11px] font-semibold leading-none mt-0.5" style={{ color: "#4F46E5" }}>
                林口 · Chess &amp; Enrichment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <MapPin size={11} className="text-indigo-500" />
              <span className="font-semibold" style={{ color: "#4F46E5" }}>Linkou, New Taipei</span>
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="sm:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600"
            >
              <Filter size={11} />
              Filters
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Intro ── */}
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Chess Sessions in{" "}
            <span style={{ color: "#4F46E5" }}>Linkou</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {openCount > 0
              ? `${openCount} session${openCount !== 1 ? "s" : ""} open for booking · Small groups · Expert coaches`
              : "Check back soon — new sessions are added regularly."}
          </p>
        </div>

        {/* ── Date strip ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Pick a date
          </p>
          <DateStrip
            days={days}
            sessionDates={sessionDates}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        {/* ── Layout: sidebar + list ── */}
        <div className="flex gap-5 items-start">
          {/* Sidebar */}
          <aside
            className={`flex-shrink-0 w-56 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm self-start sticky top-20 ${
              showFilters ? "block" : "hidden sm:block"
            }`}
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Filters
            </p>

            <div className="mb-5">
              <p className="text-xs font-bold text-gray-700 mb-2">Age / Level</p>
              {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExperienceFilter(lvl)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg mb-1 font-semibold transition-colors ${
                    experienceFilter === lvl
                      ? "text-white"
                      : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                  style={
                    experienceFilter === lvl
                      ? { backgroundColor: "#4F46E5" }
                      : {}
                  }
                >
                  {lvl === "all" ? "All levels" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Coaches</p>
              {COACHES.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1.5">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.avatar}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Session list */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {selectedDate && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">
                  {new Date(selectedDate + "T00:00:00+08:00").toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            {filtered.length > 0 ? (
              filtered.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                <div className="text-4xl mb-3">♟</div>
                <p className="font-bold text-gray-700">
                  {selectedDate ? "No sessions on this date" : "No sessions available yet"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedDate
                    ? "Try a different date or clear the filter."
                    : "Check back soon — new sessions are added regularly!"}
                </p>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
                  >
                    Show all sessions
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Coaches section ── */}
        <section className="mt-10">
          <h2
            className="text-lg font-black text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Meet the Coaches
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {COACHES.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </section>

        {/* ── Ecosystem callout ── */}
        <section className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
          <p
            className="text-sm font-black text-violet-700 mb-1"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            🎮 Artecks Ecosystem Rewards
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Link your Artecks account and earn{" "}
            <strong className="text-violet-700">XP</strong> and{" "}
            <strong className="text-violet-700">coins</strong> automatically after every session —
            redeemable in the Artecks store and games.
            <span className="text-gray-400 ml-1">連結帳號，課程後自動獲得獎勵。</span>
          </p>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-8 py-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Artecks · academy.artecks.com</p>
          <a
            href="https://artecks.com/admin/academy/"
            className="text-xs text-gray-300 hover:text-gray-400 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Admin ↗
          </a>
        </footer>
      </div>
    </div>
  );
}
