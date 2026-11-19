import type { Metadata } from "next";
import TeachClient from "./TeachClient";

export const metadata: Metadata = { title: "Teach with us — Artecks Academy" };

export default function Page() {
  return <TeachClient />;
}
