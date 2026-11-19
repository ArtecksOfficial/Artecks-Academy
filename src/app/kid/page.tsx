import type { Metadata } from "next";
import KidLoginClient from "./KidLoginClient";

export const metadata: Metadata = { title: "Kids: log in to play chess — Artecks Academy" };

export default function Page() {
  return <KidLoginClient />;
}
