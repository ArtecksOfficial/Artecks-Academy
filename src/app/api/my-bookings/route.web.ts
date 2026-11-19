// GET /api/my-bookings?phone=<phone>
// Proxies to Django /api/academy/bookings/mine/ — keeps the backend URL server-side.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone") ?? "";
  if (!phone) {
    return NextResponse.json({ detail: "phone required" }, { status: 400 });
  }

  const res = await fetch(
    `${BACKEND}/api/academy/bookings/mine/?phone=${encodeURIComponent(phone)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json({ detail: "upstream error" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
