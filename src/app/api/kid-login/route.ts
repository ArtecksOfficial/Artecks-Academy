// POST /api/kid-login → Django /api/academy/kid-login/  (public: a child signs in with the login their parent made)
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/api/academy/kid-login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("x-forwarded-for") ? { "X-Forwarded-For": req.headers.get("x-forwarded-for")! } : {}),
      },
      body: await req.text(),
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
