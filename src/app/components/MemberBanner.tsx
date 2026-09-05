"use client";
// ─── MemberBanner ─────────────────────────────────────────────────────────────
// Dual-state membership banner:
//   State A — not a member: CTA to subscribe via the provider's Stripe plan.
//   State B — active member: discount badge with plan name and expiry info.

import { useState } from "react";
import { Crown, ArrowRight, Loader2 } from "lucide-react";
import type { Provider, MembershipCheckResult } from "@/lib/types";

interface MemberBannerProps {
  provider: Provider;
  membershipResult: MembershipCheckResult | null;
  /** Called after Stripe redirects back, when showing the subscribe CTA. */
  onSubscribeClick?: (planId: string) => void | Promise<void>;
}

export default function MemberBanner({
  provider,
  membershipResult,
  onSubscribeClick,
}: MemberBannerProps) {
  const [loading, setLoading] = useState(false);

  // ── State B: active member ────────────────────────────────────────────────
  if (membershipResult?.is_member) {
    const expiry = membershipResult.current_period_end
      ? new Date(membershipResult.current_period_end).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : null;

    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
        <Crown size={15} className="text-emerald-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-700 truncate">
            {provider.name} Member
          </p>
          <p className="text-[10px] text-emerald-600 leading-tight mt-0.5">
            {membershipResult.plan_name
              ? `${membershipResult.plan_name} · `
              : ""}
            {membershipResult.discount_percent}% off all sessions
            {expiry ? ` · renews ${expiry}` : ""}
          </p>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
          Active
        </span>
      </div>
    );
  }

  // ── State A: not a member — show subscribe CTA ────────────────────────────
  const bestPlan = provider.plans[0];

  async function handleSubscribe() {
    if (!bestPlan || !onSubscribeClick) return;
    setLoading(true);
    try {
      await onSubscribeClick(bestPlan.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
      <p className="text-xs font-bold text-indigo-700">
        Become a {provider.name} Member
      </p>
      {bestPlan && (
        <p className="text-[10px] text-indigo-500 mt-0.5 leading-tight">
          Save {bestPlan.discount_percent}% on every session
        </p>
      )}
      {onSubscribeClick && bestPlan && (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2 transition-colors"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>Subscribe <ArrowRight size={12} /></>
          )}
        </button>
      )}
    </div>
  );
}
