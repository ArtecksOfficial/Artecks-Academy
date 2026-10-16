/**
 * ECPay OrderResultURL target.
 *
 * ECPay sends the parent's browser here (form POST) after checkout. We never
 * trust the posted fields — just forward to the result page, which asks Django
 * for the payment status recorded by ECPay's server-to-server callback.
 */
import { NextRequest, NextResponse } from "next/server";

function redirectToResult(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("booking_id") ?? "";
  const safeId = /^\d+$/.test(bookingId) ? bookingId : "";
  const url = new URL(`/payment/result${safeId ? `?booking_id=${safeId}` : ""}`, req.nextUrl.origin);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  return redirectToResult(req);
}

export async function GET(req: NextRequest) {
  return redirectToResult(req);
}
