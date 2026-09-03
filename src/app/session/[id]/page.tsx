// ─── Public Session Landing Page ──────────────────────────────────────────────
// Server Component. Fetches session + confirmed booking count, then renders
// the static shell + hands off interactivity to <BookingSection />.

import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import BookingSection from "./BookingSection";
import { LanguageToggle } from "@/lib/i18n/LanguageContext";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ── Dynamic OG metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("sessions")
    .select("title, topic, start_time")
    .eq("id", id)
    .single();

  if (!data) return { title: "Artecks Academy" };

  return {
    title: `${data.title} — Artecks Academy`,
    description: data.topic ?? undefined,
    openGraph: {
      title: data.title,
      description: data.topic ?? undefined,
      siteName: "Artecks Academy",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerClient();

  // Fetch session
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !session) {
    notFound();
  }

  // Count confirmed bookings (non-cancelled)
  const { count: confirmedCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("session_id", id)
    .neq("status", "cancelled");

  const seated = confirmedCount ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="text-sm font-bold text-gray-900">Artecks</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">
              Powered by Artecks
            </span>
            <LanguageToggle className="text-gray-400 border-gray-300" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-2">
        <div className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">
          Artecks Academy · 林口社區小課
        </div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight">
          {session.title}
        </h1>
      </div>

      {/* Booking card */}
      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        <BookingSection session={session} confirmedCount={seated} />

        {/* Ecosystem callout */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
          <p className="text-xs font-bold text-violet-700 mb-1">
            🎮 Artecks 生態系獎勵
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            連結您的 Artecks 帳號，上完課後將自動獲得{" "}
            <strong className="text-violet-700">XP 經驗值</strong> 及{" "}
            <strong className="text-violet-700">金幣</strong>，可用於 Artecks
            商城消費及遊戲內兌換。
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-xs text-gray-400">
          academy.artecks.com · © {new Date().getFullYear()} Artecks
        </p>
      </footer>
    </div>
  );
}
