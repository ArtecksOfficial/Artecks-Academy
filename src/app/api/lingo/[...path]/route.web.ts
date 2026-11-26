// /api/lingo/* → Django /api/lingo/* (Artecks Lingo word banks), for the routes Academy uses:
// the family's word counts on the dashboard and coaches adding a lesson's words.
import { NextRequest, NextResponse } from "next/server";
import { BACKEND, forward } from "@/lib/proxy";

const ALLOWED: { re: RegExp; methods: string[] }[] = [
  { re: /^me$/, methods: ["GET"] },
  { re: /^students\/\d+\/words$/, methods: ["POST"] },
];

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const joined = ((await ctx.params).path ?? []).join("/");
  if (!ALLOWED.some((a) => a.re.test(joined) && a.methods.includes(req.method))) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ detail: "Not logged in." }, { status: 401 });
  return forward(`${BACKEND}/api/lingo/${joined}/`, {
    method: req.method,
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: req.method === "GET" ? undefined : await req.text(),
  });
}

export const GET = proxy;
export const POST = proxy;
