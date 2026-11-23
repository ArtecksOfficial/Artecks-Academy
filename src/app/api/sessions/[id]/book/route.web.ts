// POST /api/sessions/:id/book → Django /api/academy/sessions/:id/book/
// Replaces the bookSession Server Action.
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ACADEMY, forward } from "@/lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  const res = await forward(`${ACADEMY}/sessions/${id}/book/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  if (res.ok) revalidatePath(`/session/${id}`);
  return res;
}
