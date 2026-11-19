// GET /api/slots?subjects=1 → Django /api/academy/slots/subjects/
// GET /api/slots            → Django /api/academy/slots/areas/[?subject=...]
// GET /api/slots?area=...   → Django /api/academy/slots/?area=...&days=...&coach=...
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const area = q.get("area");
  const subject = q.get("subject");
  const subj = subject && /^[a-z]{2,20}$/.test(subject) ? subject : "";
  let url = `${BACKEND}/api/academy/slots/areas/${subj ? `?subject=${subj}` : ""}`;
  if (q.get("subjects")) url = `${BACKEND}/api/academy/slots/subjects/`;
  else if (area) {
    const p = new URLSearchParams({ area, days: q.get("days") ?? "14" });
    if (subj) p.set("subject", subj);
    const coach = q.get("coach");
    if (coach && /^\d+$/.test(coach)) p.set("coach", coach);
    url = `${BACKEND}/api/academy/slots/?${p.toString()}`;
  }
  try {
    const res = await fetch(url, { cache: "no-store" });
    return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }
}
