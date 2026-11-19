import type { Metadata } from "next";
import { fetchCoaches } from "@/lib/api";
import CoachesClient from "./CoachesClient";

export const metadata: Metadata = {
  title: "Coaches & programs — Artecks Academy",
  description: "English-speaking chess coaches in Linkou and Taipei: 1-on-1, paired and small-group lessons for grades 1–9.",
};

export default async function Page() {
  const coaches = await fetchCoaches();
  return <CoachesClient coaches={coaches} />;
}
