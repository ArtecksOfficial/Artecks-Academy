// ─── Artecks Academy — Linkou Parent Booking Catalog ─────────────────────────
// Server Component. Fetches upcoming open sessions from Django API and renders
// the parent-facing landing page.

import { fetchSessions } from "@/lib/api";
import type { AcademySession } from "@/lib/types";
import { BookOpen, MapPin, Clock, Users } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTW(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateEN(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "Asia/Taipei",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCatalogCard({ session }: { session: AcademySession }) {
  const spotsLeft = session.available_spots;
  const isFull = session.is_full;
  const isOpen = session.status === "open" && session.booking_open && !isFull;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Colour band */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isFull
                ? "bg-red-50 text-red-600 border border-red-200"
                : isOpen
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isFull ? "額滿 · Full" : isOpen ? "開放報名 · Open" : "已結束 · Closed"}
          </span>
          {session.age_group && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {session.age_group}
            </span>
          )}
        </div>

        {/* Title & topic */}
        <div>
          <h2 className="text-base font-black text-gray-900 leading-snug">
            {session.title}
          </h2>
          {session.topic && (
            <p className="text-sm text-gray-500 mt-0.5">{session.topic}</p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
          <div className="flex items-start gap-1.5">
            <Clock size={12} className="mt-0.5 shrink-0 text-indigo-400" />
            <div>
              <span className="block">{formatDateTW(session.start_time)}</span>
              <span className="block text-gray-400">{formatDateEN(session.start_time)}</span>
            </div>
          </div>
          {session.location_name && (
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="shrink-0 text-indigo-400" />
              <span>{session.location_name}</span>
            </div>
          )}
          {session.location_address && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 pl-[17px]">{session.location_address}</span>
            </div>
          )}
        </div>

        {/* Price + spots row */}
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-gray-900">
            NT$ {(session.price_twd ?? 0).toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold">
            <Users size={12} className={isFull ? "text-red-400" : "text-emerald-500"} />
            <span className={isFull ? "text-red-500" : "text-emerald-600"}>
              {isFull ? "名額已滿" : `剩 ${spotsLeft} 席`}
            </span>
          </div>
        </div>

        {/* CTA */}
        {isOpen ? (
          <a
            href={`/session/${session.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-colors"
          >
            <BookOpen size={14} />
            立即報名 · Book Now
          </a>
        ) : (
          <div className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed">
            {isFull ? "名額已滿" : "報名未開放"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LinkoaCatalogPage() {
  const sessions = await fetchSessions();
  const hasSessions = sessions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">Artecks Academy</p>
              <p className="text-xs text-indigo-600 font-semibold leading-none mt-0.5">林口青少年棋藝充實課程</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            <MapPin size={11} className="text-indigo-500" />
            <span className="font-semibold text-indigo-700">林口區 · Linkou</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-2xl mx-auto px-4 pt-8 pb-6">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-200">
              Artecks Academy · 林口
            </div>
          </div>
          <h1 className="text-2xl font-black leading-tight mb-1">
            林口青少年
            <br />
            西洋棋 · 充實課程
          </h1>
          <p className="text-sm text-indigo-200 leading-relaxed mt-2">
            Youth Chess &amp; Enrichment — Linkou District
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/15 rounded-full px-3 py-1">♟ 西洋棋戰術</span>
            <span className="bg-white/15 rounded-full px-3 py-1">🎯 小班制教學</span>
            <span className="bg-white/15 rounded-full px-3 py-1">📍 林口在地場地</span>
            <span className="bg-white/15 rounded-full px-3 py-1">🏆 Artecks 生態獎勵</span>
          </div>
        </div>
      </section>

      {/* ── Location strip ── */}
      <section className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <MapPin size={15} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            <strong>所有課程皆位於新北市林口區</strong>，詳細場地地址請見各課程頁面。
            All sessions are held in Linkou District, New Taipei City.
          </p>
        </div>
      </section>

      {/* ── Catalog ── */}
      <main className="max-w-2xl mx-auto px-4 pb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">
            近期課程 <span className="text-gray-400 font-normal text-sm">Upcoming Sessions</span>
          </h2>
          {hasSessions && (
            <span className="text-xs text-gray-400">{sessions.length} 堂</span>
          )}
        </div>

        {hasSessions ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map((session) => (
              <SessionCatalogCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="text-4xl mb-3">♟</div>
            <p className="font-bold text-gray-700">近期尚無開放課程</p>
            <p className="text-sm text-gray-400 mt-1">
              No sessions available right now — check back soon!
            </p>
          </div>
        )}
      </main>

      {/* ── Ecosystem callout ── */}
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
          <p className="text-sm font-black text-violet-700 mb-1">🎮 Artecks 生態系獎勵</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            連結 Artecks 帳號後，課程結束自動獲得 <strong className="text-violet-700">XP 經驗值</strong>{" "}
            及 <strong className="text-violet-700">金幣</strong>，可在 Artecks 商城消費及遊戲兌換。
            <span className="text-gray-400 ml-1">Link your Artecks account for automatic XP &amp; coin rewards.</span>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="max-w-2xl mx-auto px-4 py-6 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Artecks · academy.artecks.com
        </p>
        <a
          href="https://artecks.com/admin/academy/"
          className="text-xs text-gray-300 hover:text-gray-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Admin
        </a>
      </footer>
    </div>
  );
}
