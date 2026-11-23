// GET /api/my-bookings[?phone=<phone>&student=<child name>]
// Proxies to Django /api/academy/bookings/mine/ — keeps the backend URL server-side.
// Signed in (Authorization header) and no phone: that account's own bookings.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone") ?? "";
  const student = req.nextUrl.searchParams.get("student") ?? "";
  const auth = req.headers.get("authorization");
  if (!phone && !auth) {
    return NextResponse.json({ detail: "phone required" }, { status: 400 });
  }

  const res = await fetch(
    `${BACKEND}/api/academy/bookings/mine/${phone ? `?phone=${encodeURIComponent(phone)}&student=${encodeURIComponent(student)}` : ""}`,
    { cache: "no-store", headers: !phone && auth ? { Authorization: auth } : {} }
  );

  if (!res.ok) {
    return NextResponse.json({ detail: "upstream error" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
