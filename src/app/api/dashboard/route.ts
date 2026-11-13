// GET /api/dashboard → Django /api/academy/dashboard/  (parent's JWT forwarded)
// Each child's progress for the family dashboard.
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/academy/dashboard/`, {
      headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
