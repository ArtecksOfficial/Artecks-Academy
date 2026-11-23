"use client";
// Coach dashboard → Profile: the coach sets their own 1-on-1 price, with a live
// "parents pay / you receive" breakdown so the Artecks share is never a surprise.

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";

interface Pricing { standard_price_twd: number; coach_share: number; min_twd: number; max_twd: number }

export const PRICE_REVIEWED_KEY = "artecks-coach-price-reviewed";

export default function PriceCard({ zh, onSaved }: { zh: boolean; onSaved?: () => void }) {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/coach/me", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.pricing) return;
        setPricing(d.pricing);
        setSaved(d.price_private_twd ?? null);
        setValue(d.price_private_twd ? String(d.price_private_twd) : "");
      })
      .catch(() => {});
  }, []);

  if (!pricing) return null;
  const nt = (n: number) => `NT$${Math.round(n).toLocaleString()}`;
  const typed = Number(value.replace(/[^\d]/g, "")) || 0;
  const price = typed || pricing.standard_price_twd;
  const share = Math.round(pricing.coach_share * 100);
  const coachGets = Math.round(price * pricing.coach_share);
  const artecks = price - coachGets;
  const outOfRange = typed > 0 && (typed < pricing.min_twd || typed > pricing.max_twd);
  const unchanged = (typed || null) === saved;

  async function save(next: number | null) {
    setBusy(true); setMsg(null);
    const r = await fetch("/api/coach/me", {
      method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ price_private_twd: next }),
    }).catch(() => null);
    setBusy(false);
    if (!r || !r.ok) {
      return setMsg({ ok: false, text: zh ? `請輸入 ${nt(pricing!.min_twd)} 到 ${nt(pricing!.max_twd)} 之間的價格。` : `Enter a price between ${nt(pricing!.min_twd)} and ${nt(pricing!.max_twd)}.` });
    }
    setSaved(next);
    setValue(next ? String(next) : "");
    try { localStorage.setItem(PRICE_REVIEWED_KEY, "1"); } catch { /* private mode */ }
    setMsg({ ok: true, text: zh ? "已儲存。家長預約你時會看到這個價格。" : "Saved. Parents see this price when they book you." });
    onSaved?.();
  }

  const presets = [pricing.standard_price_twd, 1200, 1500, 1800].filter((v, i, a) => a.indexOf(v) === i && v >= pricing.min_twd && v <= pricing.max_twd);

  return (
    <section className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm" aria-labelledby="price-title">
      <h2 id="price-title" className="text-lg font-black text-[#13223F]">{zh ? "你的一對一課程價格" : "Your 1-on-1 lesson price"}</h2>
      <p className="mt-1 text-sm text-gray-600">
        {zh
          ? `設定家長一堂一小時的一對一課要付多少。不設定的話，就使用學院的標準價格 ${nt(pricing.standard_price_twd)}。`
          : `Set what parents pay for a 1-hour private lesson with you. Leave it empty to use the academy's standard price of ${nt(pricing.standard_price_twd)}.`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={zh ? "常用價格" : "Common prices"}>
        {presets.map((p) => (
          <button key={p} type="button" onClick={() => setValue(String(p))}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${price === p ? "border-[#13223F] bg-[#13223F] text-white" : "border-gray-200 text-[#13223F] hover:border-[#C49A4A]"}`}>
            {nt(p)}{p === pricing.standard_price_twd ? (zh ? "（標準）" : " (standard)") : ""}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="block text-xs font-bold text-gray-600 mb-1.5">{zh ? "或輸入你的價格（每小時）" : "Or type your price (per hour)"}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#13223F]">NT$</span>
          <input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
            placeholder={String(pricing.standard_price_twd)} aria-invalid={outOfRange}
            className="w-32 rounded-xl border border-gray-300 px-3 py-2 text-base font-bold text-[#13223F] focus:border-[#C49A4A] focus:outline-none focus:ring-2 focus:ring-[#C49A4A]/30" />
        </div>
      </label>

      <div className="mt-4 rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3 text-sm text-[#13223F]">
        <p className="font-bold">
          {zh ? `家長付 ${nt(price)} → 你收到 ${nt(coachGets)}（${share}%）` : `Parents pay ${nt(price)} → you receive ${nt(coachGets)} (${share}%)`}
        </p>
        <p className="mt-1 text-xs text-[#5B6478]">
          {zh
            ? `Artecks 保留 ${nt(artecks)}，用於招生、預約、收款和金流手續費。`
            : `Artecks keeps ${nt(artecks)} for finding families, bookings, collecting payment and card fees.`}
        </p>
      </div>
      {outOfRange && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {zh ? `價格需在 ${nt(pricing.min_twd)} 到 ${nt(pricing.max_twd)} 之間。` : `Prices go from ${nt(pricing.min_twd)} to ${nt(pricing.max_twd)}.`}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || outOfRange || unchanged} onClick={() => save(typed || null)}
          className="rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {busy ? <Loader2 size={16} className="animate-spin" /> : zh ? "儲存價格" : "Save price"}
        </button>
        {saved != null && (
          <button type="button" disabled={busy} onClick={() => save(null)} className="text-sm font-bold text-[#A07C34] hover:underline">
            {zh ? `改回標準價格 ${nt(pricing.standard_price_twd)}` : `Use the standard ${nt(pricing.standard_price_twd)} instead`}
          </button>
        )}
        {msg && <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      </div>
      <p className="mt-3 text-[11px] text-gray-500">
        {zh ? "新價格適用於之後的預約，已預約的課程不變。" : "Your price applies to new bookings. Lessons already booked keep their price."}
      </p>
    </section>
  );
}
