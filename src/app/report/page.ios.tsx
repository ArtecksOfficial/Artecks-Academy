"use client";
// iOS build: /report/?id=123 (web: /report/123 via [bookingId]/page.web.tsx).
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReportCard from "./[bookingId]/ReportCard";
import { toReportCardProps } from "./[bookingId]/report-props";
import PageStatus from "@/components/PageStatus";
import { useApiJson } from "@/lib/use-api";
import type { BookingReport } from "@/lib/types";

function ReportLoader() {
  const id = useSearchParams().get("id") ?? "";
  const valid = /^\d+$/.test(id);
  const { data, error, loading } = useApiJson<BookingReport>(valid ? `/api/bookings/${id}/report` : null);
  if (loading) return <PageStatus kind="loading" />;
  if (!data) return <PageStatus kind={error ? "error" : "notfound"} />;
  return <ReportCard {...toReportCardProps(id, data)} />;
}

export default function ReportPage() {
  return (
    <Suspense fallback={<PageStatus kind="loading" />}>
      <ReportLoader />
    </Suspense>
  );
}
