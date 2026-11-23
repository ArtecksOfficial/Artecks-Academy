import L from "@/app/components/L";
import Link from "next/link";
import { CheckCircle, XCircle, Crown, Phone, Clock } from "lucide-react";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

async function fetchPaymentStatus(bookingId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${BACKEND}/api/academy/bookings/${bookingId}/payment-status/`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data: { payment_status?: string } = await res.json();
    return data.payment_status ?? null;
  } catch {
    return null;
  }
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    booking_id?: string;
    success?: string;
    subscription?: string;
    phone?: string;
  }>;
}) {
  const params = await searchParams;
  const isSubscription = params.subscription === "true";
  const bookingId = /^\d+$/.test(params.booking_id ?? "") ? params.booking_id! : "";
  // Never trust ?success=true from the URL — ask the server what was recorded.
  const paymentStatus = bookingId ? await fetchPaymentStatus(bookingId) : null;
  const success = paymentStatus === "paid";
  const pending = paymentStatus === "pending" && params.success !== "false";
  const linkedPhone = params.phone ? decodeURIComponent(params.phone) : null;

  // ── Subscription confirmation branch ──────────────────────────────────────
  if (isSubscription) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center text-white bg-gradient-to-br from-[#13223F] to-[#2A4170]">
            <Crown size={48} className="mx-auto mb-3" />
            <h1 className="text-xl font-black"><L en="You’re a Member!" zh="你已成為會員！" /></h1>
            <p className="text-sm mt-1 text-[#E7C98A]">
              <L en="Your membership is now active. Member pricing applies to every future booking automatically." zh="會員資格已啟用，之後每次預約都會自動套用會員價。" />
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex flex-col gap-4">
            {/* Linked phone callout */}
            {linkedPhone ? (
              <div className="rounded-xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={12} className="text-[#A07C34]" />
                  <p className="text-xs font-bold text-[#A07C34]"><L en="Membership linked to" zh="會員綁定的手機" /></p>
                </div>
                <p className="text-sm font-mono font-bold text-[#13223F]">{linkedPhone}</p>
                <p className="text-[10px] text-[#A07C34] mt-1 leading-snug">
                  <L en="Enter this phone number when booking to receive your member discount automatically." zh="預約時輸入這個手機號碼，就會自動套用會員折扣。" />
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <p className="text-xs font-bold text-emerald-700 mb-1">
                  ✓ <L en="Membership Active" zh="會員已啟用" />
                </p>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  <L en="Use the phone number or Artecks account ID you registered with when booking to automatically receive your member discount at checkout." zh="預約時使用註冊的手機號碼或 Artecks 帳號，結帳時會自動套用會員折扣。" />
                </p>
              </div>
            )}

            <Link
              href="/"
              className="w-full flex items-center justify-center rounded-2xl bg-[#13223F] hover:bg-[#1C3157] text-white text-sm font-bold py-4 transition-colors shadow-sm shadow-[#13223F]/10"
            >
              <L en="Book a Session" zh="預約課程" />
            </Link>

            <Link
              href="/my-membership"
              className="w-full flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold py-3 hover:bg-gray-50 transition-colors"
            >
              <L en="View My Membership" zh="查看我的會員資格" />
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center text-gray-400 text-xs py-1 hover:text-gray-600 transition-colors"
            >
              <L en="Back to Sessions" zh="回到課程" />
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
              : pending
              ? "bg-gradient-to-br from-amber-500 to-orange-500"
              : "bg-gradient-to-br from-red-500 to-rose-500"
          }`}
        >
          {success ? (
            <CheckCircle size={48} className="mx-auto mb-3" />
          ) : pending ? (
            <Clock size={48} className="mx-auto mb-3" />
          ) : (
            <XCircle size={48} className="mx-auto mb-3" />
          )}
          <h1 className="text-xl font-black">
            {success
              ? <L en="Payment Confirmed!" zh="付款成功！" />
              : pending
              ? <L en="Payment Processing" zh="付款確認中" />
              : <L en="Payment Not Completed" zh="尚未完成付款" />}
          </h1>
          <p
            className={`text-sm mt-1 ${
              success ? "text-emerald-100" : pending ? "text-amber-100" : "text-red-100"
            }`}
          >
            {success
              ? <L en="Your spot is secured. See you at class!" zh="名額已保留，上課見！" />
              : pending
              ? <L en="We haven’t received confirmation from the payment provider yet. ATM / convenience-store payments are confirmed after you pay. Refresh this page in a minute, or contact us on LINE." zh="尚未收到金流確認。ATM／超商付款會在完成繳費後確認。請稍後重新整理，或透過 LINE 聯絡我們。" />
              : <L en="Your booking is saved — try paying again from your booking details." zh="預約已保留，可以從預約詳情再付款一次。" />}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          {bookingId && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400"><L en="Booking Reference" zh="預約編號" /></p>
              <p className="text-sm font-mono font-bold text-gray-800">
                #{bookingId}
              </p>
            </div>
          )}

          {bookingId && (
            <Link
              href={`/report/${bookingId}`}
              className="w-full flex items-center justify-center rounded-2xl bg-[#13223F] hover:bg-[#1C3157] text-white text-sm font-bold py-4 transition-colors shadow-sm shadow-[#13223F]/10"
            >
              <L en="View My Booking Details" zh="查看預約詳情" />
            </Link>
          )}

          <Link
            href="/"
            className="w-full flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold py-3 hover:bg-gray-50 transition-colors"
          >
            <L en="Back to Sessions" zh="回到課程" />
          </Link>
        </div>
      </div>
    </div>
  );
}
