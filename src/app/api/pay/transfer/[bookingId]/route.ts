// POST /api/pay/transfer/[bookingId] → Django transfer-notice
// Parent reports "I paid by bank transfer" with the last 5 digits.
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  if (!/^\d+$/.test(bookingId)) return NextResponse.json({ detail: "Invalid booking." }, { status: 400 });
  try {
    const res = await fetch(`${BACKEND}/api/academy/bookings/${bookingId}/transfer-notice/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
