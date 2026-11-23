"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Crown, Phone, Search, Loader2, CheckCircle, XCircle, Calendar, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { lookupMembershipByPhone, type MembershipLookupResult } from "@/lib/academy-client";

export default function MembershipLookup() {
  const zh = useLanguage().locale === "zh";
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<MembershipLookupResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setStatus("loading");
    const r = await lookupMembershipByPhone(phone.trim());
    setResult(r);
    setStatus("done");
  }

  const expiry = result?.current_period_end
    ? new Date(result.current_period_end).toLocaleDateString(zh ? "zh-TW" : "en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Lookup form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setStatus("idle"); setResult(null); }}
            placeholder={zh ? "輸入你的手機號碼" : "Enter your phone number"}
            required
            className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E7C98A] bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !phone.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#13223F] hover:bg-[#1C3157] disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-sm shadow-[#13223F]/10"
        >
          {status === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <><Search size={15} /> {zh ? "查詢會員資格" : "Check Membership"}</>
          )}
        </button>
      </form>

      {/* Result card */}
      {status === "done" && result && (
        <div className="mt-6 rounded-2xl border overflow-hidden shadow-sm">
          {result.is_member ? (
            <>
              {/* Active member */}
              <div className="bg-gradient-to-br from-[#13223F] to-[#2A4170] px-5 py-5 text-white text-center">
                <Crown size={32} className="mx-auto mb-2" />
                <h2 className="text-base font-black">{zh ? "會員資格有效" : "Active Membership"}</h2>
                {result.provider_name && (
                  <p className="text-xs text-[#E7C98A] mt-0.5">{result.provider_name}</p>
                )}
              </div>
              <div className="bg-white px-5 py-4 flex flex-col gap-3">
                {result.plan_name && (
                  <div className="flex items-center gap-3">
                    <Tag size={14} className="text-[#A07C34] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{zh ? "方案" : "Plan"}</p>
                      <p className="text-sm font-bold text-gray-800">{result.plan_name}</p>
                    </div>
                  </div>
                )}
                {result.discount_percent !== undefined && (
                  <div className="flex items-center gap-3">
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{zh ? "折扣" : "Discount"}</p>
                      <p className="text-sm font-bold text-emerald-700">{result.discount_percent}% off all sessions</p>
                    </div>
                  </div>
                )}
                {expiry && (
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-[#E7C98A] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{zh ? "續訂日" : "Renews"}</p>
                      <p className="text-sm font-bold text-gray-800">{expiry}</p>
                    </div>
                  </div>
                )}
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 leading-snug">
                    {zh ? <>預約時使用 <span className="font-mono font-bold text-gray-600">{phone}</span>，就會自動套用會員折扣。</>
                        : <>Use <span className="font-mono font-bold text-gray-600">{phone}</span> when booking to apply your member discount automatically.</>}
                  </p>
                </div>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#13223F] hover:bg-[#1C3157] text-white text-sm font-bold transition-colors"
                >
                  {zh ? "預約課程" : "Book a Session"} <ArrowRight size={13} />
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* No active membership */}
              <div className="bg-gray-50 px-5 py-5 text-center">
                <XCircle size={32} className="mx-auto mb-2 text-gray-300" />
                <h2 className="text-base font-bold text-gray-700">{zh ? "沒有有效的會員資格" : "No Active Membership"}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {result.error
                    ? result.error
                    : (zh ? "找不到綁定這個手機號碼的有效會員資格。" : "We couldn\u2019t find an active membership linked to this phone number.")}
                </p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs text-gray-500 mb-3 leading-snug">
                  {zh ? "請確認號碼是否正確，或訂閱以享有每堂課的會員折扣。" : "Double-check your number, or subscribe to unlock member discounts on every session."}
                </p>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[#E7C98A] text-[#A07C34] hover:bg-[#FBF5E8] text-sm font-bold transition-colors"
                >
                  {zh ? "查看方案" : "View Plans"} <ArrowRight size={13} />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
