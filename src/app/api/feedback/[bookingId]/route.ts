// /api/feedback/[bookingId] → Django /api/academy/bookings/<id>/feedback/
// Forwards the parent's JWT if they're logged in (so gems land at once).
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
type Ctx = { params: Promise<{ bookingId: string }> };

async function proxy(req: NextRequest, ctx: Ctx, suffix = "") {
  const { bookingId } = await ctx.params;
  if (!/^\d+$/.test(bookingId)) return NextResponse.json({ detail: "Invalid booking." }, { status: 400 });
  const auth = req.headers.get("authorization");
  const url = `${BACKEND}/api/academy/bookings/${bookingId}/feedback/${suffix}${req.method === "GET" ? req.nextUrl.search : ""}`;
  try {
    const res = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
      body: req.method === "GET" ? undefined : await req.text(),
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}

export const GET = (req: NextRequest, ctx: Ctx) => proxy(req, ctx);
export const POST = (req: NextRequest, ctx: Ctx) => proxy(req, ctx);

