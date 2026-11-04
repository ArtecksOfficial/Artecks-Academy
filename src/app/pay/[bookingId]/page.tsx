// ─── /pay/[bookingId]?t=<token> — parent payment page ────────────────────────
// The owner sends this link on LINE after scheduling. Parents pay online
// (ECPay / LINE Pay) or by bank transfer and report the last 5 digits.
import type { Metadata } from "next";
import PayClient, { type PayInfo } from "./PayClient";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pay for your lesson · Artecks Academy",
  robots: { index: false, follow: false },
};

async function fetchPayInfo(id: string, t: string): Promise<PayInfo | null> {
  if (!/^\d+$/.test(id) || !t) return null;
  try {
    const res = await fetch(
      `${BACKEND}/api/academy/bookings/${id}/pay-info/?t=${encodeURIComponent(t)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as PayInfo;
  } catch {
    return null;
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { bookingId } = await params;
  const { t = "" } = await searchParams;
  const info = await fetchPayInfo(bookingId, t);
  return <PayClient info={info} token={t} />;
}
