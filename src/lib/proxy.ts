// ─── Server-only helper for /api/* route handlers ────────────────────────────
// Forwards a request to the Django backend and relays status + body.

import { NextResponse } from "next/server";

export const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
export const ACADEMY = `${BACKEND}/api/academy`;

export async function forward(url: string, init: RequestInit = {}): Promise<NextResponse> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return new NextResponse(await res.text(), {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
