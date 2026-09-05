// ─── Artecks Academy — Home / Landing Page ───────────────────────────────────
// Server Component: landing page + discovery for new and returning visitors.

import { fetchSessions, fetchProviderPlans } from "@/lib/api";
import type { AcademySession, Coach, Provider } from "@/lib/types";
import { MapPin, Clock, Users, Crown, ArrowRight, ChevronRight, Star, Zap, Gem } from "lucide-react";
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

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: AcademySession }) {
  const canBook = session.booking_open && !session.is_full && session.status === "open";
  const dur = durationMins(session.start_time, session.end_time);

  return (
    <a
      href={`/session/${session.id}`}
      className="group bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md hover:border-indigo-200 transition-all"
    >
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
      <div>
        <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{session.title}</p>
        {session.topic && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{session.topic}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {dur && (
          <span className="flex items-center gap-1"><Clock size={11} className="text-gray-400" />{dur} min</span>
        )}
        <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{session.location_name ?? "TBD"}</span>
        {!session.is_full && (
          <span className="flex items-center gap-1"><Users size={11} className="text-gray-400" />{session.available_spots} spot{session.available_spots !== 1 ? "s" : ""} left</span>
        )}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        {session.coach ? (
          <span className="text-xs text-gray-500 font-medium">with <span className="text-gray-800 font-bold">{session.coach.name}</span></span>
        ) : <span />}
        <span className="text-sm font-black text-indigo-600">
          {session.price_twd ? `NT$${session.price_twd.toLocaleString()}` : "Free"}
        </span>
      </div>
    </a>
  );
}

// ── Coach Card ────────────────────────────────────────────────────────────────

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

  const plan = provider?.plans[0] ?? null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
              <div>
                <p className="text-sm font-black text-gray-900 leading-none">Artecks Academy</p>
                <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#4F46E5" }}>林口 · Chess &amp; Enrichment</p>
              </div>
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

      {/* ── Hero ── */}
      <section
        style={{
          background: "#1E1B4B",
          backgroundImage: `
            linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%),
            repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%)
          `,
          backgroundSize: "100% 100%, 48px 48px",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col gap-8">
          <div className="flex flex-col gap-5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-3 py-1 rounded-full tracking-wide uppercase">
                林口 · Linkou · New Taipei
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Chess Lessons<br />
              <span style={{ color: "#818CF8" }}>Kids Actually Love.</span>
            </h1>
            <p className="text-indigo-200 text-base sm:text-lg leading-relaxed max-w-lg">
              Small groups, expert coaches, and a rewards system that keeps kids motivated — every session earns XP and gems on the Artecks platform.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <a
                href="/sessions"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-black px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                Browse Sessions <ArrowRight size={15} />
              </a>
              {plan && (
                <HomeSubscribeButton planId={plan.id} />
              )}
            </div>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "♟", label: "Expert Coaches" },
              { icon: "👶", label: "Ages 5 and up" },
              { icon: "👥", label: "Small Groups" },
              { icon: "⭐", label: "XP & Gem Rewards" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">

        {/* ── How it works ── */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900">How it works</h2>
            <p className="text-sm text-gray-500 mt-1">Three steps from curious to playing</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: "🗓️",
                title: "Pick a session",
                desc: "Browse upcoming chess lessons and enrichment events. Filter by age group, date, or coach.",
              },
              {
                step: "02",
                icon: "✅",
                title: "Book your spot",
                desc: "Reserve with your name and contact info. Members get priority access and 20% off every session.",
              },
              {
                step: "03",
                icon: "⭐",
                title: "Show up & earn",
                desc: "Attend the session and your child earns XP and gems on the Artecks platform — automatically.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-3 relative overflow-hidden">
                <span className="absolute top-4 right-5 text-4xl font-black text-gray-100 select-none leading-none">{step}</span>
                <span className="text-2xl">{icon}</span>
                <p className="font-black text-gray-900 text-base">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Upcoming sessions ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Upcoming Sessions</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {upcoming.length > 0
                  ? `${upcoming.length} session${upcoming.length !== 1 ? "s" : ""} open to book`
                  : "Check back soon — new sessions added weekly"}
              </p>
            </div>
            {upcoming.length > 0 && (
              <a href="/sessions" className="hidden sm:flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                Calendar view <ChevronRight size={14} />
              </a>
            )}
          </div>

          {upcoming.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
              </div>
              <div className="mt-4 text-center">
                <a href="/sessions" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:underline">
                  See all sessions &amp; calendar <ChevronRight size={14} />
                </a>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 px-8 text-center flex flex-col items-center gap-4">
              <span className="text-5xl">♟</span>
              <div>
                <p className="text-base font-bold text-gray-600">No sessions open right now</p>
                <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                  New lessons and events are added every week. Subscribe to get notified when spots open up.
                </p>
              </div>
              {plan && (
                <div className="mt-2">
                  <HomeSubscribeButton planId={plan.id} />
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Membership ── */}
        {plan && (
          <section className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-yellow-300" />
                  <span className="text-xs font-black text-yellow-300 uppercase tracking-widest">Artecks Members</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Save {plan.discount_percent}% on<br />every session.
                </h3>
                <ul className="flex flex-col gap-1.5 text-sm text-indigo-200">
                  {[
                    "Priority booking — your spot is held first",
                    "Member-only events and workshops",
                    "Discount applied automatically at checkout",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-indigo-300 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                <HomeSubscribeButton planId={plan.id} />
                <p className="text-xs text-indigo-300">Cancel anytime · Stripe-secured</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Rewards ── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900">Built-in Rewards</h2>
            <p className="text-sm text-gray-500 mt-1">Every session earns your child currency on the Artecks platform</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "⭐",
                color: "bg-amber-50 border-amber-200",
                labelColor: "text-amber-700",
                title: "XP — Progress",
                desc: "Earned automatically every session. Tracks your child's journey and determines their Artecks level.",
              },
              {
                icon: "💎",
                color: "bg-violet-50 border-violet-200",
                labelColor: "text-violet-700",
                title: "Gems — Premium",
                desc: "Earned through milestones and class attendance. Spent on premium features across Artecks games.",
              },
              {
                icon: "🪙",
                color: "bg-yellow-50 border-yellow-200",
                labelColor: "text-yellow-700",
                title: "Coins — Everyday",
                desc: "The everyday in-game currency for chess, mini-games, and the Artecks ecosystem.",
              },
            ].map(({ icon, color, labelColor, title, desc }) => (
              <div key={title} className={`rounded-2xl border p-6 flex flex-col gap-3 ${color}`}>
                <span className="text-3xl">{icon}</span>
                <p className={`font-black text-sm ${labelColor}`}>{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Coaches ── */}
        {coaches.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">Meet the Coaches</h2>
              <p className="text-sm text-gray-500 mt-1">All coaches are trained and vetted by Artecks</p>
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
