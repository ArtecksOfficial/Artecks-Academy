// ─── Post-Class Parent Digital Report Card ────────────────────────────────────
// Server Component: fetches booking report from Django API, hands off to
// <ReportCard /> client component so the language toggle works.

import { notFound } from "next/navigation";
import { fetchBookingReport } from "@/lib/api";
import ReportCard from "./ReportCard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bookingId } = await params;
  const report = await fetchBookingReport(bookingId);

  if (!report) return { title: "學習報告 — Artecks Academy" };

  return {
    title: `${report.parent_name} 的學習報告 — Artecks Academy`,
    description: report.session_title ?? "Artecks Academy 課堂報告",
    openGraph: {
      title: `${report.parent_name} 的學習報告`,
      description: report.session_title ?? undefined,
      siteName: "Artecks Academy",
    },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { bookingId } = await params;
  const report = await fetchBookingReport(bookingId);

  if (!report) {
    notFound();
  }

  return (
    <ReportCard
      bookingId={bookingId}
      studentName={report.student_name}
      attended={report.attended ?? report.status === "attended"}
      rewardsCredited={report.rewards_credited ?? (report.xp_awarded > 0 || report.coins_awarded > 0)}
      artecksAccountId={report.artecks_account_id ?? null}
      session={
        report.session_title
          ? {
              title: report.session_title,
              topic: null,
              start_time: report.session_start,
              location_name: report.location_name,
            }
          : null
      }
      report={
        report.attended || report.status === "attended"
          ? {
              skill_tags: report.skill_tags ?? [],
              coach_notes: report.coach_notes ?? null,
              generated_summary: report.generated_summary ?? null,
              xp_awarded: report.xp_awarded ?? null,
              coins_awarded: report.coins_awarded ?? null,
            }
          : null
      }
    />
  );
}
