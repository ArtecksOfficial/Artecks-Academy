// GET  /api/memberships/check?provider_slug=&phone=|account_id=
//        → Django /api/academy/memberships/check/
// POST /api/memberships/check {account_id}  (legacy, no provider context)
//        → Django /api/academy/check-membership/
// Replaces the checkMembership / lookupMembershipByPhone Server Actions.
import { NextRequest } from "next/server";
import { ACADEMY, forward } from "@/lib/proxy";

const ALLOWED_PARAMS = ["provider_id", "provider_slug", "email", "phone", "account_id"];

export async function GET(req: NextRequest) {
  const qs = new URLSearchParams();
  for (const k of ALLOWED_PARAMS) {
    const v = req.nextUrl.searchParams.get(k);
    if (v) qs.set(k, v);
  }
  return forward(`${ACADEMY}/memberships/check/?${qs.toString()}`);
}

export async function POST(req: NextRequest) {
  return forward(`${ACADEMY}/check-membership/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
}
