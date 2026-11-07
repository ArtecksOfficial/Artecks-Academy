"use client";
// ─── Lesson packages — pick a package, use gems (≤10%), order, pay by transfer ─

import AuthButton from "@/app/components/AuthButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, Gem, Loader2, Package } from "lucide-react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import LineLoginButton from "@/app/components/LineLoginButton";

type Format = "private" | "pair" | "group";

interface Pkg {
  id: number;
  format: Format;
  lessons: number;
  bonus_lessons: number;
  total_lessons: number;
  price_twd: number;
  per_lesson_twd: number;
  valid_days: number;
  max_gems: number;
}
interface Bank { bank_name: string; bank_code: string; account: string; holder: string; contact_line_id: string }
interface Purchase {
  id: number;
  format: Format;
  lessons_total: number;
  lessons_left: number;
  price_twd: number;
  gems_used: number;
  gem_discount_twd: number;
  amount_due_twd: number;
  status: "pending" | "paid" | "cancelled";
  expires_at: string | null;
  is_expired: boolean;
  transfer_reported: boolean;
  bank?: Bank | null;
}
interface Mine { gems: number; gem_value_twd: number; credits: Record<Format, number>; purchases: Purchase[] }

const FORMATS: Format[] = ["private", "pair", "group"];
const nt = (n: number) => `NT$ ${n.toLocaleString()}`;

function fmtDate(iso: string | null, locale: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "short", day: "numeric" });
}

