// ─── Post-Class Parent Digital Report Card ────────────────────────────────────
// Server Component: fetches data, hands off to <ReportCard /> client component
// so the language toggle works without sacrificing server-side data fetching.

import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import type { Session, LessonReport } from "@/lib/types";
import ReportCard from "./ReportCard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

type SessionSnippet = Pick<Session, "title" | "topic" | "start_time" | "end_time" | "location_name">;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bookingId } = await params;
  const supabase = createServerClient();

  const { data } = await supabase
    .from("bookings")
    .select("student_name, sessions(title)")
    .eq("id", bookingId)
    .single();

  if (!data) return { title: "學習報告 — Artecks Academy" };

  const raw = data as typeof data & { sessions: { title: string } | { title: string }[] | null };
  const sessionTitle = Array.isArray(raw.sessions)
    ? raw.sessions[0]?.title
    : raw.sessions?.title ?? null;

  return {
    title: `${data.student_name} 的學習報告 — Artecks Academy`,
    description: sessionTitle ?? "Artecks Academy 課堂報告",
    openGraph: {
      title: `${data.student_name} 的學習報告`,
      description: sessionTitle ?? undefined,
      siteName: "Artecks Academy",
    },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { bookingId } = await params;
  const supabase = createServerClient();

  const { data: raw, error } = await supabase
    .from("bookings")
    .select(`
      *,
      sessions (
        title,
        topic,
        start_time,
        end_time,
        location_name
      ),
      lesson_reports (*)
    `)
    .eq("id", bookingId)
    .single();

  if (error || !raw) {
    notFound();
  }

  const booking = raw as typeof raw & {
    sessions: SessionSnippet | SessionSnippet[] | null;
    lesson_reports: LessonReport | LessonReport[] | null;
  };

  const session = Array.isArray(booking.sessions)
    ? booking.sessions[0] ?? null
    : booking.sessions;

  const report = Array.isArray(booking.lesson_reports)
    ? booking.lesson_reports[0] ?? null
    : booking.lesson_reports;

  return (
    <ReportCard
      bookingId={bookingId}
      studentName={booking.student_name}
      attended={booking.attended}
      rewardsCredited={booking.rewards_credited}
      artecksAccountId={booking.artecks_account_id ?? null}
      session={session ?? null}
      report={
        report
          ? {
              skill_tags: report.skill_tags,
              coach_notes: report.coach_notes,
              generated_summary: report.generated_summary ?? null,
              xp_awarded: report.xp_awarded ?? null,
              coins_awarded: report.coins_awarded ?? null,
            }
          : null
      }
    />
  );
}
