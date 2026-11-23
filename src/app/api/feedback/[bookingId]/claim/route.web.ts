// POST /api/feedback/[bookingId]/claim → collect feedback gems after logging in
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  if (!/^\d+$/.test(bookingId)) return NextResponse.json({ detail: "Invalid booking." }, { status: 400 });
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ detail: "Not logged in." }, { status: 401 });
  try {
    const res = await fetch(`${BACKEND}/api/academy/bookings/${bookingId}/feedback/claim/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: await req.text(),
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
