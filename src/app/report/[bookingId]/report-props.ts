// Maps the Django booking report to <ReportCard /> props. Shared by the web
// page (page.web.tsx) and the iOS page (../page.ios.tsx).
import type { ComponentProps } from "react";
import type { BookingReport } from "@/lib/types";
import type ReportCard from "./ReportCard";

export function toReportCardProps(
  bookingId: string,
  report: BookingReport
): ComponentProps<typeof ReportCard> {
  return {
    bookingId,
    studentName: report.student_name,
    attended: report.attended ?? report.status === "attended",
    rewardsCredited: report.rewards_credited ?? (report.xp_awarded > 0 || report.coins_awarded > 0),
    artecksAccountId: report.artecks_account_id ?? null,
    session: report.session_title
      ? {
          title: report.session_title,
          topic: null,
          start_time: report.session_start,
          location_name: report.location_name,
        }
      : null,
    report:
      report.attended || report.status === "attended"
        ? {
            skill_tags: report.skill_tags ?? [],
            coach_notes: report.coach_notes ?? null,
            generated_summary: report.generated_summary ?? null,
            xp_awarded: report.xp_awarded ?? null,
            coins_awarded: report.coins_awarded ?? null,
          }
        : null,
  };
}