export default function PackagesClient() {
  const { t, locale } = useLanguage();
  const { user, isLoading } = useAuth();
  const [pkgs, setPkgs] = useState<Pkg[] | null>(null);
  const [gemValue, setGemValue] = useState(3);
  const [mine, setMine] = useState<Mine | null>(null);
  const [format, setFormat] = useState<Format>("private");
  const [selected, setSelected] = useState<number | null>(null);
  const [gems, setGems] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/packages").then((r) => r.json()).then((d) => {
      setPkgs(Array.isArray(d.packages) ? d.packages : []);
      if (d.gem_value_twd) setGemValue(d.gem_value_twd);
    }).catch(() => setPkgs([]));
  }, []);

  const loadMine = useCallback(() => {
    fetch("/api/packages/mine", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null)).then((d) => d && setMine(d)).catch(() => {});
  }, []);
  useEffect(() => { if (user) loadMine(); }, [user, loadMine]);

  const shown = useMemo(() => (pkgs ?? []).filter((p) => p.format === format), [pkgs, format]);
  const pkg = shown.find((p) => p.id === selected) ?? null;
  const maxGems = pkg ? Math.min(pkg.max_gems, mine?.gems ?? 0) : 0;
  useEffect(() => { setGems(maxGems); }, [selected, maxGems]);

  const pending = (mine?.purchases ?? []).filter((p) => p.status === "pending");
  const active = (mine?.purchases ?? []).filter((p) => p.status === "paid");

  async function order() {
    if (!pkg) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/packages/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ package_id: pkg.id, gems }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.detail === "too_many_pending" ? t("pkgTooMany") : t("pkgError"));
        return;
      }
      setSelected(null);
      loadMine();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB" }}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <span className="text-sm font-black text-gray-900">Artecks Academy</span>
          </Link>
          <div className="flex items-center gap-3">
            <AuthButton locale={locale} />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{t("pkgTitle")}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">{t("pkgSub")}</p>
        </div>

        {/* Orders waiting for payment */}
        {pending.map((p) => <PendingOrder key={p.id} p={p} onChange={loadMine} />)}

        {/* Active packages */}
        {active.length > 0 && (
          <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("pkgMine")}</h2>
            <ul className="flex flex-col gap-2">
              {active.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                  <span className="text-sm font-bold text-gray-900">{t(`pkgFormat_${p.format}` as DictionaryKey)}</span>
                  <span className="text-xs text-gray-600 text-right">
                    <b className="text-indigo-700 text-sm">{p.lessons_left}</b> / {p.lessons_total} {t("pkgLeft")}
                    {p.expires_at && <span className="block">{t("pkgExpires")} {fmtDate(p.expires_at, locale)}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">{t("pkgHowUse")}</p>
            {(mine?.credits.private ?? 0) > 0 && (
              <Link href="/book" className="mt-3 inline-block rounded-xl bg-indigo-600 text-white text-sm font-bold px-4 py-2.5">{t("pkgBookNow")} →</Link>
            )}
          </section>
        )}

        {/* Choose */}
        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-4" role="tablist">
            {FORMATS.map((f) => (
              <button key={f} type="button" role="tab" aria-selected={format === f} onClick={() => { setFormat(f); setSelected(null); }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  format === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {t(`pkgFormat_${f}` as DictionaryKey)}
              </button>
            ))}
          </div>
          {pkgs === null && <Loader2 className="animate-spin text-gray-300" size={20} />}
          <div className="grid sm:grid-cols-2 gap-3">
            {shown.map((p) => (
              <button key={p.id} type="button" onClick={() => setSelected(p.id)} aria-pressed={selected === p.id}
                className={`text-left rounded-2xl border-2 p-4 transition-colors ${
                  selected === p.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"}`}>
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900">{p.lessons}</span>
                  <span className="text-sm font-semibold text-gray-600">{t("pkgLessons")}</span>
                  {p.bonus_lessons > 0 && (
                    <span className="ml-auto rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5">+{p.bonus_lessons} {t("pkgFree")}</span>
                  )}
                </span>
                <span className="block text-lg font-black text-indigo-700 mt-2">{nt(p.price_twd)}</span>
                <span className="block text-xs text-gray-500 mt-1">
                  {t("pkgPerLesson")} {nt(p.per_lesson_twd)} · {t("pkgValid")} {p.valid_days} {t("pkgDays")}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Checkout */}
        {pkg && (
          <section className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
            {!user && !isLoading ? (
              <>
                <h2 className="text-lg font-black text-gray-900">{t("pkgLoginTitle")}</h2>
                <p className="text-sm text-gray-600 -mt-2">{t("pkgLoginBody")}</p>
                <LineLoginButton next="/packages" label={t("pkgLoginLine")} />
                <Link href="/login?next=/packages" className="text-center text-sm font-bold text-indigo-600">{t("pkgLoginEmail")}</Link>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-900">{t(`pkgFormat_${pkg.format}` as DictionaryKey)} × {pkg.total_lessons}</span>
                  <span className="text-gray-700">{nt(pkg.price_twd)}</span>
                </div>
                <div className="rounded-2xl bg-violet-50 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-violet-900 inline-flex items-center gap-1.5"><Gem size={14} /> {t("pkgUseGems")}</span>
                    <span className="text-xs text-violet-700">{t("pkgYourGems")}: {(mine?.gems ?? 0).toLocaleString()}</span>
                  </div>
                  <input type="range" min={0} max={maxGems} step={1} value={gems} disabled={maxGems === 0}
                    onChange={(e) => setGems(Number(e.target.value))} className="w-full mt-2 accent-violet-600" aria-label={t("pkgUseGems")} />
                  <div className="flex items-center justify-between text-xs text-violet-800">
                    <span>{gems} 💎 → − {nt(gems * gemValue)}</span>
                    <span>{t("pkgGemNote1")}{gemValue}{t("pkgGemNote2")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-bold text-gray-900">{t("pkgTotal")}</span>
                  <span className="text-xl font-black text-indigo-700">{nt(pkg.price_twd - gems * gemValue)}</span>
                </div>
                {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
                <button type="button" onClick={order} disabled={busy || !user}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black py-4 text-base transition-colors shadow-lg">
                  {busy ? "…" : t("pkgBuy")}
                </button>
              </>
            )}
          </section>
        )}

        {/* How to earn */}
        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 inline-flex items-center gap-2"><Gem size={15} className="text-violet-600" /> {t("pkgEarnTitle")}</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-gray-700">
            {(["pkgEarn1", "pkgEarn2", "pkgEarn3", "pkgEarn4"] as DictionaryKey[]).map((k) => (
              <li key={k} className="flex gap-2"><CheckCircle size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {t(k)}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function PendingOrder({ p, onChange }: { p: Purchase; onChange: () => void }) {
  const { t } = useLanguage();
  const [last5, setLast5] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function post(path: string, body?: object) {
    setBusy(true);
    setErr(false);
    const r = await fetch(`/api/packages/${p.id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body ?? {}),
    }).catch(() => null);
    setBusy(false);
    if (!r || !r.ok) setErr(true);
    else onChange();
  }

  return (
    <section className="rounded-3xl bg-white border-2 border-amber-300 p-5 sm:p-6 shadow-sm flex flex-col gap-3">
      <h2 className="text-lg font-black text-gray-900 inline-flex items-center gap-2"><Package size={18} className="text-amber-500" /> {t("pkgOrderedTitle")}</h2>
      <p className="text-sm text-gray-700">
        {t(`pkgFormat_${p.format}` as DictionaryKey)} × {p.lessons_total}
        {p.gems_used > 0 && <> · {p.gems_used} 💎 (−{nt(p.gem_discount_twd)})</>}
      </p>
      <p className="text-2xl font-black text-indigo-700">{nt(p.amount_due_twd)}</p>
      {p.bank && (
        <dl className="rounded-2xl bg-gray-50 px-4 py-3 text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-gray-500">{t("pkgBank")}</dt><dd className="font-semibold">{p.bank.bank_name} ({p.bank.bank_code})</dd>
          <dt className="text-gray-500">{t("pkgAccount")}</dt><dd className="font-mono font-bold select-all">{p.bank.account}</dd>
          <dt className="text-gray-500">{t("pkgHolder")}</dt><dd className="font-semibold">{p.bank.holder}</dd>
        </dl>
      )}
      {p.transfer_reported ? (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">{t("pkgLast5Done")}</p>
      ) : (
        <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); post("transfer-notice", { last5 }); }}>
          <label htmlFor={`l5-${p.id}`} className="text-xs font-semibold text-gray-600">{t("pkgLast5Label")}</label>
          <div className="flex gap-2">
            <input id={`l5-${p.id}`} value={last5} onChange={(e) => setLast5(e.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric" pattern="\d{5}" required placeholder="12345"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500" />
            <button type="submit" disabled={busy || last5.length !== 5}
              className="rounded-xl bg-indigo-600 disabled:opacity-50 text-white text-sm font-bold px-4">{t("pkgLast5Send")}</button>
          </div>
        </form>
      )}
      {err && <p role="alert" className="text-sm text-red-600">{t("pkgError")}</p>}
      {!p.transfer_reported && (
        <button type="button" disabled={busy} onClick={() => post("cancel")} className="self-start text-xs font-semibold text-gray-500 hover:text-red-600">
          {t("pkgCancel")}
        </button>
      )}
    </section>
  );
}
