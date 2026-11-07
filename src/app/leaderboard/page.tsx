import type { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboard — Artecks Academy",
  description: "Linkou young chess players ranked by XP, by age group.",
};

export default function Page() {
  return <LeaderboardClient />;
}
