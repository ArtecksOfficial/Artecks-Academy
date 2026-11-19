// ─── Artecks Academy — Home / Landing Page ───────────────────────────────────
// Server Component: fetches data, delegates all rendering to HomePageContent.

import { fetchSessions, fetchProviderPlans } from "@/lib/api";
import HomePageContent from "@/app/components/HomePageContent";

export default async function HomePage() {
  const [sessions, provider] = await Promise.all([
    fetchSessions(),
    fetchProviderPlans("issac"),
  ]);

  return <HomePageContent sessions={sessions} provider={provider} />;
}
