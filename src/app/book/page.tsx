// ─── /book — pick a 60-minute lesson slot (merged across coaches) ────────────
import type { Metadata } from "next";
import BookPage from "./BookPage";

export const metadata: Metadata = {
  title: "Book a lesson · Artecks Academy",
  description: "Pick a time for an English-taught 1-on-1 chess lesson. We assign the right coach.",
};

export default function Page() {
  return <BookPage />;
}
