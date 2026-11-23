"use client";
import L, { LDate } from "@/app/components/L";
import { useLanguage } from "@/lib/i18n/LanguageContext";
/**
 * Artecks Academy — Calendly-style booking + content page
 * Steps: calendar → time slots → booking form → success + pay
 * Below the picker: coach cards, rewards callout, footer
 */

import SiteHeader from "@/app/components/SiteHeader";
import { useActionState, useState, useMemo, useEffect, useTransition } from "react";
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Users,
  CheckCircle, AlertCircle, Loader2, Star, Crown,
} from "lucide-react";
import type { AcademySession, PriceVariant, Provider, MembershipCheckResult } from "@/lib/types";
import { bookSession, checkMembership, type BookingState, type ContactMethod } from "@/lib/academy-client";
import MemberBanner from "./components/MemberBanner";
import { createSubscriptionCheckoutAction } from "@/lib/academy-client";
import { publicOrigin, routes, webUrl } from "@/lib/platform";
import AuthButton from "./components/AuthButton";

// ── Coaches (static — mirrors admin data) ─────────────────────────────────────

const COACHES = [
  {
    id: "issac",
    name: "Issac Chang",
    nameZH: "張老師",
    title: "Head Coach · Artecks Founder",
    titleZH: "總教練 · Artecks 創辦人",
    rating: 5.0,
    reviews: 24,
    bio: "Founder of Artecks and lead chess educator. Passionate about making chess accessible and fun for youth in Linkou.",
    bioZH: "Artecks 創辦人暨首席西洋棋教練，致力讓林口的孩子輕鬆愛上西洋棋。",
    avatar: "IC",
    color: "#1C3157",
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
  const zh = useLanguage().locale === "zh";
  const monthTitle = zh ? `${year} 年 ${month + 1} 月` : `${new Date(year, month, 1).toLocaleString("en-US", { month: "long" })} ${year}`;
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
        <h2 className="text-base font-bold text-gray-900">{monthTitle}</h2>
        <button onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {(zh ? ["日","一","二","三","四","五","六"] : ["SUN","MON","TUE","WED","THU","FRI","SAT"]).map((d) => (
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
                    ? "bg-[#13223F] text-white shadow-md shadow-[#13223F]/10"
                    : hasSession && !isPast
                    ? "text-gray-900 hover:bg-[#FBF5E8] hover:text-[#8A6A2C] cursor-pointer"
                    : "text-gray-300 cursor-default",
                ].join(" ")}
              >
                {day}
                {hasSession && !isSelected && !isPast && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#13223F]" />
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
                  ? "border-[#E7C98A] text-[#A07C34] bg-[#FBF5E8] hover:bg-[#FBF5E8] cursor-pointer"
                  : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              }`}
            >
              <span><LDate iso={s.start_time} opts={{ hour: "numeric", minute: "2-digit" }} /></span>
              <div className="flex items-center gap-2 text-xs font-normal">
                {mins && <span className="text-gray-400">{mins} min</span>}
                {s.is_full && <span className="font-bold text-red-400"><L en="Full" zh="已額滿" /></span>}
                {!open && !s.is_full && <span className="text-gray-400"><L en="Closed" zh="未開放" /></span>}
              </div>
            </div>
            {open && (
              <button onClick={() => onSelect(s)}
                className="flex-shrink-0 rounded-xl bg-[#13223F] hover:bg-[#1C3157] text-white text-sm font-bold px-5 py-3 transition-colors shadow-sm">
                <L en="Select" zh="選擇" />
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
  { key: "email",    label: "Email",     emoji: "✉️" },  // zh label set in the form
];

const EXPERIENCE_OPTS = [
  { key: "beginner",    label: "Complete Beginner", zh: "完全新手" },
  { key: "knows_rules", label: "Knows the Rules",   zh: "會基本規則" },
  { key: "experienced", label: "Tournament Exp.",   zh: "有比賽經驗" },
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
  const zh = useLanguage().locale === "zh";
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
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide"><L en="Parent Name *" zh="家長姓名 *" /></span>
          <input name="parent_name" required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A] focus:bg-white" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide"><L en="Phone *" zh="電話 *" /></span>
          <input name="parent_phone" type="tel" required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A] focus:bg-white" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide"><L en="Student Name *" zh="學生姓名 *" /></span>
          <input name="student_name" required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A] focus:bg-white" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide"><L en="Age *" zh="年齡 *" /></span>
          <input name="student_age" type="number" min={4} max={18} required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A] focus:bg-white" />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide"><L en="Chess Level *" zh="棋力程度 *" /></span>
        <input type="hidden" name="chess_experience_level" value={experience} />
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE_OPTS.map(({ key, label, zh: zhLabel }) => (
            <button key={key} type="button" onClick={() => setExperience(key)}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold text-center transition-all ${
                experience === key ? "bg-[#13223F] border-[#13223F] text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#C49A4A]"
              }`}>{zh ? zhLabel : label}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide"><L en="Preferred Contact *" zh="偏好聯絡方式 *" /></span>
        <input type="hidden" name="contact_method" value={contactMethod} />
        <div className="grid grid-cols-4 gap-2">
          {CONTACT_OPTS.map(({ key, label, emoji }) => (
            <button key={key} type="button" onClick={() => setContactMethod(key)}
              className={`rounded-xl border py-2 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all ${
                contactMethod === key ? "bg-[#13223F] border-[#13223F] text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#C49A4A]"
              }`}>
              <span className="text-sm">{emoji}</span><span>{zh && key === "email" ? "電子郵件" : zh && key === "sms" ? "簡訊" : label}</span>
            </button>
          ))}
        </div>
        <input name="contact_value" required placeholder={placeholders[contactMethod]}
          type={contactMethod === "email" ? "email" : "text"}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A] focus:bg-white" />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide"><L en="Notes" zh="備註" /></span>
        <textarea name="special_notes" rows={2} placeholder={zh ? "特殊需求或問題…" : "Special requirements, questions…"}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#C49A4A] focus:bg-white" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {zh ? "Artecks 帳號 ID" : "Artecks Account ID"}{" "}
          <span className="text-[#A07C34] normal-case font-normal">{zh ? "選填 · 可賺 XP" : "optional · earn XP"}</span>
          {memberChecking && <span className="text-[#E7C98A] normal-case font-normal ml-1">{zh ? "確認中…" : "checking…"}</span>}
        </span>
        <input
          name="artecks_account_id"
          placeholder="ACT-XXXX"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A] focus:bg-white"
        />
      </label>

      <label className="flex items-start gap-2.5 rounded-xl bg-[#FBF5E8] border border-[#E7C98A] px-3 py-3 text-xs text-gray-700 leading-relaxed cursor-pointer">
              <input type="checkbox" name="account_consent" required className="mt-0.5 accent-[#13223F] w-4 h-4 flex-shrink-0" />
              <span>{zh ? "報名的同時，我同意為孩子建立 Artecks 西洋棋帳號，讓教練可以指派作業、孩子可以線上練習。" : "I agree to an Artecks Chess account for my child, so the coach can set homework and my child can practise online."}</span>
            </label>

      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{state.message}</p>
        </div>
      )}

      <button type="submit" disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#13223F] hover:bg-[#1C3157] py-4 text-sm font-bold text-white shadow-lg shadow-[#13223F]/10 disabled:opacity-50 active:scale-[0.98] transition-all">
        {isPending ? <><Loader2 size={16} className="animate-spin" /> {zh ? "預約中…" : "Booking…"}</> : (zh ? "確認預約" : "Confirm Booking")}
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
    window.location.href = webUrl(`/api/pay/${bookingId}`);
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
        <h3 className="text-lg font-black text-gray-900"><L en="You’re booked!" zh="預約成功！" /></h3>
        <p className="text-sm text-gray-500 mt-1"><LDate iso={session.start_time} opts={{ weekday: "long", month: "long", day: "numeric", year: "numeric" }} /> · <LDate iso={session.start_time} opts={{ hour: "numeric", minute: "2-digit" }} /></p>
        <p className="text-xs text-gray-400 mt-1"><L en="Booking" zh="預約編號" /> #{bookingId}</p>
      </div>
      {isMember && (
        <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 flex items-center gap-2">
          <Crown size={13} className="text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-emerald-700"><L en={`Member discount applied — NT$${appliedDiscount.toLocaleString()} off`} zh={`已套用會員折扣，折抵 NT$${appliedDiscount.toLocaleString()}`} /></p>
        </div>
      )}
      <div className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-5 py-4 text-left">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"><L en="Complete Your Payment" zh="完成付款" /></p>
        <div className="flex items-baseline gap-2 mb-1">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">NT${basePrice.toLocaleString()}</span>
          )}
          <span className="text-sm font-bold text-gray-700">NT${finalPrice.toLocaleString()}</span>
          <span className="text-xs text-gray-500">· {session.title}</span>
        </div>
        <p className="text-xs text-gray-400"><L en="Pay securely via Stripe — credit or debit card accepted." zh="透過 Stripe 安全付款，接受信用卡與金融卡。" /></p>
      </div>
      {/* ── Primary: Stripe ─────────────────────────────────────────── */}
      <button onClick={handlePay}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#13223F] hover:bg-[#1C3157] py-4 text-sm font-bold text-white shadow-lg shadow-[#13223F]/10 active:scale-[0.98] transition-all">
        <L en="Pay Now (Card / PayPal)" zh="立即付款（信用卡／PayPal）" />
      </button>

      {/* ── Alternative: LINE Pay (hidden until NEXT_PUBLIC_LINEPAY_ENABLED=true) ── */}
      {process.env.NEXT_PUBLIC_LINEPAY_ENABLED === "true" && (
      <a
        href={`/api/pay/linepay/${bookingId}`}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-sm active:scale-[0.98] transition-all"
        style={{ backgroundColor: "#06C755" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.952 11.034C19.952 6.583 15.49 2.953 10 2.953S.048 6.583.048 11.034c0 4.02 3.566 7.389 8.382 8.028.326.07.771.215.883.494.102.254.067.652.033.909l-.143.857c-.044.254-.202 1.002.878.546 1.08-.455 5.826-3.432 7.949-5.878 1.465-1.607 2.922-3.636 2.922-5.956z"/>
        </svg>
        LINE Pay
      </a>
      )}
      {/* ── Alternative: ECPay 台灣在地支付 ─────────────────────────── */}
      <a
        href={`/api/pay/ecpay/${bookingId}`}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-sm active:scale-[0.98] transition-all"
        style={{ backgroundColor: "#0066CC" }}
      >
        <L en="Pay in Taiwan (card / ATM / mobile wallet)" zh="台灣在地支付（信用卡／ATM／行動支付）" />
      </a>

      <a href={routes.report(bookingId)} className="text-xs text-[#A07C34] hover:underline"><L en="View booking details" zh="查看預約詳情" /></a>
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
        <div className="w-12 h-12 rounded-2xl bg-[#13223F] flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-white text-xl font-black">♟</span>
        </div>
        <div>
          <p className="text-xs font-bold text-[#A07C34] uppercase tracking-wider"><L en="Artecks Academy" zh="Artecks 學院" /></p>
          <p className="text-lg font-black text-gray-900 leading-tight"><L en="Chess Lessons" zh="西洋棋課程" /></p>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Clock size={15} className="mt-0.5 text-[#E7C98A] flex-shrink-0" />
          <span>{mins ? <L en={`${mins} minutes`} zh={`${mins} 分鐘`} /> : <L en="Duration TBD" zh="時長待定" />}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={15} className="mt-0.5 text-[#E7C98A] flex-shrink-0" />
          <span>{session?.location_name ?? <L en="Linkou, New Taipei" zh="新北市林口區" />}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Users size={15} className="mt-0.5 text-[#E7C98A] flex-shrink-0" />
          <span><L en={`Small group · max ${session?.max_seats ?? 10} students`} zh={`小班 · 最多 ${session?.max_seats ?? 10} 位學生`} /></span>
        </div>
      </div>

      {/* ── Pricing variants (Shopee-style chips) ── */}
      {hasVariants && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide"><L en="Session Type" zh="課程類型" /></p>
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
                      ? "bg-[#13223F] border-[#13223F] text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#C49A4A] hover:bg-[#FBF5E8]"
                  } ${step !== "form" ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{v.label}</span>
                    <div className="flex items-center gap-1.5">
                      {isMember && v.member_price < v.price && (
                        <span className={`text-[10px] line-through ${active ? "text-[#E7C98A]" : "text-gray-400"}`}>
                          NT${v.price.toLocaleString()}
                        </span>
                      )}
                      <span className={`text-xs font-semibold ${active ? "text-[#E7C98A]" : "text-[#A07C34]"}`}>
                        NT${showPrice.toLocaleString()}/pp
                      </span>
                    </div>
                  </div>
                  {!isMember && v.member_price < v.price && (
                    <p className={`text-[10px] mt-0.5 ${active ? "text-[#E7C98A]" : "text-gray-400"}`}>
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
          <p className="text-xs font-bold text-emerald-700">✓ <L en="Artecks Member" zh="Artecks 會員" /></p>
          <p className="text-[10px] text-emerald-600 mt-0.5"><L en="Member pricing applied to all tiers." zh="所有方案皆套用會員價。" /></p>
        </div>
      )}

      <div className="rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3">
        <p className="text-xs text-[#E7C98A] font-semibold">
          {step === "form" && hasVariants && selectedVariant
            ? <L en={`Per student · ${selectedVariant.label}${isMember ? " · Member rate" : ""}`} zh={`每位學生 · ${selectedVariant.label}${isMember ? " · 會員價" : ""}`} />
            : (hasVariants ? <L en="Starting from" zh="起價" /> : (session ? <L en="Per session" zh="每堂" /> : <L en="Starting from" zh="起價" />))}
        </p>
        {displayPrice != null
          ? <p className="text-2xl font-black text-[#A07C34]">NT${displayPrice.toLocaleString()} <span className="text-sm font-normal text-[#E7C98A]">TWD</span></p>
          : <p className="text-sm text-[#E7C98A] font-medium"><L en="Pricing TBD" zh="價格待定" /></p>
        }
      </div>
      {session?.coach && (
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
               style={{ backgroundColor: "#1C3157" }}>
            {session.coach.avatar_initials || session.coach.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{session.coach.name}</p>
            <p className="text-xs text-gray-400">{session.coach.title}</p>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3">
        <p className="text-xs font-bold text-[#A07C34] mb-1">🎮 <L en="Artecks Rewards" zh="Artecks 獎勵" /></p>
        <p className="text-xs text-[#A07C34]"><L en="Add your account ID to earn XP & coins after each session." zh="填入帳號 ID，每堂課後可賺 XP 與金幣。" /></p>
      </div>
      <a
        href="https://store.artecks.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#C49A4A] hover:text-[#8A6A2C] transition-all"
      >
        🛍 <L en="Visit Artecks Store" zh="前往 Artecks 商店" />
        <span className="text-gray-400 text-xs">→</span>
      </a>
    </div>
  );
}

// ── Coach card ────────────────────────────────────────────────────────────────

function CoachCard({ coach }: { coach: typeof COACHES[0] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex gap-4 hover:border-[#C49A4A] hover:shadow-sm transition-all">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-sm"
           style={{ backgroundColor: coach.color }}>
        {coach.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-black text-gray-900"><L en={coach.name} zh={coach.nameZH} /></h3>
            <p className="text-xs text-gray-400 font-medium"><L en={coach.title} zh={coach.titleZH} /></p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Star size={11} fill="currentColor" />
            {coach.rating.toFixed(1)}
            <span className="text-gray-400 font-normal">({coach.reviews})</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed"><L en={coach.bio} zh={coach.bioZH} /></p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Step = "calendar" | "slots" | "form" | "success";

export default function SessionMarketplace({ sessions, provider: initialProvider }: { sessions: AcademySession[]; provider: Provider | null }) {
  const zh = useLanguage().locale === "zh";
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
    calendar: zh ? "選擇日期" : "Select a Date",
    slots: selectedDate
      ? new Date(selectedDate + "T12:00:00+08:00").toLocaleDateString(zh ? "zh-TW" : "en-US", { weekday: "long", month: "long", day: "numeric" })
      : (zh ? "選擇時間" : "Select a Time"),
    form: zh ? "填寫資料" : "Your Details",
    success: zh ? "預約成功" : "Booking Confirmed",
  }[step];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      <SiteHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">

        {/* ── Hero intro ── */}
        <div>
          <h1 className="font-serif-tc text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            {zh ? <><span style={{ color: "#1C3157" }}>林口</span>西洋棋課程</> : <>Chess Lessons in <span style={{ color: "#1C3157" }}>Linkou</span></>}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {hasAnySessions
              ? (zh ? `${sessions.filter(s => s.status === "open" && s.booking_open && !s.is_full).length} 堂課開放報名 · 小班教學 · 專業教練`
                    : `${sessions.filter(s => s.status === "open" && s.booking_open && !s.is_full).length} sessions open · Small groups · Expert coaches`)
              : (zh ? "新課程即將開放！" : "New sessions launching soon — add your email to be notified!")}
          </p>
        </div>

        {/* ── Membership banner ── */}
        {providerWithPlans && providerWithPlans.plans.length > 0 && (
          <MemberBanner
            provider={providerWithPlans}
            membershipResult={membershipResult}
            onSubscribeClick={async (planId) => {
              const origin = publicOrigin();
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
                    <div className="mt-6 rounded-2xl border border-dashed border-[#E7C98A] bg-[#FBF5E8] px-5 py-4 text-center">
                      <p className="text-sm font-bold text-[#A07C34]">♟ {zh ? "課程即將開放" : "Sessions launching soon"}</p>
                      <p className="text-xs text-[#A07C34] mt-1 mb-3">
                        {zh ? "排定課程後，日期會在這裡標示出來。" : "Highlighted dates will appear here once sessions are scheduled."}
                      </p>
                      
                      <a href="/book" className="block text-xs font-bold text-[#A07C34] hover:text-[#8A6A2C]">
                        {zh ? "想要一對一課程？預約上課時間 →" : "Book a 1-on-1 lesson →"}
                      </a>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 text-center mt-4">{zh ? "台北時間" : "Asia/Taipei timezone"}</p>
                </>
              )}

              {/* Slots */}
              {step === "slots" && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    {zh ? `${slotsForDate.filter(s => s.status === "open" && s.booking_open && !s.is_full).length} 個時段可預約`
                        : `${slotsForDate.filter(s => s.status === "open" && s.booking_open && !s.is_full).length} slot${slotsForDate.length !== 1 ? "s" : ""} available`}
                  </p>
                  {slotsForDate.length > 0
                    ? <TimeSlots sessions={slotsForDate} onSelect={handleSlotSelect} />
                    : <p className="text-sm text-gray-400 py-8 text-center">{zh ? "這天沒有課程。" : "No sessions on this date."}</p>
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
        <div className="flex items-start gap-3 rounded-2xl border border-[#E7C98A] bg-[#FBF5E8] px-4 py-3">
          <span className="text-lg mt-0.5">🎮</span>
          <div>
            <p className="text-xs font-bold text-[#13223F]">{zh ? "所有人都可以預約，不需要登入。" : "Booking is open to everyone — no login required."}</p>
            <p className="text-xs text-[#A07C34] mt-0.5 leading-relaxed">
              {zh ? <>有 Artecks 帳號嗎？預約時填入帳號 ID，每堂課後自動獲得 <strong>XP 與金幣</strong>。</>
                  : <>Have an Artecks account? Add your account ID when you book and earn <strong>XP &amp; coins</strong> automatically after each session.</>}
            </p>
          </div>
        </div>

        {/* ── Coaches ── */}
        <section>
          <h2 className="text-lg font-black text-gray-900 mb-4">{zh ? "認識教練" : "Meet the Coaches"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {COACHES.map((coach) => <CoachCard key={coach.id} coach={coach} />)}
          </div>
        </section>

        {/* ── Ecosystem callout ── */}
        <section className="rounded-2xl border border-[#E7C98A] bg-gradient-to-br from-[#FBF5E8] to-[#F6F4EF] p-5">
          <p className="text-sm font-black text-[#A07C34] mb-1">🎮 {zh ? "Artecks 生態系獎勵" : "Artecks Ecosystem Rewards"}</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {zh ? <>連結 Artecks 帳號，每堂課後自動獲得 <strong className="text-[#A07C34]">XP</strong> 與 <strong className="text-[#A07C34]">金幣</strong>，可在 Artecks 商店與遊戲中使用。</>
                : <>Link your Artecks account and earn <strong className="text-[#A07C34]">XP</strong> and{" "}
                  <strong className="text-[#A07C34]">coins</strong> automatically after every session — redeemable in the Artecks store and games.</>}
          </p>
        </section>

        {/* ── Footer ── */}
        <footer className="py-4 flex items-center justify-end">
          <a href="https://store.artecks.com/admin/academy/" target="_blank" rel="noopener noreferrer"
             className="text-xs text-gray-300 hover:text-gray-400 transition-colors">Admin ↗</a>
        </footer>
      </div>
    </div>
  );
}
