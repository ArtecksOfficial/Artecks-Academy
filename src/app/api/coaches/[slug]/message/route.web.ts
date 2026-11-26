// POST /api/coaches/<slug>/message → Django /api/academy/coaches/<slug>/message/
import { NextRequest, NextResponse } from "next/server";
import { ACADEMY, forward } from "@/lib/proxy";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,80}$/i.test(slug)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const fwd = req.headers.get("x-forwarded-for");
  return forward(`${ACADEMY}/coaches/${slug}/message/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(fwd ? { "X-Forwarded-For": fwd } : {}) },
    body: await req.text(),
  });
}
