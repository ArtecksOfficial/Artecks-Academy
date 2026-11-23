// POST /api/auth/me/birth-year → Django /api/auth/me/birth-year/ (saved once; only adults can pay)
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/auth/me/birth-year/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
      body: await req.text(),
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
