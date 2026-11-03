// ─── /coach — coach dashboard (own sessions, students, availability) ─────────
import type { Metadata } from "next";
import CoachDashboard from "./CoachDashboard";

export const metadata: Metadata = {
  title: "Coach dashboard · Artecks Academy",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CoachDashboard />;
}
