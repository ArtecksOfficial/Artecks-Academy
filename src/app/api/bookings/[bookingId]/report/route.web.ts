// GET /api/bookings/:id/report → Django /api/academy/bookings/:id/report/
import { NextRequest, NextResponse } from "next/server";
import { ACADEMY, forward } from "@/lib/proxy";

type Ctx = { params: Promise<{ bookingId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { bookingId } = await ctx.params;
  if (!/^\d+$/.test(bookingId)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  return forward(`${ACADEMY}/bookings/${bookingId}/report/`);
}
