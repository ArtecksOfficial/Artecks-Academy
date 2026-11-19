/**
 * /checkout/linepay/confirm
 *
 * LINE Pay redirects here after the user approves payment.
 * Query params from LINE Pay: transactionId (19-digit string), orderId
 *
 * This server component calls the Django confirm endpoint, which calls
 * LINE Pay's /v3/payments/{transactionId}/confirm to capture the payment
 * and marks the booking as PAID.
 *
 * CRITICAL: transactionId is passed through as a string — never parse
 * it as a JS Number (64-bit BigInt loses precision).
 */
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

interface ConfirmResult {
  success: boolean;
  booking_id?: number;
  already_paid?: boolean;
  error?: string;
  return_code?: string;
}

async function confirmLinePayment(
  transactionId: string,
  orderId: string
): Promise<ConfirmResult> {
  const url =
    `${BACKEND}/api/academy/linepay/confirm/` +
    `?transactionId=${encodeURIComponent(transactionId)}` +
    `&orderId=${encodeURIComponent(orderId)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error ?? "Confirmation failed." };
    }
    return { success: true, booking_id: data.booking_id, already_paid: data.already_paid };
  } catch {
    return { success: false, error: "Could not reach payment gateway." };
  }
}

export default async function LinePayConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ transactionId?: string; orderId?: string }>;
}) {
  const params = await searchParams;

  // CRITICAL: keep as raw strings — never Number() a LINE Pay transactionId
  const transactionId = (params.transactionId ?? "").trim();
  const orderId       = (params.orderId ?? "").trim();

  let result: ConfirmResult = { success: false, error: "Missing payment parameters." };

  if (transactionId && orderId) {
    result = await confirmLinePayment(transactionId, orderId);
  }

  const bookingId = result.booking_id;

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-8 text-center text-white ${
            result.success
              ? "bg-gradient-to-br from-emerald-500 to-teal-500"
              : "bg-gradient-to-br from-red-500 to-rose-500"
          }`}
        >
          {result.success ? (
            <CheckCircle size={48} className="mx-auto mb-3" />
          ) : (
            <XCircle size={48} className="mx-auto mb-3" />
          )}
          <h1 className="text-xl font-black">
            {result.success ? "Payment Confirmed!" : "Payment Not Completed"}
          </h1>
          <p className={`text-sm mt-1 ${result.success ? "text-emerald-100" : "text-red-100"}`}>
            {result.success
              ? "Your LINE Pay payment is confirmed. See you at the session!"
              : (result.error ?? "Something went wrong. Your booking is saved — try paying again.")}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          {/* LINE Pay badge */}
          <div className="flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755" aria-hidden="true">
              <path d="M19.952 11.034C19.952 6.583 15.49 2.953 10 2.953S.048 6.583.048 11.034c0 4.02 3.566 7.389 8.382 8.028.326.07.771.215.883.494.102.254.067.652.033.909l-.143.857c-.044.254-.202 1.002.878.546 1.08-.455 5.826-3.432 7.949-5.878 1.465-1.607 2.922-3.636 2.922-5.956z"/>
            </svg>
            <span className="text-xs font-semibold text-gray-500">Paid via LINE Pay</span>
          </div>

          {bookingId && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400">Booking Reference</p>
              <p className="text-sm font-mono font-bold text-gray-800">#{bookingId}</p>
            </div>
          )}

          {bookingId && result.success && (
            <Link
              href={`/report/${bookingId}`}
              className="w-full flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-4 transition-colors shadow-sm shadow-indigo-200"
            >
              View My Booking Details
            </Link>
          )}

          {!result.success && bookingId && (
            <Link
              href={`/api/pay/linepay/${bookingId}`}
              className="w-full flex items-center justify-center rounded-2xl bg-[#06C755] hover:opacity-90 text-white text-sm font-bold py-4 transition-opacity"
            >
              Try LINE Pay Again
            </Link>
          )}

          <Link
            href="/"
            className="w-full flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold py-3 hover:bg-gray-50 transition-colors"
          >
            Back to Sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
