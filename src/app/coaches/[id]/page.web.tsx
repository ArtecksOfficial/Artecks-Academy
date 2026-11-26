// ─── /coaches/[id] — a teacher's own page ────────────────────────────────────
// Server Component: the public coach list and upcoming classes come from Django
// (cached 60 s). Web only; the iOS build keeps coach cards unlinked.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCoaches, fetchSessions } from "@/lib/api";
import CoachProfileView from "./CoachProfileView";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function findCoach(id: string) {
  if (!/^\d+$/.test(id)) return null;
  const coaches = await fetchCoaches();
  return coaches.find((c) => String(c.id) === id) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const coach = await findCoach((await params).id);
  if (!coach) return { title: "Coach not found — Artecks Academy" };
  const desc = coach.bio?.slice(0, 160) || [coach.title, coach.subjects].filter(Boolean).join(" · ");
  return {
    title: `${coach.name} — Artecks Academy`,
    description: desc || undefined,
    openGraph: { title: coach.name, description: desc || undefined, images: coach.photo_url ? [coach.photo_url] : undefined },
  };
}

export default async function Page({ params }: PageProps) {
  const coach = await findCoach((await params).id);
  if (!coach) notFound();
  const now = Date.now();
  const sessions = (await fetchSessions())
    .filter((s) => s.coach?.id === coach.id && new Date(s.start_time).getTime() > now)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 6);
  return <CoachProfileView coach={coach} sessions={sessions} />;
}
