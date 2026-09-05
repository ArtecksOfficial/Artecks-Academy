// GET /api/wallet
// Proxies to Django /api/wallet/me/ using the caller's JWT token.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization) {
    return NextResponse.json({ detail: "No token provided" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND}/api/wallet/me/`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ detail: "upstream error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
