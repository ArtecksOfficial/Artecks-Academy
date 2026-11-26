"use client";
// iOS build: /coach-profile/?id=4 (web: /coaches/4 via coaches/[id]/page.web.tsx).
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CoachProfileView from "../coaches/[id]/CoachProfileView";
import PageStatus from "@/components/PageStatus";
import { useApiJson } from "@/lib/use-api";
import { bookableSubjectFor } from "@/lib/subjects";
import type { AcademySession, Coach } from "@/lib/types";

function CoachLoader() {
  const id = useSearchParams().get("id") ?? "";
  const coaches = useApiJson<Omit<Coach, "line_id">[]>("/api/coaches");
  const sessions = useApiJson<AcademySession[]>("/api/sessions");
  const subjects = useApiJson<{ key: string }[]>("/api/slots?subjects=1");
  if (coaches.loading) return <PageStatus kind="loading" />;
  const coach = (coaches.data ?? []).find((c) => String(c.id) === id);
  if (!coach) return <PageStatus kind={coaches.error ? "error" : "notfound"} />;
  const now = Date.now();
  const upcoming = (Array.isArray(sessions.data) ? sessions.data : [])
    .filter((s) => s.coach?.id === coach.id && new Date(s.start_time).getTime() > now)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 6);
  const bookable = Array.isArray(subjects.data) ? subjects.data.map((s) => s.key) : [];
  return <CoachProfileView coach={coach} sessions={upcoming} bookSubject={bookableSubjectFor(coach.subjects, bookable)} />;
}

export default function CoachProfilePage() {
  return (
    <Suspense fallback={<PageStatus kind="loading" />}>
      <CoachLoader />
    </Suspense>
  );
}
