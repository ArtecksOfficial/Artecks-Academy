// /api/packages/... → Django /api/academy/packages/...  (forwards the parent's JWT)
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
const ALLOWED = /^(|mine|tracker|buy|\d+\/transfer-notice|\d+\/cancel)$/;

async function forward(req: NextRequest, path: string[] | undefined, method: "GET" | "POST") {
  const sub = (path ?? []).join("/");
  if (!ALLOWED.test(sub)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/academy/packages/${sub ? sub + "/" : ""}`, {
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

type Ctx = { params: Promise<{ path?: string[] }> };
export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path, "GET");
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path, "POST");
}
