"use client";
/**
 * Artecks Academy — Calendly-style booking + content page
 * Steps: calendar → time slots → booking form → success + pay
 * Below the picker: coach cards, rewards callout, footer
 */

import { useActionState, useState, useMemo, useEffect, useTransition } from "react";
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Users,
  CheckCircle, AlertCircle, Loader2, Star, Crown,
} from "lucide-react";
import type { AcademySession, PriceVariant, Provider, MembershipCheckResult } from "@/lib/types";
import { bookSession, checkMembership, type BookingState, type ContactMethod } from "./session/[id]/actions";
import MemberBanner from "./components/MemberBanner";
import { createSubscriptionCheckoutAction } from "./session/[id]/actions";
import AuthButton from "./components/AuthButton";

// ── Coaches (static — mirrors admin data) ─────────────────────────────────────

const COACHES = [
  {
    id: "issac",
    name: "Issac Chang",
    nameZH: "張老師",
    title: "Head Coach · Artecks Founder",
    rating: 5.0,
    reviews: 24,
    bio: "Founder of Artecks and lead chess educator. Passionate about making chess accessible and fun for youth in Linkou.",
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
    bio: "Experienced instructor specialising in tactics, strategy, and helping beginners build a solid foundation.",
    avatar: "ML",
    color: "#0EA5E9",
  },
];

// ── Timezone helpers ──────────────────────────────────────────────────────────

const TZ = "Asia/Taipei";

