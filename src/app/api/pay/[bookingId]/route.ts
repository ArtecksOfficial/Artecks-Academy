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

  // Build the return URL — after ECPay payment, parent lands on /payment/result
  const origin = new URL(request.url).origin;
  const returnUrl = `${origin}/payment/result?booking_id=${bookingId}`;

  const djangoUrl =
    `${BACKEND}/api/academy/bookings/${bookingId}/pay/` +
    `?return_url=${encodeURIComponent(returnUrl)}` +
    `&client_back_url=${encodeURIComponent(origin + "/")}`;

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

  const data: { form_html?: string; error?: string } = await djangoRes.json();
  if (!data.form_html) {
    return NextResponse.json({ error: "No payment form returned." }, { status: 500 });
  }

  // Return a minimal HTML page that wraps the auto-submitting ECPay form
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirecting to payment…</title>
  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; font-family: system-ui, sans-serif; background: #f6f7fb; }
    .card { text-align: center; color: #4b5563; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e0e7ff;
               border-top-color: #4f46e5; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <p>Redirecting to payment gateway…</p>
  </div>
  ${data.form_html}
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
