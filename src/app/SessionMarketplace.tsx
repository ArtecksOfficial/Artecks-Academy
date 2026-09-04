"use client";
/**
 * Artecks Academy — Calendly-style booking experience
 * Layout: info panel (left) + step panel (right)
 * Steps: calendar → time slots → booking form → success + pay
 */

import { useActionState, useState, useMemo, useTransition } from "react";
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Users,
  CheckCircle, AlertCircle, Loader2, X,
} from "lucide-react";
import type { AcademySession } from "@/lib/types";
import { bookSession, type BookingState, type ContactMethod } from "./session/[id]/actions";

// ── Timezone helpers ───────────────────────────────────────────────────────────

const TZ = "Asia/Taipei";

function toTW(iso: string): Date {
  // Construct a Date representing the wall-clock time in Taipei
  const d = new Date(iso);
  return new Date(d.toLocaleString("en-US", { timeZone: TZ }));
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function fmtDateLong(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ, weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function durationMins(start: string, end: string | null): number | null {
  if (!end) return null;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

// ── Calendar ───────────────────────────────────────────────────────────────────

function Calendar({
  year, month, sessionDates, selectedDate, today,
  onSelectDate, onPrevMonth, onNextMonth,
}: {
  year: number; month: number;
  sessionDates: Set<string>;
  selectedDate: string | null;
  today: string;
  onSelectDate: (d: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" });
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-bold text-gray-900">
          {monthName} {year}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1 tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPast = key < today;
          const hasSession = sessionDates.has(key);
          const isSelected = key === selectedDate;
          const isToday = key === today;

          return (
            <div key={key} className="flex justify-center py-0.5">
              <button
                disabled={isPast || !hasSession}
                onClick={() => onSelectDate(key)}
                className={[
                  "relative w-9 h-9 rounded-full text-sm font-semibold transition-all flex items-center justify-center",
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : isToday && hasSession
                    ? "border-2 border-indigo-500 text-indigo-700 hover:bg-indigo-50"
                    : hasSession && !isPast
                    ? "text-gray-900 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                    : "text-gray-300 cursor-default",
                ].join(" ")}
              >
                {day}
                {hasSession && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">Asia/Taipei timezone</p>
    </div>
  );
}

// ── Time slot list ─────────────────────────────────────────────────────────────

function TimeSlots({
  sessions,
  onSelect,
}: {
  sessions: AcademySession[];
  onSelect: (s: AcademySession) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => {
        const open = s.status === "open" && s.booking_open && !s.is_full;
        const mins = durationMins(s.start_time, s.end_time);
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all flex items-center justify-between gap-3 ${
                open
                  ? "border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 cursor-pointer"
                  : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              }`}
              onClick={() => open && onSelect(s)}
            >
              <span>{fmtTime(s.start_time)}</span>
              {mins && <span className="text-xs font-normal text-gray-400">{mins} min</span>}
              {s.is_full && <span className="text-xs font-bold text-red-400">Full</span>}
              {!s.is_full && !open && <span className="text-xs text-gray-400">Closed</span>}
            </div>
            {open && (
              <button
                onClick={() => onSelect(s)}
                className="flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-3 transition-colors shadow-sm shadow-indigo-200"
              >
                Select
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Booking form ───────────────────────────────────────────────────────────────

const CONTACT_OPTS: { key: ContactMethod; label: string; emoji: string }[] = [
  { key: "line", label: "LINE", emoji: "🟢" },
  { key: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { key: "sms", label: "SMS", emoji: "📱" },
  { key: "email", label: "Email", emoji: "✉️" },
];

const EXPERIENCE_OPTS = [
  { key: "beginner",    label: "Complete Beginner" },
  { key: "knows_rules", label: "Knows the Rules" },
  { key: "experienced", label: "Tournament Experience" },
];

function BookingForm({
  session,
  onSuccess,
}: {
  session: AcademySession;
  onSuccess: (bookingId: string) => void;
}) {
  const [contactMethod, setContactMethod] = useState<ContactMethod>("line");
  const [experience, setExperience] = useState("beginner");

  const initialState: BookingState = { status: "idle" };
  const [state, formAction, isPending] = useActionState(
    async (prev: BookingState, fd: FormData) => {
      const result = await bookSession(prev, fd);
      if (result.status === "success" && result.bookingId) {
        onSuccess(result.bookingId);
      }
      return result;
    },
    initialState,
  );

  const placeholders: Record<ContactMethod, string> = {
    line: "@your-line-id",
    whatsapp: "+886 9xx-xxx-xxx",
    sms: "+886 9xx-xxx-xxx",
    email: "parent@example.com",
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="session_id" value={session.id} />

      {/* Parent info */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parent Name *</span>
          <input name="parent_name" required
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone *</span>
          <input name="parent_phone" type="tel" required
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
        </label>
      </div>

      {/* Student info */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Name *</span>
          <input name="student_name" required
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age *</span>
          <input name="student_age" type="number" min={4} max={18} required
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
        </label>
      </div>

      {/* Chess experience */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chess Level *</span>
        <input type="hidden" name="chess_experience_level" value={experience} />
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE_OPTS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setExperience(key)}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold text-center transition-all ${
                experience === key
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact method */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferred Contact *</span>
        <input type="hidden" name="contact_method" value={contactMethod} />
        <div className="grid grid-cols-4 gap-2">
          {CONTACT_OPTS.map(({ key, label, emoji }) => (
            <button key={key} type="button" onClick={() => setContactMethod(key)}
              className={`rounded-xl border py-2 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all ${
                contactMethod === key
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300"
              }`}>
              <span className="text-sm">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <input name="contact_value" required placeholder={placeholders[contactMethod]}
          type={contactMethod === "email" ? "email" : "text"}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
      </div>

      {/* Notes + Artecks ID */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</span>
        <textarea name="special_notes" rows={2} placeholder="Special requirements, questions…"
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Artecks Account ID <span className="text-violet-500 normal-case font-normal">optional · earn XP</span>
        </span>
        <input name="artecks_account_id" placeholder="ACT-XXXX"
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
      </label>

      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{state.message}</p>
        </div>
      )}

      <button type="submit" disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-[0.98] transition-all">
        {isPending ? <><Loader2 size={16} className="animate-spin" /> Booking…</> : "Confirm Booking"}
      </button>
    </form>
  );
}

// ── Success + Payment screen ───────────────────────────────────────────────────

function SuccessScreen({
  session, bookingId,
}: {
  session: AcademySession;
  bookingId: string;
}) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/pay/${bookingId}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Payment gateway unavailable. Please contact us.");
        setPaying(false);
        return;
      }
      // The route returns the ECPay auto-submit HTML page directly
      const html = await res.text();
      document.open();
      document.write(html);
      document.close();
    } catch {
      setError("Something went wrong. Please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle size={36} className="text-emerald-500" />
      </div>
      <div>
        <h3 className="text-lg font-black text-gray-900">You&rsquo;re booked!</h3>
        <p className="text-sm text-gray-500 mt-1">
          {fmtDateLong(session.start_time)} · {fmtTime(session.start_time)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Booking #{bookingId}</p>
      </div>

      <div className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-5 py-4 text-left">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Complete Your Payment</p>
        <p className="text-sm text-gray-700 mb-1">
          <span className="font-bold">NT${(session.price_twd ?? 0).toLocaleString()}</span> · {session.title}
        </p>
        <p className="text-xs text-gray-400">Pay securely via ECPay — credit card, ATM transfer, or convenience store.</p>
      </div>

      {error && (
        <div className="w-full flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-[0.98] transition-all"
      >
        {paying ? <><Loader2 size={16} className="animate-spin" /> Redirecting to payment…</> : "Pay Now →"}
      </button>

      <a href={`/report/${bookingId}`} className="text-xs text-indigo-500 hover:underline">
        View booking details
      </a>
    </div>
  );
}

// ── Info panel ─────────────────────────────────────────────────────────────────

function InfoPanel({ session }: { session: AcademySession | null }) {
  const mins = session ? durationMins(session.start_time, session.end_time) : 60;

  return (
    <div className="flex flex-col gap-5">
      {/* Logo + brand */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
          <span className="text-white text-xl font-black">♟</span>
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Artecks Academy</p>
          <p className="text-lg font-black text-gray-900 leading-tight">Chess Lessons</p>
        </div>
      </div>

      {/* Session meta */}
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Clock size={15} className="mt-0.5 text-indigo-400 flex-shrink-0" />
          <span>{mins ? `${mins} minutes` : "Duration TBD"}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={15} className="mt-0.5 text-indigo-400 flex-shrink-0" />
          <span>{session?.location_name ?? "Linkou, New Taipei"}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Users size={15} className="mt-0.5 text-indigo-400 flex-shrink-0" />
          <span>Small group · max {session?.max_seats ?? 10} students</span>
        </div>
      </div>

      {/* Price */}
      {session && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3">
          <p className="text-xs text-indigo-400 font-semibold">Per session</p>
          <p className="text-2xl font-black text-indigo-700">NT${(session.price_twd ?? 0).toLocaleString()}</p>
        </div>
      )}

      {/* Coach */}
      {session?.coach && (
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
            style={{ backgroundColor: "#4F46E5" }}
          >
            {session.coach.avatar_initials || session.coach.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{session.coach.name}</p>
            <p className="text-xs text-gray-400">{session.coach.title}</p>
          </div>
        </div>
      )}

      {/* Perks */}
      <div className="rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3 mt-auto">
        <p className="text-xs font-bold text-violet-700 mb-1">🎮 Artecks Rewards</p>
        <p className="text-xs text-violet-600">Add your account ID to earn XP &amp; coins after each session.</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

type Step = "calendar" | "slots" | "form" | "success";

export default function SessionMarketplace({ sessions }: { sessions: AcademySession[] }) {
  const twToday = toTW(new Date().toISOString());
  twToday.setHours(0, 0, 0, 0);
  const todayStr = ymd(twToday);

  const [calYear, setCalYear] = useState(twToday.getFullYear());
  const [calMonth, setCalMonth] = useState(twToday.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<AcademySession | null>(null);
  const [step, setStep] = useState<Step>("calendar");
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Index sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, AcademySession[]>();
    sessions.forEach((s) => {
      const key = ymd(toTW(s.start_time));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [sessions]);

  const sessionDates = useMemo(() => new Set(sessionsByDate.keys()), [sessionsByDate]);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setStep("slots");
  }

  function handleSlotSelect(session: AcademySession) {
    setSelectedSession(session);
    setStep("form");
  }

  function handleSuccess(id: string) {
    setBookingId(id);
    setStep("success");
  }

  function goBack() {
    if (step === "success") { setStep("calendar"); setSelectedDate(null); setSelectedSession(null); }
    else if (step === "form") { setStep("slots"); setSelectedSession(null); }
    else if (step === "slots") { setStep("calendar"); setSelectedDate(null); }
  }

  const slotsForDate = selectedDate ? (sessionsByDate.get(selectedDate) ?? []) : [];

  const stepTitle = {
    calendar: "Select a Date",
    slots: selectedDate
      ? new Date(selectedDate + "T12:00:00+08:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : "Select a Time",
    form: "Enter Details",
    success: "Booking Confirmed",
  }[step];

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* Mobile-only top bar */}
      <header className="sm:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-sm font-black">♟</span>
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 leading-none">Artecks Academy</p>
          <p className="text-[11px] text-indigo-500 font-semibold">Chess Lessons · Linkou</p>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex-1 flex flex-col sm:flex-row max-w-4xl mx-auto w-full sm:min-h-screen">

        {/* ── Left info panel ── */}
        <aside className="hidden sm:flex flex-col w-72 flex-shrink-0 border-r border-gray-200 p-8">
          <InfoPanel session={selectedSession} />
        </aside>

        {/* ── Right step panel ── */}
        <main className="flex-1 flex flex-col p-6 sm:p-10">

          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            {step !== "calendar" && step !== "success" && (
              <button
                onClick={goBack}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h1 className="text-xl font-black text-gray-900">{stepTitle}</h1>
          </div>

          {/* Step content */}
          {step === "calendar" && (
            <Calendar
              year={calYear}
              month={calMonth}
              sessionDates={sessionDates}
              selectedDate={selectedDate}
              today={todayStr}
              onSelectDate={handleDateSelect}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
            />
          )}

          {step === "slots" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500 mb-3">
                {slotsForDate.filter(s => s.status === "open" && s.booking_open && !s.is_full).length} time{" "}
                {slotsForDate.length === 1 ? "slot" : "slots"} available
              </p>
              {slotsForDate.length > 0 ? (
                <TimeSlots sessions={slotsForDate} onSelect={handleSlotSelect} />
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">No sessions on this date.</p>
              )}
            </div>
          )}

          {step === "form" && selectedSession && (
            <BookingForm session={selectedSession} onSuccess={handleSuccess} />
          )}

          {step === "success" && selectedSession && bookingId && (
            <SuccessScreen session={selectedSession} bookingId={bookingId} />
          )}

        </main>
      </div>
    </div>
  );
}
