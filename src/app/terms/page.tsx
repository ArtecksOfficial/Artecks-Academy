import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "@/app/components/LegalPage";
import { LEGAL_PUBLISHED } from "@/lib/legal/operator";

export const metadata: Metadata = { title: "Terms of Service · Artecks Academy" };

export default function Page() {
  // Hidden until the owner has reviewed the text and switched LEGAL_PUBLISHED on.
  if (!LEGAL_PUBLISHED) notFound();
  return <LegalPage slug="terms" />;
}
