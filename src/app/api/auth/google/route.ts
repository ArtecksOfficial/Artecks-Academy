// POST /api/auth/google → Django /api/auth/google/ ({access_token} from the Google popup)
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/api/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
      cache: "no-store",
    });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
