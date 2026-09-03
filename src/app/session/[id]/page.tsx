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

// ── Coach data — update bios and photo URLs when ready ───────────────────────
const COACHES = [
  {
    name: "Issac Chang",
    initials: "IC",
    credentials: "Artecks Founder & Head Chess Coach",
    // bio: replace with your own when ready
    bio: "Bio coming soon.",
    // photoUrl: "/coaches/issac.jpg",  ← uncomment and add photo later
  },
  {
    name: "Michael Ladror",
    initials: "ML",
    credentials: "Chess Instructor",
    bio: "Bio coming soon.",
    // photoUrl: "/coaches/michael.jpg",
  },
];

// ── Dynamic OG metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await fetchSession(id);

  if (!session) return { title: "Artecks Academy" };

  return {
    title: `${session.title} — Artecks Academy`,
    description: session.topic || undefined,
    openGraph: {
      title: session.title,
      description: session.topic || undefined,
      siteName: "Artecks Academy",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await fetchSession(id);

  if (!session) {
    notFound();
  }

  const confirmedCount = session.max_seats - session.available_spots;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="text-sm font-bold text-gray-900">Artecks Academy</span>
          </div>
          <LanguageToggle className="text-gray-400 border-gray-300" />
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
        {session.topic && (
          <p className="text-sm text-gray-500 mt-1">{session.topic}</p>
        )}
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Booking card */}
        <BookingSection session={session as any} confirmedCount={confirmedCount} />

        {/* Coaches */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Your Coaches · 您的教練
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {COACHES.map((coach) => (
              <div key={coach.name} className="flex items-start gap-4 px-5 py-4">
                {/* Avatar — swap for <img> once photoUrl is set */}
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-lg font-black text-indigo-600">
                    {coach.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{coach.name}</p>
                  <p className="text-xs text-indigo-500 font-medium mb-1">
                    {coach.credentials}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">{coach.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Artecks ecosystem callout */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
          <p className="text-xs font-bold text-violet-700 mb-1">
            🎮 Artecks 生態系獎勵
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            連結您的 Artecks 帳號，上完課後將自動獲得{" "}
            <strong className="text-violet-700">XP 經驗值</strong> 及{" "}
            <strong className="text-violet-700">金幣</strong>，可用於 Artecks
            商城折扣及遊戲內兌換。
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
