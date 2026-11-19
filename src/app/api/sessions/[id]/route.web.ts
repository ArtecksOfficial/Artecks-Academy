// GET /api/sessions/:id → Django /api/academy/sessions/:id/
import { NextRequest, NextResponse } from "next/server";
import { ACADEMY, forward } from "@/lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  return forward(`${ACADEMY}/sessions/${id}/`);
}
