"use client";
// ─── Report Card — Client Component ──────────────────────────────────────────
// Receives pre-fetched data as props from the server page.
// Rendered client-side so the language toggle + share buttons work.

import { useState } from "react";
import { useLanguage, LanguageToggle } from "@/lib/i18n/LanguageContext";

interface SessionData {
  title: string;
  topic: string | null;
  start_time: string;
  location_name: string | null;
}

interface ReportData {
  skill_tags: string[] | null;
  coach_notes: string | null;
  generated_summary: string | null;
  xp_awarded: number | null;
  coins_awarded: number | null;
}

interface ReportCardProps {
  studentName: string;
  attended: boolean;
  rewardsCredited: boolean;
  artecksAccountId: string | null;
  session: SessionData | null;
  report: ReportData | null;
  bookingId: string;
}

function formatDateTW(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function ShareButtons({ studentName, bookingId }: { studentName: string; bookingId: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/report/${bookingId}`
    : `https://academy.artecks.com/report/${bookingId}`;

  const text = encodeURIComponent(`${studentName} 的 Artecks Academy 課後學習報告 📋`);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select a temp input
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {t("shareTitle")}
      </p>
      <div className="flex gap-2">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${text}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] text-white py-2.5 text-xs font-bold active:scale-95 transition-all"
        >
          💬 {t("shareWhatsapp")}
        </a>
        {/* LINE */}
        <a
          href={`https://line.me/R/share?text=${text}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#06C755] text-white py-2.5 text-xs font-bold active:scale-95 transition-all"
        >
          🟢 {t("shareLine")}
        </a>
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 text-gray-700 py-2.5 text-xs font-bold active:scale-95 transition-all"
        >
          {copied ? `✅ ${t("linkCopied")}` : `🔗 ${t("copyLink")}`}
        </button>
      </div>
    </div>
  );
}

export default function ReportCard({
  studentName,
  attended,
  rewardsCredited,
  artecksAccountId,
  session,
  report,
  bookingId,
}: ReportCardProps) {
  const { t, locale } = useLanguage();
  const hasReport = !!report;
  const hasRewards = rewardsCredited && hasReport;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-violet-900 py-8 px-4">
      <div className="max-w-sm mx-auto flex flex-col gap-4">

        {/* Academy badge + language toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="text-sm font-bold text-white/80">{t("brandName")}</span>
          </div>
          <LanguageToggle className="text-white/60 border-white/30" />
        </div>

        {/* Main card */}
        <div className="rounded-3xl bg-white shadow-2xl shadow-indigo-900/40 overflow-hidden">

          {/* Card header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-1">
              {t("reportCardLabel")}
            </p>
            <h1 className="text-2xl font-black">{studentName}</h1>
            {session && (
              <p className="text-sm text-indigo-200 mt-1">
                {formatDateTW(session.start_time, locale)} · {session.location_name}
              </p>
            )}
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Session topic */}
            {session && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {t("sessionTopic")}
                </p>
                <p className="text-base font-bold text-gray-900">{session.title}</p>
                {session.topic && (
                  <p className="text-sm text-gray-600 mt-0.5">{session.topic}</p>
                )}
              </div>
            )}

            {hasReport ? (
              <>
                {/* Skill tags */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {t("skillsLabel")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(report.skill_tags ?? []).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-sm font-semibold"
                      >
                        ✦ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coach notes */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {t("coachComments")}
                  </p>
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-sm leading-relaxed text-gray-800 italic">
                      「{report.coach_notes}」
                    </p>
                  </div>
                </div>

                {/* Generated summary */}
                {report.generated_summary && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      {t("summaryLabel")}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {report.generated_summary}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center">
                <p className="text-sm text-amber-700 font-medium">
                  {t("reportPending")}
                </p>
              </div>
            )}

            {/* Artecks Loot Box */}
            {hasRewards && (
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                    🎁
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-200">
                      {t("lootBoxTitle")}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {t("lootBoxSub")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl bg-white/15 px-4 py-3 text-center">
                    <p className="text-2xl font-black text-yellow-300">
                      +{report?.xp_awarded ?? 100}
                    </p>
                    <p className="text-xs text-violet-200 font-semibold mt-0.5">
                      {t("xpAwarded")}
                    </p>
                  </div>
                  <div className="flex-1 rounded-xl bg-white/15 px-4 py-3 text-center">
                    <p className="text-2xl font-black text-yellow-300">
                      +{report?.coins_awarded ?? 30}
                    </p>
                    <p className="text-xs text-violet-200 font-semibold mt-0.5">
                      {t("coinsAwarded")}
                    </p>
                  </div>
                </div>

                {artecksAccountId && (
                  <p className="text-xs text-violet-300 mt-3 text-center">
                    {t("sentTo").replace("{id}", artecksAccountId)}
                  </p>
                )}
              </div>
            )}

            {/* Attendance badge */}
            <div
              className={`flex items-center justify-center gap-2 rounded-xl py-3 ${
                attended
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="text-lg">{attended ? "✅" : "⏳"}</span>
              <span
                className={`text-sm font-semibold ${
                  attended ? "text-emerald-700" : "text-gray-500"
                }`}
              >
                {attended ? t("confirmedAttend") : t("pendingAttendance")}
              </span>
            </div>

            {/* Share buttons */}
            <ShareButtons studentName={studentName} bookingId={bookingId} />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-indigo-300">
          academy.artecks.com · Powered by Artecks
        </p>
      </div>
    </div>
  );
}
