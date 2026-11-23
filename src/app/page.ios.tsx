"use client";
// iOS build: home page, fetched on the client. Web build uses page.web.tsx.
import HomePageContent from "@/app/components/HomePageContent";
import PageStatus from "@/components/PageStatus";
import { useApiJson } from "@/lib/use-api";
import type { AcademySession, Provider } from "@/lib/types";

export default function HomePage() {
  const sessions = useApiJson<AcademySession[]>("/api/sessions");
  const provider = useApiJson<Provider>("/api/providers/issac/plans");
  if (sessions.loading || provider.loading) return <PageStatus kind="loading" />;
  return <HomePageContent sessions={sessions.data ?? []} provider={provider.data} />;
}
