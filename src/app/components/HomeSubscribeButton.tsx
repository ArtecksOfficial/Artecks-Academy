"use client";
import { useState } from "react";
import { ArrowRight, Loader2, Crown, X, Phone } from "lucide-react";
import { createSubscriptionCheckoutAction } from "@/app/session/[id]/actions";

interface Props {
  planId: string;
  discountPercent?: string;
}

export default function HomeSubscribeButton({ planId, discountPercent }: Props) {
  const [step, setStep] = useState<"idle" | "form" | "loading">("idle");
  const [phone, setPhone] = useState("");
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState("");

  function openModal() {
    setError("");
    setStep("form");
  }

  function closeModal() {
    setStep("idle");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("請輸入手機號碼。");
      return;
    }
    setError("");
    setStep("loading");

    try {
      const origin = window.location.origin;
      const result = await createSubscriptionCheckoutAction({
        plan_id: planId,
        customer_phone: trimmedPhone,
        artecks_account_id: accountId.trim() || undefined,
        success_url: `${origin}/payment/result?subscription=true&phone=${encodeURIComponent(trimmedPhone)}`,
        cancel_url: `${origin}/`,
      });
      if (result?.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setError("無法建立訂閱頁面，請稍後再試。");
        setStep("form");
      }
    } catch {
      setError("發生錯誤，請稍後再試。");
      setStep("form");
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="inline-flex items-center gap-1.5 rounded-full bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold px-4 py-2 transition-colors"
      >
        Subscribe <ArrowRight size={12} />
      </button>

      {/* Modal backdrop */}
      {(step === "form" || step === "loading") && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 px-6 pt-6 pb-5 text-white relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <Crown size={28} className="mb-2" />
              <h2 className="text-base font-black leading-tight">Set Up Your Membership</h2>
              <p className="text-xs text-indigo-100 mt-1 leading-snug">
                We'll link your membership to your phone so discounts apply automatically when you book.
                {discountPercent && ` Save ${discountPercent}% on every session.`}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    required
                    disabled={step === "loading"}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Used to identify your membership at booking.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Artecks Account ID <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="e.g. ISSAC-001"
                  disabled={step === "loading"}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 font-medium">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={step === "loading"}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={step === "loading"}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200"
                >
                  {step === "loading" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>Continue <ArrowRight size={14} /></>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                You'll be redirected to Stripe to complete your subscription.
                No payment is charged until you confirm on the next screen.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
