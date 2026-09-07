/**
 * GET /api/pay/ecpay/[bookingId]
 *
 * Calls the Django ECPay AioCheckout V5 endpoint, then returns an HTML page
 * with the auto-submitting ECPay form — the browser navigates here and is
 * immediately forwarded to the ECPay payment page via form POST.
 *
 * Used by the "台灣在地支付" button in SuccessScreen:
 *   <a href={`/api/pay/ecpay/${bookingId}`}>台灣在地支付</a>
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  if (!bookingId || isNaN(Number(bookingId))) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }

  let djangoRes: Response;
  try {
    djangoRes = await fetch(
      `${BACKEND}/api/academy/payments/ecpay/checkout/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: Number(bookingId) }),
        cache: "no-store",
      }
    );
  } catch {
    return NextResponse.json({ error: "Payment gateway unreachable." }, { status: 503 });
  }

  if (!djangoRes.ok) {
    let body: { error?: string } = {};
    try { body = await djangoRes.json(); } catch { /* ignore */ }
    return NextResponse.json(
      { error: body.error ?? "Could not create ECPay session." },
      { status: djangoRes.status }
    );
  }

  const data: {
    form_html?: string;
    checkout_url?: string;
    error?: string;
  } = await djangoRes.json();

  if (!data.form_html) {
    return NextResponse.json({ error: "No ECPay form returned." }, { status: 500 });
  }

  // Return an HTML page that immediately submits the ECPay form
  const html = `<!doctype html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>付款中... | Artecks Academy</title>
  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; font-family: system-ui, sans-serif; background: #f8f9fa; }
    p { color: #555; font-size: 0.95rem; }
  </style>
</head>
<body>
  <p>正在前往付款頁面，請稍候…</p>
  ${data.form_html}
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
