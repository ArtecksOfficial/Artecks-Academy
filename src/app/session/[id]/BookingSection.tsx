"use client";
// ─── Booking Section — Client Component ───────────────────────────────────────
// Handles the interactive booking form with multi-channel contact selector.

import { useActionState, useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle, MapPin, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { bookSession, type BookingState, type ContactMethod } from "./actions";


interface Session {
  id: string | number;
  title: string;
  topic: string | null;
  start_time: string;
  end_time: string | null;
  location_name: string | null;
  location_address: string | null;
  max_seats: number;
  price_twd: number | null;
  booking_open: boolean;
  available_spots: number;
  coach: {
    name: string;
    line_id: string;
    bank_name: string;
    bank_code: string;
    bank_account: string;
  } | null;
}

const CONTACT_METHODS: { key: ContactMethod; emoji: string }[] = [
  { key: "whatsapp", emoji: "💬" },
  { key: "line", emoji: "🟢" },
  { key: "sms", emoji: "📱" },
  { key: "email", emoji: "✉️" },
];

const EXPERIENCE_OPTIONS = [
  { key: "beginner",    labelKey: "chessExpBeginner"    as const },
  { key: "knows_rules", labelKey: "chessExpKnowsRules"  as const },
  { key: "experienced", labelKey: "chessExpExperienced" as const },
];

function formatDateTW(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Confirmation screen ───────────────────────────────────────────────────────
function ConfirmationScreen({
  session,
  bookingId,
}: {
  session: Session;
  bookingId: string;
}) {
  const { t, locale } = useLanguage();
  const mapsUrl = session.location_address
    ? `https://maps.google.com/?q=${encodeURIComponent(session.location_address)}`
    : `https://maps.google.com/?q=${encodeURIComponent(session.location_name ?? "")}`;
  const coachLineId = session.coach?.line_id ?? "";
  const lineUrl = coachLineId ? `https://line.me/ti/p/~${coachLineId.replace("@", "")}` : "#";

  return (
    <div className="rounded-3xl bg-white shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-6 text-white text-center">
        <CheckCircle size={44} className="mx-auto mb-2" />
        <h2 className="text-xl font-black">{t("bookingSuccess")}</h2>
        <p className="text-sm text-emerald-100 mt-1">{t("bookingSuccessMsg")}</p>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Session info */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            {t("sessionDetails")}
          </p>
          <p className="font-bold text-gray-900">{session.title}</p>
          <p className="text-sm text-gray-600 mt-1">
            🕐 {formatDateTW(session.start_time, locale)}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-indigo-600 mt-1 hover:underline"
          >
            <MapPin size={13} />
            {session.location_name}
            {session.location_address && (
              <span className="text-gray-500 text-xs">— {session.location_address}</span>
            )}
            <ChevronRight size={13} className="ml-auto" />
          </a>
        </div>

        {/* What to bring */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            {t("whatToBring")}
          </p>
          <p className="text-sm text-gray-700">{t("whatToBringItems")}</p>
        </div>

        {/* Payment */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            {t("paymentTitle")}
          </p>
          <p className="text-sm font-semibold text-gray-800">
            NT$ {(session.price_twd ?? 0).toLocaleString()} · {t("paymentBankTransfer")}
          </p>
          <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-mono text-sm">
            <span className="text-gray-500 text-xs block mb-0.5">
              {locale === "zh" ? "銀行代碼" : "Bank Code"}
            </span>
            <span className="font-bold text-gray-900">{session.coach?.bank_code || "—"}</span>
            <span className="text-gray-500 text-xs block mt-2 mb-0.5">
              {locale === "zh" ? "帳號" : "Account"}
            </span>
            <span className="font-bold text-gray-900 tracking-widest">{session.coach?.bank_account || "—"}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{t("paymentBankNote")}</p>
        </div>

        {/* Contact coach */}
        <div className="px-6 py-4">
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full rounded-2xl ${coachLineId ? "bg-[#06C755]" : "bg-gray-300 cursor-not-allowed pointer-events-none"} py-3.5 text-sm font-bold text-white shadow-md shadow-green-200 active:scale-95 transition-all`}
          >
            <span className="text-lg">🟢</span>
            {t("contactCoachLine")}
          </a>
        </div>

        {/* Booking ref + report link */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{t("bookingRef")}</p>
            <p className="text-sm font-mono font-bold text-gray-700">#{bookingId}</p>
          </div>
          <a
            href={`/report/${bookingId}`}
            className="text-xs text-indigo-600 underline"
          >
            {t("viewParentCard")}
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main booking form ─────────────────────────────────────────────────────────
export default function BookingSection({
  session,

}: {
  session: Session;
}) {
  const { t, locale } = useLanguage();
  const initialState: BookingState = { status: "idle" };
  const [state, formAction, isPending] = useActionState(bookSession, initialState);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("line");
  const [experience, setExperience] = useState<string>("beginner");
  const [artecksAccountId, setArtecksAccountId] = useState<string>("");

  // Persist Artecks ID to localStorage on successful booking
  useEffect(() => {
    if (state.status === "success" && artecksAccountId.trim()) {
      try { localStorage.setItem("artecks_account_id", artecksAccountId.trim().toUpperCase()); } catch {}
    }
  }, [state.status, artecksAccountId]);

  const spotsLeft = session.available_spots;
  const isFull = spotsLeft === 0;
  const canBook = session.booking_open && !isFull;

  const placeholderKey = {
    whatsapp: "contactPlaceholderWhatsapp",
    line: "contactPlaceholderLine",
    sms: "contactPlaceholderSms",
    email: "contactPlaceholderEmail",
  }[contactMethod] as Parameters<typeof t>[0];

  if (state.status === "success" && state.bookingId) {
    return <ConfirmationScreen session={session} bookingId={state.bookingId} />;
  }

  return (
    <div className="rounded-3xl bg-white shadow-lg border border-gray-100 overflow-hidden">
      {/* Card header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
            {t("sessionDetails")}
          </p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isFull
              ? "bg-red-500/30 text-red-200"
              : "bg-white/20 text-white"
          }`}>
            {isFull
              ? t("fullyBooked")
              : `${spotsLeft} ${t("spotsLeft")}`}
          </span>
        </div>
        <p className="text-sm text-indigo-200">
          🕐 {formatDateTW(session.start_time, locale)} · 📍 {session.location_name}
        </p>
        {session.topic && (
          <p className="text-sm text-indigo-100 mt-0.5">{session.topic}</p>
        )}
        <p className="text-lg font-black mt-2">
          NT$ {(session.price_twd ?? 0).toLocaleString()}
        </p>
      </div>

      <div className="px-6 py-5">
        {!canBook ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-200 py-6 text-center">
            <p className="text-sm text-gray-500 font-medium">
              {isFull ? t("fullyBooked") : t("bookingUnavailable")}
            </p>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="session_id" value={session.id} />

            {/* ── Parent info ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("parentName")} *
                </span>
                <input
                  name="parent_name"
                  required
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("parentPhone")} *
                </span>
                <input
                  name="parent_phone"
                  type="tel"
                  required
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white"
                />
              </label>
            </div>

            {/* ── Student info ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("studentName")} *
                </span>
                <input
                  name="student_name"
                  required
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("studentAge")} *
                </span>
                <input
                  name="student_age"
                  type="number"
                  min={4}
                  max={18}
                  required
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white"
                />
              </label>
            </div>

            {/* ── Chess experience ─────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t("chessExperience")} *
              </span>
              <input type="hidden" name="chess_experience_level" value={experience} />
              <div className="flex flex-col gap-2">
                {EXPERIENCE_OPTIONS.map(({ key, labelKey }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setExperience(key)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium text-left transition-all border ${
                      experience === key
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {experience === key ? "● " : "○ "}{t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Contact method ───────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t("contactMethod")} *
              </span>
              <div className="grid grid-cols-4 gap-2">
                {CONTACT_METHODS.map(({ key, emoji }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setContactMethod(key)}
                    className={`rounded-xl py-2 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all ${
                      contactMethod === key
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span className="text-base">{emoji}</span>
                    <span>
                      {key === "whatsapp"
                        ? t("whatsapp")
                        : key === "line"
                        ? t("line")
                        : key === "sms"
                        ? t("smsSms")
                        : t("emailContact")}
                    </span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="contact_method" value={contactMethod} />
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("contactValue")} *
                </span>
                <input
                  name="contact_value"
                  required
                  placeholder={t(placeholderKey)}
                  type={contactMethod === "email" ? "email" : "text"}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white"
                />
              </label>
            </div>

            {/* ── Special notes ────────────────────────────────────────── */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t("specialNotes")}
              </span>
              <textarea
                name="special_notes"
                rows={3}
                placeholder={t("specialNotesPlaceholder")}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-indigo-400 focus:bg-white"
              />
            </label>

            {/* ── Artecks ID ───────────────────────────────────────────── */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t("artecksId")}
              </span>
              <input
                name="artecks_account_id"
                placeholder="ACT-XXXX"
                value={artecksAccountId}
                onChange={e => setArtecksAccountId(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white"
              />
              <span className="text-xs text-violet-600">{t("artecksIdHint")}</span>
            </label>

            {state.status === "error" && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{state.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submitBooking")
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
