"use client";
// ─── Coach Cockpit — Client Component ────────────────────────────────────────

import { useActionState, useState, useTransition } from "react";
import {
  CheckCircle,
  Circle,
  Loader2,
  Star,
  ClipboardList,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import type { Booking } from "@/lib/types";
import {
  markAttendedAndCredit,
  createLessonReport,
  type CreateReportState,
} from "./actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// ── Available skill tags ──────────────────────────────────────────────────────
const SKILL_TAGS = [
  "騎士跳法",
  "雙車攻擊",
  "國王安全",
  "開局原則",
  "殘局技巧",
  "棋子協調",
  "兵形結構",
  "戰術計算",
  "時間管理",
  "心理韌性",
];

// ── Attendance Row ────────────────────────────────────────────────────────────
function AttendanceRow({
  booking,
  onReportOpen,
}: {
  booking: Booking;
  onReportOpen: (bookingId: string, studentName: string) => void;
}) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [attended, setAttended] = useState(booking.attended);
  const [credited, setCredited] = useState(booking.rewards_credited);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    if (attended && credited) return;

    startTransition(async () => {
      setError(null);
      const result = await markAttendedAndCredit(booking.id);
      if (result.success) {
        setAttended(true);
        setCredited(true);
      } else {
        setError(result.error ?? t("errGeneric"));
      }
    });
  };

  // Contact method label
  const contactLabel =
    booking.contact_method === "whatsapp"
      ? "💬 WA"
      : booking.contact_method === "line"
      ? "🟢 LINE"
      : booking.contact_method === "sms"
      ? "📱 SMS"
      : booking.contact_method === "email"
      ? "✉️ Email"
      : null;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        attended
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{booking.student_name}</p>
          <p className="text-xs text-gray-500">
            {booking.student_age}y ·{" "}
            <span className="font-mono">{booking.parent_phone}</span>
          </p>
          {contactLabel && booking.contact_value && (
            <p className="text-xs text-gray-400 mt-0.5">
              {contactLabel}: <span className="font-mono">{booking.contact_value}</span>
            </p>
          )}
          {booking.artecks_account_id && (
            <p className="text-xs text-violet-600 flex items-center gap-1 mt-0.5">
              <Star size={11} />
              {booking.artecks_account_id}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle size={11} />
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-3">
          {/* Report button */}
          <button
            onClick={() => onReportOpen(booking.id, booking.student_name)}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 flex items-center gap-1 active:scale-95 transition-all"
          >
            <ClipboardList size={13} />
            {t("reportBtn")}
          </button>

          {/* Attend + Credit toggle */}
          <button
            onClick={handleToggle}
            disabled={isPending || (attended && credited)}
            className={`rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all ${
              attended && credited
                ? "bg-emerald-100 text-emerald-700 cursor-default"
                : "bg-gray-900 text-white shadow-md shadow-gray-300"
            }`}
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : attended && credited ? (
              <>
                <CheckCircle size={14} />
                {t("alreadyRewarded")}
              </>
            ) : (
              <>
                <Circle size={14} />
                {t("markAttend")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Report Form ─────────────────────────────────────────────────────────
function ReportForm({
  bookingId,
  studentName,
  onClose,
}: {
  bookingId: string;
  studentName: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const initialState: CreateReportState = { status: "idle" };
  const [state, formAction, isPending] = useActionState(createLessonReport, initialState);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 3
        ? [...prev, tag]
        : prev
    );
  };

  if (state.status === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/40">
        <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-6 pb-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="font-bold text-gray-900">{t("reportSaved")}</p>
          <a
            href={`/report/${bookingId}`}
            className="text-sm text-indigo-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("viewParentCard")}
          </a>
          <button
            onClick={onClose}
            className="mt-2 w-full rounded-2xl bg-gray-100 py-3 text-sm font-semibold text-gray-700"
          >
            {t("closeBtn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-6 pb-10 overflow-y-auto max-h-[88vh]">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{studentName}</h3>
          <button onClick={onClose} className="text-xs text-gray-400 underline">
            {t("cancelBtn")}
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="booking_id" value={bookingId} />

          {/* Skill tags */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("skillTagsLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {selectedTags.map((tag) => (
              <input key={tag} type="hidden" name="skill_tags" value={tag} />
            ))}
          </div>

          {/* Coach notes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("coachNotesLabel")}
            </p>
            <textarea
              name="coach_notes"
              required
              rows={3}
              placeholder={t("coachNotesPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm resize-none focus:outline-none focus:border-indigo-400 focus:bg-white"
            />
          </div>

          {/* Rewards override */}
          <details className="rounded-xl border border-gray-200">
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none text-sm text-gray-600 font-medium list-none">
              <ChevronDown size={15} />
              {t("adjustRewards")}
            </summary>
            <div className="px-4 pb-4 flex gap-3">
              <label className="flex-1">
                <span className="text-xs text-gray-500 block mb-1">{t("xpLabel")}</span>
                <input
                  name="xp_awarded"
                  type="number"
                  defaultValue={100}
                  min={0}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm text-center font-mono"
                />
              </label>
              <label className="flex-1">
                <span className="text-xs text-gray-500 block mb-1">{t("coinsLabel")}</span>
                <input
                  name="coins_awarded"
                  type="number"
                  defaultValue={30}
                  min={0}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm text-center font-mono"
                />
              </label>
            </div>
          </details>

          {state.status === "error" && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
              <AlertCircle size={15} className="text-red-500" />
              <p className="text-sm text-red-700">{state.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || selectedTags.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("saveReport")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function CoachClient({ bookings }: { bookings: Booking[] }) {
  const { t } = useLanguage();
  const [reportTarget, setReportTarget] = useState<{
    bookingId: string;
    studentName: string;
  } | null>(null);

  const attended = bookings.filter((b) => b.attended).length;
  const pending = bookings.filter((b) => !b.attended).length;

  return (
    <>
      {/* Summary strip */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center">
          <p className="text-2xl font-black text-emerald-700">{attended}</p>
          <p className="text-xs text-emerald-600 font-medium">{t("attended")}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-center">
          <p className="text-2xl font-black text-amber-700">{pending}</p>
          <p className="text-xs text-amber-600 font-medium">{t("pendingAttend")}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-indigo-50 border border-indigo-200 p-3 text-center">
          <p className="text-2xl font-black text-indigo-700">{bookings.length}</p>
          <p className="text-xs text-indigo-600 font-medium">{t("totalBookings")}</p>
        </div>
      </div>

      {/* Roster */}
      <div className="flex flex-col gap-3">
        {bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">{t("noStudents")}</p>
        ) : (
          bookings.map((booking) => (
            <AttendanceRow
              key={booking.id}
              booking={booking}
              onReportOpen={(id, name) =>
                setReportTarget({ bookingId: id, studentName: name })
              }
            />
          ))
        )}
      </div>

      {/* Report drawer */}
      {reportTarget && (
        <ReportForm
          bookingId={reportTarget.bookingId}
          studentName={reportTarget.studentName}
          onClose={() => setReportTarget(null)}
        />
      )}
    </>
  );
}
