// POST /api/slots/book → Django /api/academy/slots/book/
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const fwd = req.headers.get("x-forwarded-for");
    const res = await fetch(`${BACKEND}/api/academy/slots/book/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(fwd ? { "X-Forwarded-For": fwd } : {}) },
      body: await req.text(),
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
