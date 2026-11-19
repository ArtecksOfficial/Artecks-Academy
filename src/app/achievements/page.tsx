import type { Metadata } from "next";
import AchievementsClient from "./AchievementsClient";

export const metadata: Metadata = { title: "Family achievements — Artecks Academy" };

export default function Page() {
  return <AchievementsClient />;
}
