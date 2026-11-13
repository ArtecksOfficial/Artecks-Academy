// /api/coach/* → Django /api/academy/coach/*
// Forwards the coach's JWT. Only whitelisted path shapes are proxied so this
// can't be used to reach other backend endpoints.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

const ALLOWED = [
  /^me$/,
  /^sessions$/,
  /^sessions\/\d+$/,
  /^bookings\/\d+\/(attend|report)$/,
  /^availability$/,
  /^availability\/\d+$/,
  /^feedback$/,
  /^arena$/,
  /^packages$/,
  /^arena\/\d+\/results$/,
];

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const joined = (path ?? []).join("/");
  if (!ALLOWED.some((re) => re.test(joined))) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }

  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ detail: "Not logged in." }, { status: 401 });

  const search = req.nextUrl.search || "";
  const url = `${BACKEND}/api/academy/coach/${joined}/${search}`;
  const init: RequestInit = {
    method: req.method,
    headers: { Authorization: auth, "Content-Type": "application/json" },
    cache: "no-store",
  };
  if (req.method !== "GET" && req.method !== "DELETE") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(url, init);
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
