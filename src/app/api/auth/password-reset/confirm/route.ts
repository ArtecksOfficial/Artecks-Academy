// POST /api/auth/password-reset/confirm  { uid, token, new_password }
// Proxies to Django /api/auth/reset-password-confirm/.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  let body: { uid?: unknown; token?: unknown; new_password?: unknown } = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const { uid, token, new_password } = body;
  if (typeof uid !== "string" || typeof token !== "string" || typeof new_password !== "string" || !uid || !token || !new_password) {
    return NextResponse.json({ detail: "Invalid reset link." }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND}/api/auth/reset-password-confirm/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token, new_password }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
