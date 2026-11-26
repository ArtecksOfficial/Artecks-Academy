// ─── /coaches/<slug> — a teacher's own page ──────────────────────────────────
// Server Component. Profile, open times and what parents can book come from
// Django (cached 60 s); old number links (/coaches/4) redirect to the name link.
// The iOS build uses coach-profile/page.ios.tsx instead.

import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { fetchSessions } from "@/lib/api";
import type { CoachPageData } from "@/lib/coach-page";
import CoachProfileView from "./CoachProfileView";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchCoachPage(key: string): Promise<CoachPageData | null> {
  if (!/^[a-z0-9-]{1,80}$/i.test(key)) return null;
  try {
    const r = await fetch(`${BACKEND}/api/academy/coaches/${key.toLowerCase()}/`, { next: { revalidate: 60 } } as RequestInit);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const d = await fetchCoachPage((await params).slug);
  if (!d) return { title: "Coach not found — Artecks Academy" };
  const c = d.coach;
  const desc = c.bio?.slice(0, 160) || [c.title, c.subjects].filter(Boolean).join(" · ");
  return {
    title: `${c.name} — Artecks Academy`,
    description: desc || undefined,
    openGraph: { title: c.name, description: desc || undefined, images: c.photo_url ? [c.photo_url] : undefined },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchCoachPage(slug);
  if (!data) notFound();
  if (data.coach.slug && data.coach.slug !== slug) permanentRedirect(`/coaches/${data.coach.slug}`);
  const now = Date.now();
  const sessions = (await fetchSessions())
    .filter((s) => s.coach?.id === data.coach.id && new Date(s.start_time).getTime() > now)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 6);
  return <CoachProfileView data={data} sessions={sessions} />;
}
