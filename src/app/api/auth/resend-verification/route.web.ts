// POST /api/auth/resend-verification { email } — sends a new link that opens the Academy.
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const res = await fetch(`${BACKEND}/api/auth/send-verification-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "academy" }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
