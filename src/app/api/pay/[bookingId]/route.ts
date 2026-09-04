import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  if (!bookingId || isNaN(Number(bookingId))) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/payment/result?booking_id=${bookingId}&success=true`;
  const cancelUrl = `${origin}/payment/result?booking_id=${bookingId}&success=false`;

  const djangoUrl =
    `${BACKEND}/api/academy/bookings/${bookingId}/pay/` +
    `?success_url=${encodeURIComponent(successUrl)}` +
    `&cancel_url=${encodeURIComponent(cancelUrl)}`;

  let djangoRes: Response;
  try {
    djangoRes = await fetch(djangoUrl, { cache: "no-store" });
  } catch {
    return NextResponse.json(
      { error: "Payment gateway unreachable." },
      { status: 503 }
    );
  }

  if (!djangoRes.ok) {
    let body: { error?: string } = {};
    try { body = await djangoRes.json(); } catch { /* ignore */ }
    return NextResponse.json(
      { error: body.error ?? "Could not create payment session." },
      { status: djangoRes.status }
    );
  }

  const data: { checkout_url?: string; error?: string } = await djangoRes.json();
  if (!data.checkout_url) {
    return NextResponse.json({ error: "No checkout URL returned." }, { status: 500 });
  }

  // Redirect the browser directly to Stripe Checkout
  return NextResponse.redirect(data.checkout_url, { status: 303 });
}
