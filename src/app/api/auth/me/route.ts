// GET /api/auth/me            the signed-in user
// PATCH /api/auth/me          update first_name / last_name (settings page)
// Proxies to Django /api/auth/me/ with Bearer token — keeps backend URL server-side.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization) {
    return NextResponse.json({ detail: "No token provided" }, { status: 401 });
  }
  try {
    const res = await fetch(`${BACKEND}/api/auth/me/`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest) {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization) {
    return NextResponse.json({ detail: "No token provided" }, { status: 401 });
  }
  try {
    // Only the name can be changed from this site; every other field is dropped here.
    const body = await req.json().catch(() => ({}));
    const patch: Record<string, string> = {};
    if (typeof body.first_name === "string") patch.first_name = body.first_name.trim().slice(0, 150);
    if (typeof body.last_name === "string") patch.last_name = body.last_name.trim().slice(0, 150);
    const res = await fetch(`${BACKEND}/api/auth/me/`, {
      method: "PATCH",
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
