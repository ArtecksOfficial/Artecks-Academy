// ─── Session detail view ─────────────────────────────────────────────────────
// Shared by the web page (page.web.tsx, server-rendered) and the iOS page
// (../page.ios.tsx, fetched on the client). Keep it free of server-only code.

import L, { LDate } from "@/app/components/L";
import SiteHeader from "@/app/components/SiteHeader";
import BookingSection from "./BookingSection";
import type { AcademySession } from "@/lib/types";

export default function SessionView({ session }: { session: AcademySession }) {

  const endDate = session.end_time ? new Date(session.end_time) : null;


  const spotsLeft = session.available_spots;
  const isFull = session.is_full;
  const canBook = session.booking_open && !isFull && session.status === "open";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ── */}
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* ── Hero card ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Status ribbon */}
          <div className={`h-1.5 ${canBook ? "bg-[#13223F]" : isFull ? "bg-amber-400" : "bg-gray-300"}`} />

          <div className="px-6 py-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {session.age_group && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FBF5E8] text-[#A07C34] text-xs font-semibold">
                  👶 {session.age_group}
                </span>
              )}
              {session.status === "cancelled" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold"><L en="Cancelled" zh="已取消" /></span>
              )}
              {isFull && session.status !== "cancelled" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold"><L en="Full" zh="已額滿" /></span>
              )}
              {canBook && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold"><L en="Open" zh="開放報名" /></span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{session.title}</h1>
            {session.topic && <p className="text-sm text-gray-500 mb-4">{session.topic}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              {/* Date/Time */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">📅</span>
                <div>
                  <p className="font-semibold"><LDate iso={session.start_time} opts={{ year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }} /></p>
                  {endDate && (
                    <p className="text-gray-400 text-xs"><L en="ends" zh="結束" /> <LDate iso={session.end_time!} opts={{ hour: "2-digit", minute: "2-digit" }} /></p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">📍</span>
                <div>
                  <p className="font-semibold">{session.location_name ?? <L en="TBD" zh="待定" />}</p>
                  {session.location_address && <p className="text-gray-400 text-xs">{session.location_address}</p>}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">💰</span>
                <div>
                  <p className="font-semibold">
                    {session.price_twd ? `NT$${session.price_twd.toLocaleString()}` : <L en="Free" zh="免費" />}
                  </p>
                  <p className="text-gray-400 text-xs"><L en="per session" zh="每堂" /></p>
                </div>
              </div>

              {/* Seats */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🪑</span>
                <div>
                  <p className="font-semibold">
                    {isFull ? <L en="Session full" zh="已額滿" /> : <L en={`${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`} zh={`剩 ${spotsLeft} 個名額`} />}
                  </p>
                  <p className="text-gray-400 text-xs"><L en={`of ${session.max_seats} total`} zh={`共 ${session.max_seats} 個名額`} /></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coach card ── */}
        {session.coach && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400"><L en="Your Coach" zh="您的教練" /></p>
            </div>
            <div className="flex items-start gap-4 px-5 py-4">
              <div className="w-14 h-14 rounded-full bg-[#FBF5E8] flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-[#A07C34]">
                  {session.coach.avatar_initials || session.coach.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{session.coach.name}</p>
                {session.coach.name_zh && <p className="text-xs text-gray-400">{session.coach.name_zh}</p>}
                <p className="text-xs text-[#A07C34] font-medium mb-1">{session.coach.title}</p>
                {session.coach.bio && <p className="text-sm text-gray-500 leading-relaxed">{session.coach.bio}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Booking form (client component) ── */}
        <BookingSection session={session} />

      </main>
    </div>
  );
}
