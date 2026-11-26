"use client";
// "Message this coach" — saved by the academy and sent to the coach (and the owner) on LINE.

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

const field = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A]";

export default function MessageCoachForm({ coachKey, firstName, zh }: { coachKey: string; firstName: string; zh: boolean }) {
  const [method, setMethod] = useState<"line" | "phone" | "email">("line");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const age = String(f.get("child_age") || "").trim();
    setBusy(true); setErr("");
    const r = await fetch(`/api/coaches/${encodeURIComponent(coachKey)}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parent_name: String(f.get("parent_name") || "").trim(),
        contact_method: method,
        contact_value: String(f.get("contact_value") || "").trim(),
        child_age: age ? Number(age) : null,
        message: String(f.get("message") || "").trim(),
        website: String(f.get("website") || ""),
      }),
    }).catch(() => null);
    setBusy(false);
    if (r?.ok) return setSent(true);
    if (r?.status === 429) return setErr(zh ? "傳送太多次了，請稍後再試。" : "Too many messages. Please try again in a minute.");
    const d = r ? await r.json().catch(() => ({})) : {};
    const firstErr = Object.values(d as Record<string, unknown>).flat().find((x) => typeof x === "string") as string | undefined;
    setErr(firstErr || (zh ? "傳送失敗，請再試一次，或用 LINE 聯絡我們。" : "Couldn't send. Please try again, or contact us on LINE."));
  }

  if (sent) {
    return (
      <p role="status" className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-800">
        {zh ? `已送出！${firstName} 會盡快回覆你。` : `Sent! ${firstName} will get back to you soon.`}
      </p>
    );
  }

  const placeholders = { line: zh ? "你的 LINE ID" : "Your LINE ID", phone: "09xx-xxx-xxx", email: "you@example.com" };
  return (
    <form onSubmit={submit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="text-xs font-semibold text-gray-600">{zh ? "你的名字 *" : "Your name *"}
        <input name="parent_name" required maxLength={100} className={field} />
      </label>
      <label className="text-xs font-semibold text-gray-600">{zh ? "孩子年齡" : "Child's age"}
        <input name="child_age" type="number" min={2} max={18} inputMode="numeric" className={field} />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="text-xs font-semibold text-gray-600">{zh ? "希望怎麼回覆你？ *" : "How should they reply? *"}</legend>
        <div className="mt-1 flex gap-2">
          {(["line", "phone", "email"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMethod(m)} aria-pressed={method === m}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${method === m ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-700"}`}>
              {m === "line" ? "LINE" : m === "phone" ? (zh ? "電話" : "Phone") : "Email"}
            </button>
          ))}
        </div>
        <input name="contact_value" required maxLength={120} placeholder={placeholders[method]}
          type={method === "email" ? "email" : "text"} className={field} />
      </fieldset>
      <label className="text-xs font-semibold text-gray-600 sm:col-span-2">{zh ? "訊息 *" : "Message *"}
        <textarea name="message" required rows={4} maxLength={2000}
          placeholder={zh ? "例如：孩子的程度、想上課的時間或地點⋯" : "e.g. your child's level, when and where you'd like lessons…"} className={field} />
      </label>
      {/* Hidden from people; bots that fill it are ignored. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {zh ? "送出" : "Send message"}
        </button>
        {err && <p role="alert" className="text-sm font-semibold text-red-600">{err}</p>}
      </div>
    </form>
  );
}
