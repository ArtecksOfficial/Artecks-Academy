// GET /api/leaderboard?period=month|all → Django /api/academy/leaderboard/
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") === "all" ? "all" : "month";
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/academy/leaderboard/?period=${period}`, {
      headers: auth ? { Authorization: auth } : {},
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
