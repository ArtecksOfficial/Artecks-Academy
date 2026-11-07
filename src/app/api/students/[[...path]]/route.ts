// /api/students[/<id>] → Django /api/academy/students/[<id>/]  (parent's JWT forwarded)
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
type Ctx = { params: Promise<{ path?: string[] }> };

async function forward(req: NextRequest, ctx: Ctx, method: string) {
  const sub = ((await ctx.params).path ?? []).join("/");
  if (!/^(|\d+)$/.test(sub)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  if ((method === "PATCH" || method === "DELETE") && !sub) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/academy/students/${sub ? sub + "/" : ""}`, {
      method,
      headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
      body: method === "POST" || method === "PATCH" ? await req.text() : undefined,
      cache: "no-store",
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}

export const GET = (req: NextRequest, ctx: Ctx) => forward(req, ctx, "GET");
export const POST = (req: NextRequest, ctx: Ctx) => forward(req, ctx, "POST");
export const PATCH = (req: NextRequest, ctx: Ctx) => forward(req, ctx, "PATCH");
export const DELETE = (req: NextRequest, ctx: Ctx) => forward(req, ctx, "DELETE");
