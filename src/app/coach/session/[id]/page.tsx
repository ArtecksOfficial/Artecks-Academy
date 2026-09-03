// ─── Coach Quick Cockpit ──────────────────────────────────────────────────────
// Server Component. Fetches the session + all bookings, renders the static
// shell then hands the interactive roster off to <CoachClient />.

import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import CoachClient from "./CoachClient";
import { LanguageToggle } from "@/lib/i18n/LanguageContext";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Coach Cockpit — Artecks Academy",
  robots: { index: false, follow: false },
};

function formatDateTW(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CoachSessionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionErr || !session) {
    notFound();
  }

  const { data: bookings, error: bookingsErr } = await supabase
    .from("bookings")
    .select("*")
    .eq("session_id", id)
    .neq("status", "cancelled")
    .order("created_at");

  if (bookingsErr) {
    console.error("[CoachSessionPage] bookings fetch error:", bookingsErr);
  }

  const roster = bookings ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Coach Cockpit
              </span>
            </div>
            <LanguageToggle className="text-gray-500 border-gray-600" />
          </div>
          <h1 className="text-xl font-black leading-snug">{session.title}</h1>
          <p className="text-sm text-gray-400 mt-1">{session.topic}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
            <span>🕐 {formatDateTW(session.start_time)}</span>
            <span>📍 {session.location_name}</span>
          </div>
        </div>
      </header>

      {/* Roster */}
      <main className="max-w-lg mx-auto px-4 py-5">
        <CoachClient bookings={roster} />
      </main>
    </div>
  );
}
