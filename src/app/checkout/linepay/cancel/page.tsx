/**
 * /checkout/linepay/cancel
 *
 * LINE Pay redirects here when the user taps Cancel on the LINE Pay page.
 * Booking stays PENDING — just show a friendly message with a retry option.
 */
import Link from "next/link";
import { XCircle } from "lucide-react";

export default async function LinePayCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId ?? "";

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full overflow-hidden">
        <div className="px-6 py-8 text-center text-white bg-gradient-to-br from-gray-500 to-gray-600">
          <XCircle size={48} className="mx-auto mb-3" />
          <h1 className="text-xl font-black">Payment Cancelled</h1>
          <p className="text-sm mt-1 text-gray-200">
            You cancelled the LINE Pay flow. Your booking is still saved.
          </p>
        </div>
        <div className="px-6 py-6 flex flex-col gap-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-4 transition-colors"
          >
            Back to Sessions
          </Link>
          <Link
            href="/bookings/mine"
            className="w-full flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold py-3 hover:bg-gray-50 transition-colors"
          >
            My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
