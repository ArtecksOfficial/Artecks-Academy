// ─── /feedback/[bookingId]?t=<token> — parent feedback on a lesson ───────────
import type { Metadata } from "next";
import FeedbackClient from "./FeedbackClient";

export const metadata: Metadata = {
  title: "Lesson feedback · Artecks Academy",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ t?: string; stars?: string }>;
}) {
  const { bookingId } = await params;
  const { t = "", stars = "" } = await searchParams;
  const n = Number(stars);
  return <FeedbackClient bookingId={bookingId} token={t} initialStars={n >= 1 && n <= 5 ? n : 0} />;
}
