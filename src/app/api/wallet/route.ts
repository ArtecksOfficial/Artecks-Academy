// GET /api/wallet?account_id=ACT-XXXX
// Proxies to Django /api/wallet/me/ — keeps backend URL server-side.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("account_id") ?? "";
  if (!accountId) {
    return NextResponse.json({ detail: "account_id required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${BACKEND}/api/wallet/me/?account_id=${encodeURIComponent(accountId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json({ detail: "upstream error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
