"use client";
// iOS build: /session/?id=123 (web: /session/123 via [id]/page.web.tsx).
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SessionView from "./[id]/SessionView";
import PageStatus from "@/components/PageStatus";
import { useApiJson } from "@/lib/use-api";
import type { AcademySession } from "@/lib/types";

function SessionLoader() {
  const id = useSearchParams().get("id") ?? "";
  const valid = /^\d+$/.test(id);
  const { data, error, loading } = useApiJson<AcademySession>(valid ? `/api/sessions/${id}` : null);
  if (loading) return <PageStatus kind="loading" />;
  if (!data) return <PageStatus kind={error ? "error" : "notfound"} />;
  return <SessionView session={data} />;
}

export default function SessionPage() {
  return (
    <Suspense fallback={<PageStatus kind="loading" />}>
      <SessionLoader />
    </Suspense>
  );
}
