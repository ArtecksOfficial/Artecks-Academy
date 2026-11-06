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
  searchParams: Promise<{ t?: string }>;
}) {
  const { bookingId } = await params;
  const { t = "" } = await searchParams;
  return <FeedbackClient bookingId={bookingId} token={t} />;
}
