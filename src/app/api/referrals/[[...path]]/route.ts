// /api/referrals/check?ref=CODE  and  /api/referrals/mine?ref=CODE  → Django /api/academy/referrals/...
// "mine" forwards the parent's JWT; "check" is public.
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
const ALLOWED = /^(check|mine)$/;

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const sub = ((await ctx.params).path ?? []).join("/");
  if (!ALLOWED.test(sub)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const ref = (req.nextUrl.searchParams.get("ref") ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
  const auth = sub === "mine" ? req.headers.get("authorization") : null;
  try {
    const res = await fetch(`${BACKEND}/api/academy/referrals/${sub}/${ref ? `?ref=${ref}` : ""}`, {
      headers: auth ? { Authorization: auth } : {},
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
