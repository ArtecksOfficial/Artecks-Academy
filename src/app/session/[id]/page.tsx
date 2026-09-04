// ─── Public Session Landing Page ──────────────────────────────────────────────
// Server Component. Fetches session from Django API, then renders the static
// shell + hands off interactivity to <BookingSection />.

import { notFound } from "next/navigation";
import { fetchSession } from "@/lib/api";
import BookingSection from "./BookingSection";
import { LanguageToggle } from "@/lib/i18n/LanguageContext";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await fetchSession(id).catch(() => null);
  if (!session) return { title: "Session Not Found" };
  return {
    title: `${session.title} | Artecks Academy`,
    description: session.topic ?? undefined,
  };
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await fetchSession(id).catch(() => null);
  if (!session) notFound();

  const startDate = new Date(session.start_time);
  const endDate = session.end_time ? new Date(session.end_time) : null;

  function fmt(d: Date) {
    return d.toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const spotsLeft = session.available_spots;
  const isFull = session.is_full;
  const canBook = session.booking_open && !isFull && session.status === "open";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:opacity-80 transition-opacity">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 18l-6-6 6-6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Artecks Academy
          </a>
          <LanguageToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* ── Hero card ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Status ribbon */}
          <div className={`h-1.5 ${canBook ? "bg-indigo-500" : isFull ? "bg-amber-400" : "bg-gray-300"}`} />

          <div className="px-6 py-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {session.age_group && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  👶 {session.age_group}
                </span>
              )}
              {session.status === "cancelled" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">Cancelled</span>
              )}
              {isFull && session.status !== "cancelled" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">Full</span>
              )}
              {canBook && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">Open</span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{session.title}</h1>
            {session.topic && <p className="text-sm text-gray-500 mb-4">{session.topic}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              {/* Date/Time */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">📅</span>
                <div>
                  <p className="font-semibold">{fmt(startDate)}</p>
                  {endDate && (
                    <p className="text-gray-400 text-xs">ends {endDate.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit" })}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">📍</span>
                <div>
                  <p className="font-semibold">{session.location_name ?? "TBD"}</p>
                  {session.location_address && <p className="text-gray-400 text-xs">{session.location_address}</p>}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">💰</span>
                <div>
                  <p className="font-semibold">
                    {session.price_twd ? `NT$${session.price_twd.toLocaleString()}` : "Free"}
                  </p>
                  <p className="text-gray-400 text-xs">per session</p>
                </div>
              </div>

              {/* Seats */}
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🪑</span>
                <div>
                  <p className="font-semibold">
                    {isFull ? "Session full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                  </p>
                  <p className="text-gray-400 text-xs">of {session.max_seats} total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coach card ── */}
        {session.coach && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Coach · 您的教練</p>
            </div>
            <div className="flex items-start gap-4 px-5 py-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-indigo-600">
                  {session.coach.avatar_initials || session.coach.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{session.coach.name}</p>
                {session.coach.name_zh && <p className="text-xs text-gray-400">{session.coach.name_zh}</p>}
                <p className="text-xs text-indigo-500 font-medium mb-1">{session.coach.title}</p>
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
