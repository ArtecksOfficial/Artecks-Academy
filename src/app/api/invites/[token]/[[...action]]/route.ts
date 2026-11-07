// /api/invites/<token>[/claim] → Django /api/academy/invites/<token>/[claim/]
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
type Ctx = { params: Promise<{ token: string; action?: string[] }> };

async function forward(req: NextRequest, ctx: Ctx, method: string) {
  const { token, action } = await ctx.params;
  const sub = (action ?? []).join("/");
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(token) || !/^(|claim)$/.test(sub)) return NextResponse.json({ detail: "not_found" }, { status: 404 });
  if (method === "POST" && sub !== "claim") return NextResponse.json({ detail: "not_found" }, { status: 404 });
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/academy/invites/${token}/${sub ? sub + "/" : ""}`, {
      method,
      headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
      body: method === "POST" ? await req.text() : undefined,
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}

export const GET = (req: NextRequest, ctx: Ctx) => forward(req, ctx, "GET");
export const POST = (req: NextRequest, ctx: Ctx) => forward(req, ctx, "POST");
