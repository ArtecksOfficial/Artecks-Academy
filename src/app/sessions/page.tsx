// ─── /sessions — full calendar booking flow ───────────────────────────────────
import { fetchSessions, fetchProviderPlans } from "@/lib/api";
import SessionMarketplace from "@/app/SessionMarketplace";

export default async function SessionsPage() {
  const [sessions, provider] = await Promise.all([
    fetchSessions(),
    fetchProviderPlans("issac"),
  ]);
  return <SessionMarketplace sessions={sessions} provider={provider} />;
}
