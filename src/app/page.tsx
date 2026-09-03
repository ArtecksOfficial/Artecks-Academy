// ─── Artecks Academy — Marketplace Page ──────────────────────────────────────
// Server Component: fetches sessions from Django, hands off to client UI.

import { fetchSessions } from "@/lib/api";
import SessionMarketplace from "./SessionMarketplace";

export default async function Page() {
  const sessions = await fetchSessions();
  return <SessionMarketplace sessions={sessions} />;
}
