// GET /api/coaches/<slug> → Django /api/academy/coaches/<slug>/  (public; used by the iOS bundle)
import { NextResponse } from "next/server";
import { ACADEMY, forward } from "@/lib/proxy";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,80}$/i.test(slug)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  return forward(`${ACADEMY}/coaches/${slug}/`);
}
