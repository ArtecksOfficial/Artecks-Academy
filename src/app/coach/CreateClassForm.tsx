"use client";
// Coach dashboard → Lessons: a coach creates a group class (optionally weekly).
// Classes stay hidden until the academy publishes them.

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";


export default function CreateClassForm({ zh, onCreated }: { zh: boolean; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", age_group: "", date: "", time: "16:00", minutes: "60",
                               location_name: "Linkou", seats: "6", price_twd: "1000", repeat_weeks: "1" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  // The coach's real share (default 80%, or their own), from the same place payouts use.
  const [SHARE_HINT, setShare] = useState(0.8);
  useEffect(() => {
    fetch("/api/coach/me", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (typeof d?.pricing?.coach_share === "number") setShare(d.pricing.coach_share); })
      .catch(() => {});
  }, []);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const price = Number(f.price_twd) || 0;
  const seats = Number(f.seats) || 0;
  const input = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-[#13223F] focus:border-[#C49A4A] focus:outline-none focus:ring-2 focus:ring-[#C49A4A]/30";
  const label = "block text-xs font-bold text-gray-600 mb-1";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.date) return setErr(zh ? "請選擇日期。" : "Pick a date.");
    const start = new Date(`${f.date}T${f.time}:00+08:00`); // Taiwan time
    setBusy(true);
    const r = await fetch("/api/coach/classes", {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        title: f.title, description: f.description, age_group: f.age_group, start: start.toISOString(),
        minutes: Number(f.minutes), location_name: f.location_name, seats, price_twd: price, repeat_weeks: Number(f.repeat_weeks),
      }),
    }).catch(() => null);
    setBusy(false);
    if (!r || !r.ok) {
      const d = r ? await r.json().catch(() => ({})) : {};
      const first = Object.values(d as Record<string, string[] | string>)[0];
      return setErr((Array.isArray(first) ? first[0] : first) || (zh ? "無法建立課程，請檢查欄位。" : "Couldn't create the class. Check the fields."));
    }
    const rows = await r.json().catch(() => []);
    setDone(Array.isArray(rows) ? rows.length : 1);
    setOpen(false);
    setF((x) => ({ ...x, title: "", description: "", date: "" }));
    onCreated();
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => { setOpen(true); setDone(null); }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#13223F] px-4 py-2.5 text-sm font-bold text-white">
          <Plus size={16} /> {zh ? "建立團體課" : "Create a group class"}
        </button>
        {done != null && (
          <p role="status" className="text-sm text-emerald-700">
            {zh ? `已建立 ${done} 堂課，學院審核後就會公開讓家長報名。` : `${done} class${done === 1 ? "" : "es"} created. Parents can sign up once the academy publishes ${done === 1 ? "it" : "them"}.`}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm flex flex-col gap-4" aria-labelledby="new-class">
      <div className="flex items-center justify-between">
        <h2 id="new-class" className="text-lg font-black text-[#13223F]">{zh ? "建立團體課" : "Create a group class"}</h2>
        <button type="button" onClick={() => setOpen(false)} aria-label={zh ? "關閉" : "Close"} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
      </div>
      <p className="text-sm text-gray-600 -mt-2">
        {zh ? "填好之後，學院會在一天內審核並公開，家長就能報名。" : "Once you submit, the academy reviews and publishes it, usually within a day. Then parents can sign up."}
      </p>

      <label><span className={label}>{zh ? "課程名稱" : "Class name"}</span>
        <input className={input} value={f.title} onChange={set("title")} required minLength={3} maxLength={120} placeholder={zh ? "例如：趣味文法" : "e.g. Fun with Grammar"} /></label>
      <label><span className={label}>{zh ? "課程介紹（選填）" : "What kids will do (optional)"}</span>
        <textarea className={input} rows={3} value={f.description} onChange={set("description")} maxLength={2000} /></label>

      <div className="grid grid-cols-2 gap-3">
        <label><span className={label}>{zh ? "日期" : "Date"}</span><input type="date" className={input} value={f.date} onChange={set("date")} required /></label>
        <label><span className={label}>{zh ? "開始時間" : "Start time"}</span><input type="time" className={input} value={f.time} onChange={set("time")} required /></label>
        <label><span className={label}>{zh ? "上課時間" : "Length"}</span>
          <select className={input} value={f.minutes} onChange={set("minutes")}>
            {[45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} {zh ? "分鐘" : "min"}</option>)}
          </select></label>
        <label><span className={label}>{zh ? "重複" : "Repeat"}</span>
          <select className={input} value={f.repeat_weeks} onChange={set("repeat_weeks")}>
            {[1, 4, 8, 12].map((w) => <option key={w} value={w}>{w === 1 ? (zh ? "只有一次" : "Just once") : zh ? `每週，共 ${w} 週` : `Weekly for ${w} weeks`}</option>)}
          </select></label>
        <label><span className={label}>{zh ? "名額" : "Seats"}</span>
          <input type="number" min={2} max={12} className={input} value={f.seats} onChange={set("seats")} required /></label>
        <label><span className={label}>{zh ? "年齡（選填）" : "Ages (optional)"}</span>
          <input className={input} value={f.age_group} onChange={set("age_group")} maxLength={50} placeholder="8–12" /></label>
      </div>

      <label><span className={label}>{zh ? "上課地點" : "Where"}</span>
        <input className={input} value={f.location_name} onChange={set("location_name")} required maxLength={200} placeholder={zh ? "例如：林口（地址報名後提供）" : "e.g. Linkou (address shared after sign-up)"} /></label>

      <label><span className={label}>{zh ? "每位孩子的價格（NT$／堂）" : "Price per child (NT$ per class)"}</span>
        <input type="number" min={200} max={6000} className={input} value={f.price_twd} onChange={set("price_twd")} required /></label>
      {price > 0 && seats > 1 && (
        <div className="rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3 text-sm text-[#13223F]">
          <p className="font-bold">
            {zh ? `每位孩子：你收到約 NT$${Math.round(price * SHARE_HINT).toLocaleString()}（${Math.round(SHARE_HINT * 100)}%）`
                : `Per child: you receive about NT$${Math.round(price * SHARE_HINT).toLocaleString()} (${Math.round(SHARE_HINT * 100)}%)`}
          </p>
          <p className="mt-1 text-xs text-[#5B6478]">
            {zh ? `額滿 ${seats} 人時，一堂課你約收到 NT$${Math.round(price * SHARE_HINT * seats).toLocaleString()}。`
                : `A full class of ${seats} earns you about NT$${Math.round(price * SHARE_HINT * seats).toLocaleString()}.`}
          </p>
        </div>
      )}

      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="self-start rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
        {busy ? <Loader2 size={16} className="animate-spin" /> : zh ? "送出審核" : "Submit for review"}
      </button>
    </form>
  );
}
