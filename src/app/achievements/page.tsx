import type { Metadata } from "next";
import AchievementsClient from "./AchievementsClient";
import XpRulesClient from "./XpRulesClient";
import { ACHIEVEMENTS_ENABLED } from "@/lib/achievements-flag";

export const metadata: Metadata = {
  title: ACHIEVEMENTS_ENABLED ? "Family achievements — Artecks Academy" : "How XP works — Artecks Academy",
};

// Parent achievements are paused for now; this page explains the kids' XP rules instead.
export default function Page() {
  return ACHIEVEMENTS_ENABLED ? <AchievementsClient /> : <XpRulesClient />;
}
