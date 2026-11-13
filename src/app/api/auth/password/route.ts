// POST /api/auth/password → Django /api/auth/change-password/  {old_password, new_password}
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization) {
    return NextResponse.json({ detail: "No token provided" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${BACKEND}/api/auth/change-password/`, {
      method: "POST",
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify({ old_password: String(body.old_password ?? ""), new_password: String(body.new_password ?? "") }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "fetch failed" }, { status: 502 });
  }
}
