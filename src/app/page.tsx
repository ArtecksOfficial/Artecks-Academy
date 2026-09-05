// ─── Artecks Academy — Home / Discovery Page ─────────────────────────────────
// Server Component: lists coaches and upcoming sessions for discovery.
// Booking lives at /sessions (full calendar) or /session/[id] (single session).

import { fetchSessions, fetchProviderPlans } from "@/lib/api";
import type { AcademySession, Coach, Provider } from "@/lib/types";
import { MapPin, Clock, Users, Crown, ArrowRight, Star, ChevronRight } from "lucide-react";
import HomeSubscribeButton from "@/app/components/HomeSubscribeButton";
import ArtecksBalance from "@/app/components/ArtecksBalance";

const TZ = "Asia/Taipei";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: TZ, weekday: "short", month: "short", day: "numeric",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true,
  });
}
function durationMins(start: string, end: string | null) {
  if (!end) return null;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

// ── Coach dedup helper ────────────────────────────────────────────────────────

function uniqueCoaches(sessions: AcademySession[]): Coach[] {
  const seen = new Set<number>();
  const coaches: Coach[] = [];
  for (const s of sessions) {
    if (s.coach && !seen.has(s.coach.id)) {
      seen.add(s.coach.id);
      coaches.push(s.coach);
    }
  }
  return coaches;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CoachCard({ coach }: { coach: Coach }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xl font-black"
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
        >
          {coach.avatar_initials || coach.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-black text-gray-900 text-base">{coach.name}</p>
          {coach.name_zh && <p className="text-xs text-gray-400 font-medium">{coach.name_zh}</p>}
          <p className="text-xs text-indigo-600 font-semibold mt-0.5">{coach.title}</p>
        </div>
      </div>
      {coach.bio && (
        <p className="text-sm text-gray-500 leading-relaxed flex-1">{coach.bio}</p>
      )}
      <a
        href="/sessions"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold py-2.5 transition-colors"
      >
        View sessions <ChevronRight size={14} />
      </a>
    </div>
  );
}

function SessionCard({ session }: { session: AcademySession }) {
  const canBook = session.booking_open && !session.is_full && session.status === "open";
  const dur = durationMins(session.start_time, session.end_time);

  return (
    <a
      href={`/session/${session.id}`}
      className="group bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md hover:border-indigo-200 transition-all"
    >
      {/* Date + status row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {fmtDate(session.start_time)}
          </span>
          <span className="text-xs text-gray-400 font-medium">{fmtTime(session.start_time)}</span>
        </div>
        {session.is_full ? (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Full</span>
        ) : session.status === "cancelled" ? (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Cancelled</span>
        ) : canBook ? (
          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Open</span>
        ) : null}
      </div>

      {/* Title + topic */}
      <div>
        <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{session.title}</p>
        {session.topic && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{session.topic}</p>}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {dur && (
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-gray-400" />{dur} min
          </span>
        )}
        <span className="flex items-center gap-1">
          <MapPin size={11} className="text-gray-400" />{session.location_name ?? "TBD"}
        </span>
        {!session.is_full && (
          <span className="flex items-center gap-1">
            <Users size={11} className="text-gray-400" />
            {session.available_spots} spot{session.available_spots !== 1 ? "s" : ""} left
          </span>
        )}
      </div>

      {/* Coach + price row */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        {session.coach ? (
          <span className="text-xs text-gray-500 font-medium">
            with <span className="text-gray-800 font-bold">{session.coach.name}</span>
          </span>
        ) : <span />}
        <span className="text-sm font-black text-indigo-600">
          {session.price_twd ? `NT$${session.price_twd.toLocaleString()}` : "Free"}
        </span>
      </div>
    </a>
  );
}

function SubscribeBanner({ provider }: { provider: Provider }) {
  const plan = provider.plans[0];
  if (!plan) return null;
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={16} className="text-yellow-300" />
          <p className="font-black text-sm">Become an Artecks Member</p>
        </div>
        <p className="text-indigo-200 text-xs leading-relaxed">
          Save {plan.discount_percent}% on every session · Priority booking · Member-only events
        </p>
      </div>
      <HomeSubscribeButton planId={plan.id} />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [sessions, provider] = await Promise.all([
    fetchSessions(),
    fetchProviderPlans("issac"),
  ]);

  const coaches = uniqueCoaches(sessions);
  const upcoming = sessions
    .filter(s => s.status !== "cancelled" && s.booking_open)
    .slice(0, 9);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-sm font-black">♟</span>
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">Artecks Academy</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#4F46E5" }}>林口 · Chess &amp; Enrichment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <MapPin size={11} className="text-indigo-500" />
              <span className="font-semibold text-indigo-600">Linkou, New Taipei</span>
            </div>
            <ArtecksBalance />
            <a href="/bookings/mine" className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
              My Bookings
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-12">

        {/* ── Hero ── */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Chess Lessons &amp; Events<br />
            in <span style={{ color: "#4F46E5" }}>Linkou</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md">
            Expert coaches · Small groups · Suitable for ages 5 and up.
            Book a single session or join as a member for ongoing savings.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <a
              href="/sessions"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Browse Sessions <ChevronRight size={14} />
            </a>
            <a
              href="/bookings/mine"
              className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 text-gray-600 transition-colors"
            >
              My Bookings
            </a>
          </div>
        </div>

        {/* ── Subscribe banner (only if provider has plans) ── */}
        {provider && provider.plans.length > 0 && (
          <SubscribeBanner provider={provider} />
        )}

        {/* ── Upcoming sessions ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Upcoming Sessions</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {upcoming.length > 0
                  ? `${upcoming.length} session${upcoming.length !== 1 ? "s" : ""} available to book`
                  : "No sessions scheduled yet — check back soon"}
              </p>
            </div>
            {upcoming.length > 0 && (
              <a href="/sessions" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
                Calendar view <ChevronRight size={12} />
              </a>
            )}
          </div>

          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-14 text-center">
              <p className="text-3xl mb-2">♟</p>
              <p className="text-sm font-bold text-gray-400">No sessions open right now</p>
              <p className="text-xs text-gray-400 mt-1">New sessions are added weekly — come back soon!</p>
            </div>
          )}
        </section>

        {/* ── Coaches ── */}
        {coaches.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-black text-gray-900">Meet the Coaches</h2>
              <p className="text-xs text-gray-400 mt-0.5">All coaches are trained and vetted by Artecks</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coaches.map(c => <CoachCard key={c.id} coach={c} />)}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="border-t border-gray-200 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-base">♟</span>
            <span className="font-bold text-gray-500">Artecks Academy</span>
            <span>· Linkou, New Taipei</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/sessions" className="hover:text-indigo-600 transition-colors font-medium">Book a Session</a>
            <a href="/bookings/mine" className="hover:text-indigo-600 transition-colors font-medium">My Bookings</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
