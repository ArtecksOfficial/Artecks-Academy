// ─── /api/subscribe — Next.js route handler ───────────────────────────────────
// Proxies subscription checkout requests to Django.
// Client-side code POSTs here to avoid exposing the backend URL.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(
      `${BACKEND}/api/academy/subscriptions/checkout/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[subscribe] proxy error", err);
    return NextResponse.json(
      { error: "Failed to create subscription checkout" },
      { status: 500 }
    );
  }
}
