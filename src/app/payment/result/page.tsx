import Link from "next/link";
import { CheckCircle, XCircle, Crown } from "lucide-react";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    booking_id?: string;
    success?: string;
    subscription?: string;
    session_id?: string;    // Stripe checkout session ID (subscription flow)
  }>;
}) {
  const params = await searchParams;
  const isSubscription = params.subscription === "true";
  const bookingId = params.booking_id ?? "";
  // Stripe appends ?success=true on success, ?success=false on cancel
  const success = params.success === "true";

  // ── Subscription confirmation branch ──────────────────────────────────────
  if (isSubscription) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center text-white bg-gradient-to-br from-indigo-500 to-violet-600">
            <Crown size={48} className="mx-auto mb-3" />
            <h1 className="text-xl font-black">You&rsquo;re a Member!</h1>
            <p className="text-sm mt-1 text-indigo-100">
              Your membership is now active. Member pricing applies to every
              future booking automatically.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <p className="text-xs font-bold text-emerald-700 mb-1">
                ✓ Membership Active
              </p>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Add your Artecks account ID when booking to automatically
                receive your member discount at checkout.
              </p>
            </div>

            <Link
              href="/"
              className="w-full flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-4 transition-colors shadow-sm shadow-indigo-200"
            >
              Book a Session
            </Link>

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

  // ── Standard booking payment result ───────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-8 text-center text-white ${
            success
              ? "bg-gradient-to-br from-emerald-500 to-teal-500"
              : "bg-gradient-to-br from-red-500 to-rose-500"
          }`}
        >
          {success ? (
            <CheckCircle size={48} className="mx-auto mb-3" />
          ) : (
            <XCircle size={48} className="mx-auto mb-3" />
          )}
          <h1 className="text-xl font-black">
            {success ? "Payment Confirmed!" : "Payment Not Completed"}
          </h1>
          <p
            className={`text-sm mt-1 ${
              success ? "text-emerald-100" : "text-red-100"
            }`}
          >
            {success
              ? "Your spot is secured. See you at the session!"
              : "Your booking is saved — try paying again from your booking details."}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          {bookingId && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400">Booking Reference</p>
              <p className="text-sm font-mono font-bold text-gray-800">
                #{bookingId}
              </p>
            </div>
          )}

          {bookingId && (
            <Link
              href={`/report/${bookingId}`}
              className="w-full flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-4 transition-colors shadow-sm shadow-indigo-200"
            >
              View My Booking Details
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
