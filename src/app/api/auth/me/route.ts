// GET /api/auth/me
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
