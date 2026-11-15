// POST /api/auth/password-reset/request  { email }
// Proxies to Django /api/auth/request-password-reset/. Django always answers the
// same way whether or not the email exists, so this never reveals who has an account.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch { /* handled below */ }
  if (!email) return NextResponse.json({ detail: "Email is required." }, { status: 400 });

  try {
    const res = await fetch(`${BACKEND}/api/auth/request-password-reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // source tells Django which site the emailed link should open.
      body: JSON.stringify({ email, source: "academy" }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
