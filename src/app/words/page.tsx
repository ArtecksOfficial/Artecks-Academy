import type { Metadata } from "next";
import WordsClient from "./WordsClient";

export const metadata: Metadata = { title: "English words — Artecks Academy" };

export default function Page() {
  return <WordsClient />;
}
