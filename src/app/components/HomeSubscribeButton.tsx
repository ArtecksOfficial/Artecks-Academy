"use client";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { createSubscriptionCheckoutAction } from "@/app/session/[id]/actions";

export default function HomeSubscribeButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const result = await createSubscriptionCheckoutAction({
        plan_id: planId,
        success_url: `${origin}/payment/result?subscription=true`,
        cancel_url: `${origin}/`,
      });
      if (result?.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 text-xs font-bold px-4 py-2 transition-colors"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <>Subscribe <ArrowRight size={12} /></>}
    </button>
  );
}
