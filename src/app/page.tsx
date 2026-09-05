// ─── Artecks Academy — Marketplace Page ──────────────────────────────────────
// Server Component: fetches sessions from Django, hands off to client UI.

import { fetchSessions, fetchProviderPlans } from "@/lib/api";
import SessionMarketplace from "./SessionMarketplace";

export default async function Page() {
  const [sessions, provider] = await Promise.all([
    fetchSessions(),
    fetchProviderPlans("issac"),
  ]);
  return <SessionMarketplace sessions={sessions} provider={provider} />;
}
