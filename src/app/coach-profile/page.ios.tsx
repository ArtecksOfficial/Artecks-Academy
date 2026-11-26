"use client";
// iOS build: /coach-profile/?id=<slug> (web: /coaches/<slug> via coaches/[slug]/page.web.tsx).
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CoachProfileView from "../coaches/[slug]/CoachProfileView";
import PageStatus from "@/components/PageStatus";
import { useApiJson } from "@/lib/use-api";
import type { CoachPageData } from "@/lib/coach-page";
import type { AcademySession } from "@/lib/types";

function CoachLoader() {
  const key = useSearchParams().get("id") ?? "";
  const valid = /^[a-z0-9-]{1,80}$/i.test(key);
  const page = useApiJson<CoachPageData>(valid ? `/api/coaches/${encodeURIComponent(key)}` : null);
  const sessions = useApiJson<AcademySession[]>("/api/sessions");
  if (page.loading) return <PageStatus kind="loading" />;
  if (!page.data?.coach) return <PageStatus kind={page.error ? "error" : "notfound"} />;
  const coachId = page.data.coach.id;
  const now = Date.now();
  const upcoming = (Array.isArray(sessions.data) ? sessions.data : [])
    .filter((s) => s.coach?.id === coachId && new Date(s.start_time).getTime() > now)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 6);
  return <CoachProfileView data={page.data} sessions={upcoming} />;
}

export default function CoachProfilePage() {
  return (
    <Suspense fallback={<PageStatus kind="loading" />}>
      <CoachLoader />
    </Suspense>
  );
}
