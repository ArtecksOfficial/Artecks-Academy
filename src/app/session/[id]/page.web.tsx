// ─── Public Session Landing Page ──────────────────────────────────────────────
// Server Component. Fetches session from Django API, then renders the static
// shell via <SessionView />. The iOS build uses ../page.ios.tsx instead.

import { notFound } from "next/navigation";
import { fetchSession } from "@/lib/api";
import SessionView from "./SessionView";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await fetchSession(id).catch(() => null);
  if (!session) return { title: "Session Not Found" };
  const desc = [
    session.coach?.name,
    session.location_name,
    session.price_twd ? `NT$${session.price_twd.toLocaleString()}` : null,
  ].filter(Boolean).join(' · ')
  return {
    title: `${session.title} | Artecks Academy`,
    description: session.topic ?? desc ?? undefined,
    openGraph: {
      title: session.title,
      description: desc || session.topic || undefined,
      images: [`/session/${id}/opengraph-image`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: session.title,
      description: desc || session.topic || undefined,
      images: [`/session/${id}/opengraph-image`],
    },
  };
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await fetchSession(id).catch(() => null);
  if (!session) notFound();
  return <SessionView session={session} />;
}