function toTW(iso: string): Date {
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

// ── Calendar ──────────────────────────────────────────────────────────────────

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
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-bold text-gray-900">{monthName} {year}</h2>
        <button onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1 tracking-wide">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPast = key < today;
          const hasSession = sessionDates.has(key);
          const isSelected = key === selectedDate;

          return (
            <div key={key} className="flex justify-center py-0.5">
              <button
                disabled={isPast || !hasSession}
                onClick={() => onSelectDate(key)}
                className={[
                  "relative w-9 h-9 rounded-full text-sm font-semibold transition-all flex items-center justify-center",
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : hasSession && !isPast
                    ? "text-gray-900 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                    : "text-gray-300 cursor-default",
                ].join(" ")}
              >
                {day}
                {hasSession && !isSelected && !isPast && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Time slot list ────────────────────────────────────────────────────────────

function TimeSlots({ sessions, onSelect }: { sessions: AcademySession[]; onSelect: (s: AcademySession) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => {
        const open = s.status === "open" && s.booking_open && !s.is_full;
        const mins = durationMins(s.start_time, s.end_time);
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div
              onClick={() => open && onSelect(s)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold flex items-center justify-between gap-3 transition-all ${
                open
                  ? "border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                  : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              }`}
            >
              <span>{fmtTime(s.start_time)}</span>
              <div className="flex items-center gap-2 text-xs font-normal">
                {mins && <span className="text-gray-400">{mins} min</span>}
                {s.is_full && <span className="font-bold text-red-400">Full</span>}
                {!open && !s.is_full && <span className="text-gray-400">Closed</span>}
              </div>
            </div>
            {open && (
              <button onClick={() => onSelect(s)}
                className="flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-3 transition-colors shadow-sm">
                Select
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Booking form ──────────────────────────────────────────────────────────────

const CONTACT_OPTS: { key: ContactMethod; label: string; emoji: string }[] = [
  { key: "line",     label: "LINE",      emoji: "🟢" },
  { key: "whatsapp", label: "WhatsApp",  emoji: "💬" },
  { key: "sms",      label: "SMS",       emoji: "📱" },
  { key: "email",    label: "Email",     emoji: "✉️" },
];

const EXPERIENCE_OPTS = [
  { key: "beginner",    label: "Complete Beginner" },
  { key: "knows_rules", label: "Knows the Rules"   },
  { key: "experienced", label: "Tournament Exp."   },
];

function BookingForm({
  session,
  onSuccess,
  selectedVariant,
  onMembershipChange,
  providerSlug,
}: {
  session: AcademySession;
  onSuccess: (id: string, appliedDiscount: number, isMember: boolean) => void;
  selectedVariant: PriceVariant | null;
  onMembershipChange: (isMember: boolean) => void;
  providerSlug?: string;
}) {
  const [contactMethod, setContactMethod] = useState<ContactMethod>("line");
  const [experience, setExperience] = useState("beginner");
  const [accountId, setAccountId] = useState("");
  const [memberChecking, setMemberChecking] = useState(false);
  const [, startTransition] = useTransition();

  const initialState: BookingState = { status: "idle" };
  const [state, formAction, isPending] = useActionState(
    async (prev: BookingState, fd: FormData) => {
      const result = await bookSession(prev, fd);
      if (result.status === "success" && result.bookingId) {
        onSuccess(
          result.bookingId,
          result.appliedDiscountAmount ?? 0,
          result.isMember ?? false
        );
      }
      return result;
    },
    initialState,
  );

  // Debounced membership check whenever accountId changes
  useEffect(() => {
    if (!accountId || !accountId.toUpperCase().startsWith("ACT-")) {
      onMembershipChange(false);
      return;
    }
    setMemberChecking(true);
    const timer = setTimeout(() => {
      startTransition(async () => {
        const result = await checkMembership(accountId, providerSlug);
        onMembershipChange(result.is_member);
        setMemberChecking(false);
      });
    }, 600);
    return () => {
      clearTimeout(timer);
      setMemberChecking(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const placeholders: Record<ContactMethod, string> = {
    line: "@your-line-id", whatsapp: "+886 9xx-xxx-xxx",
    sms: "+886 9xx-xxx-xxx", email: "parent@example.com",
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="session_id" value={session.id} />
      <input type="hidden" name="price_variant_label" value={selectedVariant?.label ?? ""} />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parent Name *</span>
          <input name="parent_name" required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone *</span>
          <input name="parent_phone" type="tel" required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Name *</span>
          <input name="student_name" required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age *</span>
          <input name="student_age" type="number" min={4} max={18} required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white" />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chess Level *</span>
        <input type="hidden" name="chess_experience_level" value={experience} />
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE_OPTS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setExperience(key)}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold text-center transition-all ${
                experience === key ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300"
              }`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferred Contact *</span>
        <input type="hidden" name="contact_method" value={contactMethod} />
        <div className="grid grid-cols-4 gap-2">
          {CONTACT_OPTS.map(({ key, label, emoji }) => (
            <button key={key} type="button" onClick={() => setContactMethod(key)}
              className={`rounded-xl border py-2 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all ${
                contactMethod === key ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300"
              }`}>
              <span className="text-sm">{emoji}</span><span>{label}</span>
            </button>
          ))}
        </div>
        <input name="contact_value" required placeholder={placeholders[contactMethod]}
          type={contactMethod === "email" ? "email" : "text"}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white" />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</span>
        <textarea name="special_notes" rows={2} placeholder="Special requirements, questions…"
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-indigo-400 focus:bg-white" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Artecks Account ID{" "}
          <span className="text-violet-500 normal-case font-normal">optional · earn XP</span>
          {memberChecking && <span className="text-indigo-400 normal-case font-normal ml-1">checking…</span>}
        </span>
        <input
          name="artecks_account_id"
          placeholder="ACT-XXXX"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white"
        />
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

// ── Success + Pay ─────────────────────────────────────────────────────────────

function SuccessScreen({
  session,
  bookingId,
  appliedDiscount = 0,
  isMember = false,
}: {
  session: AcademySession;
  bookingId: string;
  appliedDiscount?: number;
  isMember?: boolean;
}) {
  function handlePay() {
    window.location.href = `/api/pay/${bookingId}`;
  }

  const basePrice = session.price_twd ?? 0;
  const finalPrice = Math.max(0, basePrice - appliedDiscount);
  const hasDiscount = appliedDiscount > 0;

  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle size={36} className="text-emerald-500" />
      </div>
      <div>
        <h3 className="text-lg font-black text-gray-900">You&rsquo;re booked!</h3>
        <p className="text-sm text-gray-500 mt-1">{fmtDateLong(session.start_time)} · {fmtTime(session.start_time)}</p>
        <p className="text-xs text-gray-400 mt-1">Booking #{bookingId}</p>
      </div>
      {isMember && (
        <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 flex items-center gap-2">
          <Crown size={13} className="text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Member discount applied — NT${appliedDiscount.toLocaleString()} off</p>
        </div>
      )}
      <div className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-5 py-4 text-left">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Complete Your Payment</p>
        <div className="flex items-baseline gap-2 mb-1">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">NT${basePrice.toLocaleString()}</span>
          )}
          <span className="text-sm font-bold text-gray-700">NT${finalPrice.toLocaleString()}</span>
          <span className="text-xs text-gray-500">· {session.title}</span>
        </div>
        <p className="text-xs text-gray-400">Pay securely via Stripe — credit or debit card accepted.</p>
      </div>
      <button onClick={handlePay}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all">
        Pay Now →
      </button>
      <a href={`/report/${bookingId}`} className="text-xs text-indigo-500 hover:underline">View booking details</a>
    </div>
  );
}

// ── Info panel (left) ─────────────────────────────────────────────────────────

function InfoPanel({
  session, sessions, step, selectedVariant, onVariantChange, isMember,
}: {
  session: AcademySession | null;
  sessions: AcademySession[];
  step: string;
  selectedVariant: PriceVariant | null;
  onVariantChange: (v: PriceVariant) => void;
  isMember: boolean;
}) {
  const mins = session ? durationMins(session.start_time, session.end_time) : 60;
  const variants = session?.price_variants ?? [];
  const hasVariants = variants.length > 0;

  // Price display: use selected variant when on form step, else fall back to price_twd / min
  const displayPrice: number | null = (() => {
    if (step === "form" && hasVariants && selectedVariant) {
      return isMember ? selectedVariant.member_price : selectedVariant.price;
    }
    if (hasVariants) return Math.min(...variants.map(v => isMember ? v.member_price : v.price));
    return session?.price_twd ?? (sessions.length ? Math.min(...sessions.map(s => Number(s.price_twd ?? 0))) : null);
  })();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-white text-xl font-black">♟</span>
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Artecks Academy</p>
          <p className="text-lg font-black text-gray-900 leading-tight">Chess Lessons</p>
        </div>
      </div>
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

      {/* ── Pricing variants (Shopee-style chips) ── */}
      {hasVariants && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Session Type</p>
          <div className="flex flex-col gap-1.5">
            {variants.map((v) => {
              const active = step === "form" && selectedVariant?.label === v.label;
              const showPrice = isMember ? v.member_price : v.price;
              return (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => onVariantChange(v)}
                  className={`rounded-xl border px-3 py-2 text-left transition-all ${
                    active
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                  } ${step !== "form" ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{v.label}</span>
                    <div className="flex items-center gap-1.5">
                      {isMember && v.member_price < v.price && (
                        <span className={`text-[10px] line-through ${active ? "text-indigo-300" : "text-gray-400"}`}>
                          NT${v.price.toLocaleString()}
                        </span>
                      )}
                      <span className={`text-xs font-semibold ${active ? "text-indigo-200" : "text-indigo-600"}`}>
                        NT${showPrice.toLocaleString()}/pp
                      </span>
                    </div>
                  </div>
                  {!isMember && v.member_price < v.price && (
                    <p className={`text-[10px] mt-0.5 ${active ? "text-indigo-200" : "text-gray-400"}`}>
                      Members: NT${v.member_price.toLocaleString()}/pp
                    </p>
                  )}
                  {isMember && (
                    <p className={`text-[10px] mt-0.5 font-semibold ${active ? "text-emerald-200" : "text-emerald-600"}`}>
                      ✓ Member rate applied
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Member badge ── */}
      {isMember && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
          <p className="text-xs font-bold text-emerald-700">✓ Artecks Member</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Member pricing applied to all tiers.</p>
        </div>
      )}

      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3">
        <p className="text-xs text-indigo-400 font-semibold">
          {step === "form" && hasVariants && selectedVariant
            ? `Per student · ${selectedVariant.label}${isMember ? " · Member rate" : ""}`
            : (hasVariants ? "Starting from" : (session ? "Per session" : "Starting from"))}
        </p>
        {displayPrice != null
          ? <p className="text-2xl font-black text-indigo-700">NT${displayPrice.toLocaleString()} <span className="text-sm font-normal text-indigo-400">TWD</span></p>
          : <p className="text-sm text-indigo-400 font-medium">Pricing TBD</p>
        }
      </div>
      {session?.coach && (
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
               style={{ backgroundColor: "#4F46E5" }}>
            {session.coach.avatar_initials || session.coach.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{session.coach.name}</p>
            <p className="text-xs text-gray-400">{session.coach.title}</p>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3">
        <p className="text-xs font-bold text-violet-700 mb-1">🎮 Artecks Rewards</p>
        <p className="text-xs text-violet-600">Add your account ID to earn XP &amp; coins after each session.</p>
      </div>
      <a
        href="https://artecks.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-all"
      >
        🛍 Visit Artecks Store
        <span className="text-gray-400 text-xs">→</span>
      </a>
    </div>
  );
}

// ── Coach card ────────────────────────────────────────────────────────────────

function CoachCard({ coach }: { coach: typeof COACHES[0] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-sm"
           style={{ backgroundColor: coach.color }}>
        {coach.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-black text-gray-900">{coach.name}
              <span className="text-xs font-normal text-gray-400 ml-2">{coach.nameZH}</span>
            </h3>
            <p className="text-xs text-gray-400 font-medium">{coach.title}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Star size={11} fill="currentColor" />
            {coach.rating.toFixed(1)}
            <span className="text-gray-400 font-normal">({coach.reviews})</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{coach.bio}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Step = "calendar" | "slots" | "form" | "success";

export default function SessionMarketplace({ sessions, provider: initialProvider }: { sessions: AcademySession[]; provider: Provider | null }) {
  const twToday = toTW(new Date().toISOString());
  twToday.setHours(0, 0, 0, 0);
  const todayStr = ymd(twToday);

  const [calYear, setCalYear] = useState(twToday.getFullYear());
  const [calMonth, setCalMonth] = useState(twToday.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<AcademySession | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PriceVariant | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [step, setStep] = useState<Step>("calendar");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [bookingIsMember, setBookingIsMember] = useState(false);
  const [providerWithPlans, setProviderWithPlans] = useState<Provider | null>(initialProvider);
  const [membershipResult, setMembershipResult] = useState<MembershipCheckResult | null>(null);

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

  function handleDateSelect(date: string) { setSelectedDate(date); setStep("slots"); }
  function handleSlotSelect(s: AcademySession) {
    setSelectedSession(s);
    setSelectedVariant(s.price_variants?.[0] ?? null);
    setStep("form");
  }
  function handleSuccess(id: string, discount: number, memberUsed: boolean) { setBookingId(id); setAppliedDiscount(discount); setBookingIsMember(memberUsed); setStep("success"); }

  function goBack() {
    if (step === "form")    { setStep("slots"); setSelectedSession(null); setIsMember(false); }
    else if (step === "slots") { setStep("calendar"); setSelectedDate(null); }
    else if (step === "success") { setStep("calendar"); setSelectedDate(null); setSelectedSession(null); setAppliedDiscount(0); setBookingIsMember(false); }
  }

  const slotsForDate = selectedDate ? (sessionsByDate.get(selectedDate) ?? []) : [];
  const hasAnySessions = sessions.length > 0;

  const stepTitle = {
    calendar: "Select a Date",
    slots: selectedDate
      ? new Date(selectedDate + "T12:00:00+08:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : "Select a Time",
    form: "Your Details",
    success: "Booking Confirmed",
  }[step];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Home
            </a>
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
              <div>
                <p className="text-sm font-black text-gray-900 leading-none">Artecks Academy</p>
                <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#4F46E5" }}>林口 · Chess &amp; Enrichment</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <MapPin size={11} className="text-indigo-500" />
              <span className="font-semibold text-indigo-600">Linkou, New Taipei</span>
            </div>
            <AuthButton />
            <a href="/bookings/mine" className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
              My Bookings
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">

        {/* ── Hero intro ── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            Chess Lessons in <span style={{ color: "#4F46E5" }}>Linkou</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {hasAnySessions
              ? `${sessions.filter(s => s.status === "open" && s.booking_open && !s.is_full).length} sessions open · Small groups · Expert coaches`
              : "New sessions launching soon — add your email to be notified!"}
          </p>
        </div>

        {/* ── Membership banner ── */}
        {providerWithPlans && providerWithPlans.plans.length > 0 && (
          <MemberBanner
            provider={providerWithPlans}
            membershipResult={membershipResult}
            onSubscribeClick={async (planId) => {
              const origin = window.location.origin;
              const result = await createSubscriptionCheckoutAction({
                plan_id: planId,
                success_url: `${origin}/payment/result?subscription=true`,
                cancel_url: `${origin}/`,
              });
              if (result?.checkout_url) {
                window.location.href = result.checkout_url;
              }
            }}
          />
        )}

        {/* ── Calendly-style booking card ── */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row">

            {/* Left info panel */}
            <aside className="sm:w-64 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 p-6">
              <InfoPanel
                session={selectedSession}
                sessions={sessions}
                step={step}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
                isMember={isMember}
              />
            </aside>

            {/* Right step panel */}
            <main className="flex-1 p-6 sm:p-8">
              {/* Step header */}
              <div className="flex items-center gap-3 mb-6">
                {(step === "slots" || step === "form") && (
                  <button onClick={goBack}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h2 className="text-xl font-black text-gray-900">{stepTitle}</h2>
              </div>

              {/* Calendar */}
              {step === "calendar" && (
                <>
                  <Calendar
                    year={calYear} month={calMonth}
                    sessionDates={sessionDates}
                    selectedDate={selectedDate}
                    today={todayStr}
                    onSelectDate={handleDateSelect}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                  />
                  {!hasAnySessions && (
                    <div className="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 px-5 py-4 text-center">
                      <p className="text-sm font-bold text-indigo-700">♟ Sessions launching soon</p>
                      <p className="text-xs text-indigo-500 mt-1">
                        Highlighted dates will appear here once sessions are scheduled.
                        Contact us on LINE to get notified first!
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 text-center mt-4">Asia/Taipei timezone</p>
                </>
              )}

              {/* Slots */}
              {step === "slots" && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    {slotsForDate.filter(s => s.status === "open" && s.booking_open && !s.is_full).length} slot{slotsForDate.length !== 1 ? "s" : ""} available
                  </p>
                  {slotsForDate.length > 0
                    ? <TimeSlots sessions={slotsForDate} onSelect={handleSlotSelect} />
                    : <p className="text-sm text-gray-400 py-8 text-center">No sessions on this date.</p>
                  }
                </div>
              )}

              {/* Form */}
              {step === "form" && selectedSession && (
                <BookingForm
                  session={selectedSession}
                  onSuccess={handleSuccess}
                  selectedVariant={selectedVariant}
                  onMembershipChange={setIsMember}
                  providerSlug={selectedSession.provider?.slug ?? undefined}
                />
              )}

              {/* Success */}
              {step === "success" && selectedSession && bookingId && (
                <SuccessScreen
                  session={selectedSession}
                  bookingId={bookingId}
                  appliedDiscount={appliedDiscount}
                  isMember={bookingIsMember}
                />
              )}
            </main>
          </div>
        </div>

        {/* ── Artecks login nudge ── */}
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <span className="text-lg mt-0.5">🎮</span>
          <div>
            <p className="text-xs font-bold text-indigo-800">Booking is open to everyone — no login required.</p>
            <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
              Have an Artecks account? Add your account ID when you book and earn <strong>XP &amp; coins</strong> automatically after each session.
            </p>
          </div>
        </div>

        {/* ── Coaches ── */}
        <section>
          <h2 className="text-lg font-black text-gray-900 mb-4">Meet the Coaches</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {COACHES.map((coach) => <CoachCard key={coach.id} coach={coach} />)}
          </div>
        </section>

        {/* ── Ecosystem callout ── */}
        <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
          <p className="text-sm font-black text-violet-700 mb-1">🎮 Artecks Ecosystem Rewards</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Link your Artecks account and earn <strong className="text-violet-700">XP</strong> and{" "}
            <strong className="text-violet-700">coins</strong> automatically after every session —
            redeemable in the Artecks store and games.{" "}
            <span className="text-gray-400">連結帳號，課程後自動獲得獎勵。</span>
          </p>
        </section>

        {/* ── Footer ── */}
        <footer className="py-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Artecks · academy.artecks.com</p>
          <a href="https://artecks.com/admin/academy/" target="_blank" rel="noopener noreferrer"
             className="text-xs text-gray-300 hover:text-gray-400 transition-colors">Admin ↗</a>
        </footer>
      </div>
    </div>
  );
}
