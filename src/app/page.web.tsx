// ─── Artecks Academy — Home / Landing Page ───────────────────────────────────
// Server Component: fetches data, delegates all rendering to HomePageContent.

import { fetchSessions, fetchProviderPlans } from "@/lib/api";
import HomePageContent from "@/app/components/HomePageContent";
import SignedInHomeRedirect from "@/app/components/SignedInHomeRedirect";

export default async function HomePage() {
  const [sessions, provider] = await Promise.all([
    fetchSessions(),
    fetchProviderPlans("issac"),
  ]);

  return (
    <>
      <SignedInHomeRedirect />
      <HomePageContent sessions={sessions} provider={provider} />
    </>
  );
}
