// POST /api/report-seen/<bookingId> → Django /api/academy/bookings/<id>/report-seen/
// The signed-in parent opened a lesson report (counts toward the Progress Tracker badge).
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest, ctx: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await ctx.params;
  if (!/^\d+$/.test(bookingId)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ detail: "Not signed in." }, { status: 401 });
  try {
    const res = await fetch(`${BACKEND}/api/academy/bookings/${bookingId}/report-seen/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
