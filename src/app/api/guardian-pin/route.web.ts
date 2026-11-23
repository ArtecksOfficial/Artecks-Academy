// /api/guardian-pin → Django /api/academy/guardian-pin/  (guardian's JWT forwarded)
// GET: {has_pin, locked_until}.  POST: {pin, current_pin? | password?} sets or changes the PIN.
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

async function forward(req: NextRequest, method: "GET" | "POST") {
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/academy/guardian-pin/`, {
      method,
      headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
      body: method === "POST" ? await req.text() : undefined,
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}

export const GET = (req: NextRequest) => forward(req, "GET");
export const POST = (req: NextRequest) => forward(req, "POST");
