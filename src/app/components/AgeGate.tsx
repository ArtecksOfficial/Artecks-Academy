"use client";
// Only adults pay (Nov 2026). The backend answers a payment request with
// 403 {code: "birth_year_required"} (no age saved yet) or {code: "adult_required"}
// (under 18). This watches fetch() for those answers: it asks the birth year
// once, saves it, and retries the payment; under-18s are told to ask a parent.
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Ask = { kind: "year" | "adult"; done: (year: number | null) => void };
let open: ((a: Ask) => void) | null = null;
let patched = false;

function ask(kind: Ask["kind"]): Promise<number | null> {
  return new Promise((resolve) => (open ? open({ kind, done: resolve }) : resolve(null)));
}

/** Same API root as the payment call: ".../api/<anything>" → ".../api/auth/me/birth-year/". */
function birthYearUrl(input: RequestInfo | URL): string | null {
  const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const u = new URL(raw, window.location.href);
  const i = u.pathname.indexOf("/api/");
  return i < 0 ? null : `${u.origin}${u.pathname.slice(0, i)}/api/auth/me/birth-year/`;
}

function authHeader(input: RequestInfo | URL, init?: RequestInit): string | null {
  const h = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  return h.get("authorization");
}

function patchFetch() {
  if (patched || typeof window === "undefined") return;
  patched = true;
  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await orig(input, init);
    if (res.status !== 403) return res;
    let code: string | undefined;
    try { code = (await res.clone().json())?.code; } catch { return res; }
    if (code === "adult_required") { await ask("adult"); return res; }
    if (code !== "birth_year_required") return res;
    const url = birthYearUrl(input);
    const auth = authHeader(input, init);
    if (!url || !auth) return res;
    const year = await ask("year");
    if (!year) return res;
    const saved = await orig(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({ birth_year: year }),
    }).catch(() => null);
    if (!saved || !saved.ok) return res;
    const { age_status } = await saved.json().catch(() => ({}));
    if (age_status !== "adult") { await ask("adult"); return res; }
    return orig(input, init); // adult: send the payment again
  };
}

export default function AgeGate() {
  const [current, setCurrent] = useState<Ask | null>(null);
  const [year, setYear] = useState("");
  const zh = useLanguage().locale === "zh";
  useEffect(() => {
    patchFetch();
    open = (a) => { setYear(""); setCurrent(a); };
    return () => { open = null; };
  }, []);
  if (!current) return null;

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => thisYear - i);
  const close = (v: number | null) => { current.done(v); setCurrent(null); };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="agegate-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-[#13223F]">
        {current.kind === "year" ? (
          <form onSubmit={(e) => { e.preventDefault(); if (year) close(Number(year)); }} className="flex flex-col gap-4">
            <h2 id="agegate-title" className="text-xl font-bold">{zh ? "確認出生年份" : "Confirm your birth year"}</h2>
            <p className="text-sm text-gray-600">
              {zh ? "只有成人可以在 Artecks 付款。我們只會詢問一次，並儲存在你的帳號中。"
                  : "Only adults can pay on Artecks. We ask once and keep it on your account."}
            </p>
            <select value={year} onChange={(e) => setYear(e.target.value)} required autoFocus
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-base">
              <option value="">{zh ? "選擇年份" : "Select year"}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <p className="text-xs text-gray-500">{zh ? "儲存後無法修改。" : "You can\u2019t change this later."}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => close(null)} className="rounded-xl border border-gray-300 py-3 font-semibold">{zh ? "取消" : "Cancel"}</button>
              <button type="submit" disabled={!year} className="rounded-xl bg-[#13223F] py-3 font-semibold text-white disabled:opacity-50">{zh ? "繼續" : "Continue"}</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 id="agegate-title" className="text-xl font-bold">{zh ? "請家長付款" : "Ask a parent to pay"}</h2>
            <p className="text-sm text-gray-600">
              {zh ? "只有成人可以在 Artecks 付款。請爸爸媽媽用他們自己的帳號登入購買。"
                  : "Only adults can make payments on Artecks. Ask a parent or guardian to sign in on their own account to buy this."}
            </p>
            <button type="button" onClick={() => close(null)} className="rounded-xl bg-[#13223F] py-3 font-semibold text-white">{zh ? "好" : "OK"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
