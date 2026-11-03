// ─── /request — private lesson request (no slots, no payment) ────────────────
import type { Metadata } from "next";
import RequestPage from "./RequestPage";

export const metadata: Metadata = {
  title: "Request private lessons · Artecks Academy",
  description: "English-taught private chess lessons. Tell us when you're free and we'll arrange the right coach.",
};

export default function Page() {
  return <RequestPage />;
}
