// GET /api/auth/line → Django /api/auth/line/ (is this account's LINE linked, and a friend of the OA?)
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ linked: false }, { status: 401 });
  try {
    const res = await fetch(`${BACKEND}/api/auth/line/`, { headers: { Authorization: auth }, cache: "no-store" });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
