// GET /api/providers/:slug/plans → Django /api/academy/providers/:slug/plans/
import { NextRequest, NextResponse } from "next/server";
import { ACADEMY, forward } from "@/lib/proxy";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!/^[\w-]+$/.test(slug)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  return forward(`${ACADEMY}/providers/${slug}/plans/`);
}
