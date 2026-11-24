// GET /api/auth/verify-email?uid=…&token=… — proxies Django's email verification.
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";
  try {
    const res = await fetch(
      `${BACKEND}/api/auth/verify-email/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
