/**
 * GET /api/pay/linepay/[bookingId]
 *
 * Calls the Django LINE Pay request endpoint, then redirects the browser
 * to LINE Pay's payment page (paymentUrl.web).
 *
 * Used by the "Pay with LINE Pay" button in SuccessScreen:
 *   window.location.href = `/api/pay/linepay/${bookingId}`
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
const ACADEMY_ORIGIN = process.env.NEXT_PUBLIC_ACADEMY_URL ?? "https://academy.artecks.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  if (!bookingId || isNaN(Number(bookingId))) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  // confirmUrl and cancelUrl are the Academy pages LINE Pay will redirect to
  const confirmUrl = `${origin}/checkout/linepay/confirm`;
  const cancelUrl  = `${origin}/checkout/linepay/cancel`;

  const djangoUrl =
    `${BACKEND}/api/academy/bookings/${bookingId}/linepay/request/` +
    `?confirm_url=${encodeURIComponent(confirmUrl)}` +
    `&cancel_url=${encodeURIComponent(cancelUrl)}`;

  let djangoRes: Response;
  try {
    djangoRes = await fetch(djangoUrl, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Payment gateway unreachable." }, { status: 503 });
  }

  if (!djangoRes.ok) {
    let body: { error?: string } = {};
    try { body = await djangoRes.json(); } catch { /* ignore */ }
    return NextResponse.json(
      { error: body.error ?? "Could not create LINE Pay session." },
      { status: djangoRes.status }
    );
  }

  const data: {
    payment_url_web?: string;
    payment_url_app?: string;
    order_id?: string;
    error?: string;
  } = await djangoRes.json();

  if (!data.payment_url_web) {
    return NextResponse.json({ error: "No LINE Pay URL returned." }, { status: 500 });
  }

  // Redirect browser to LINE Pay payment page
  return NextResponse.redirect(data.payment_url_web, { status: 303 });
}
