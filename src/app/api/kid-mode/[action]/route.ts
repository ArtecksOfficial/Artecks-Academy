// /api/kid-mode/<enter|exit|me> → Django /api/academy/kid-mode/<action>/
//   enter  POST {student_id, refresh?} → Kid Mode tokens
//   exit   POST {pin, refresh?}        → guardian tokens
//   me     GET                         → who is playing
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
type Ctx = { params: Promise<{ action: string }> };

async function forward(req: NextRequest, ctx: Ctx, method: "GET" | "POST") {
  const { action } = await ctx.params;
  const ok = method === "GET" ? action === "me" : action === "enter" || action === "exit";
  if (!ok) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/academy/kid-mode/${action}/`, {
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
