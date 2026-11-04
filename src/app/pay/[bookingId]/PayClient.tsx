"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle, Clock, Copy, MapPin } from "lucide-react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";

export interface PayInfo {
  booking_id: number;
  student_name: string;
  title: string;
  start_time: string;
  end_time: string | null;
  location_name: string;
  location_address: string;
  private_access_notes: string;
  coach_name: string;
  amount_twd: number;
  payment_status: "pending" | "paid";
  payment_method: string;
  status: "confirmed" | "attended" | "cancelled";
  transfer_reported: boolean;
  methods: { ecpay: boolean; linepay: boolean };
  bank: { bank_name: string; bank_code: string; account: string; holder: string } | null;
  contact_line_id: string;
}

function fmt(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function lineUrl(id: string) {
  return `https://line.me/R/ti/p/${encodeURIComponent(id.startsWith("@") ? id : `~${id}`)}`;
}

export default function PayClient({ info, token }: { info: PayInfo | null; token: string }) {
  const { t, locale } = useLanguage();
  const [reported, setReported] = useState(info?.transfer_reported ?? false);
  const [last5, setLast5] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB" }}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <span className="text-sm font-black text-gray-900">Artecks Academy</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">{children}</main>
    </div>
  );

  if (!info) {
    return shell(
      <div className="rounded-3xl bg-white border border-gray-200 p-8 text-center">
        <h1 className="text-lg font-black text-gray-900">{t("payNotFoundTitle")}</h1>
        <p className="text-sm text-gray-600 mt-2">{t("payNotFoundBody")}</p>
      </div>,
    );
  }

  const paid = info.payment_status === "paid";
  const cancelled = info.status === "cancelled";
  const anyOnline = info.methods.ecpay || info.methods.linepay;

  async function report(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{5}$/.test(last5)) {
      setError(t("payLast5Invalid"));
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/pay/transfer/${info!.booking_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token, last5 }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setReported(true);
    } catch {
      setError(t("coachError"));
    } finally {
      setSending(false);
    }
  }

  return shell(
    <>
      <h1 className="text-2xl font-black text-gray-900">{paid ? t("payPaidTitle") : t("payTitle")}</h1>

      {/* Lesson */}
      <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
        <p className="text-base font-black text-gray-900">{info.title}</p>
        <p className="text-sm text-gray-600 mt-1">
          {info.student_name}
          {info.coach_name ? ` · ${t("payCoach")} ${info.coach_name}` : ""}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-gray-700 mt-3">
          <Clock size={14} className="text-gray-400" /> {fmt(info.start_time, locale)}
        </p>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(info.location_address || info.location_name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-indigo-600 mt-1 hover:underline"
        >
          <MapPin size={14} /> {info.location_name}
          {info.location_address && <span className="text-gray-500 text-xs">· {info.location_address}</span>}
        </a>
        {paid && info.private_access_notes && (
          <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-xl px-3 py-2">{info.private_access_notes}</p>
        )}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("payAmount")}</span>
          <span className="text-2xl font-black text-gray-900">NT$ {info.amount_twd.toLocaleString()}</span>
        </div>
      </section>

      {cancelled && (
        <p className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{t("payCancelled")}</p>
      )}

      {paid && (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 text-center">
          <CheckCircle size={40} className="mx-auto text-emerald-600 mb-2" />
          <p className="text-sm font-bold text-emerald-800">{t("payPaidBody")}</p>
          <Link href={`/report/${info.booking_id}`} className="inline-block mt-3 text-xs font-semibold text-emerald-700 underline">
            {t("viewParentCard")}
          </Link>
        </div>
      )}

      {!paid && !cancelled && (
        <>
          {/* Online */}
          {anyOnline && (
            <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("payOnline")}</h2>
              {info.methods.linepay && (
                <a
                  href={`/api/pay/linepay/${info.booking_id}`}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: "#06C755" }}
                >
                  LINE Pay
                </a>
              )}
              {info.methods.ecpay && (
                <a
                  href={`/api/pay/ecpay/${info.booking_id}`}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: "#0066CC" }}
                >
                  {t("payEcpay")}
                </a>
              )}
            </section>
          )}

          {/* Bank transfer */}
          {info.bank && (
            <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("payBank")}</h2>
              <dl className="grid grid-cols-[96px_1fr] gap-y-1.5 text-sm">
                <dt className="text-gray-500">{t("payBankName")}</dt>
                <dd className="text-gray-900">{info.bank.bank_name}{info.bank.bank_code ? ` (${info.bank.bank_code})` : ""}</dd>
                <dt className="text-gray-500">{t("payBankAccount")}</dt>
                <dd className="text-gray-900 font-mono flex items-center gap-2">
                  {info.bank.account}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(info.bank!.account).then(() => setCopied(true)).catch(() => {});
                    }}
                    className="text-indigo-600"
                    aria-label={t("payCopy")}
                  >
                    <Copy size={14} />
                  </button>
                  {copied && <span className="text-xs text-emerald-600">✓</span>}
                </dd>
                {info.bank.holder && (
                  <>
                    <dt className="text-gray-500">{t("payBankHolder")}</dt>
                    <dd className="text-gray-900">{info.bank.holder}</dd>
                  </>
                )}
              </dl>

              {reported ? (
                <p className="mt-4 rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-800">{t("payReportedBody")}</p>
              ) : (
                <form onSubmit={report} className="mt-4 flex flex-col gap-2">
                  <label htmlFor="last5" className="text-xs font-semibold text-gray-600">{t("payLast5Label")}</label>
                  <div className="flex gap-2">
                    <input
                      id="last5"
                      inputMode="numeric"
                      maxLength={5}
                      value={last5}
                      onChange={(e) => setLast5(e.target.value.replace(/\D/g, ""))}
                      placeholder="12345"
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" disabled={sending}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold px-4">
                      {t("payReport")}
                    </button>
                  </div>
                  {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
                </form>
              )}
            </section>
          )}

          {!anyOnline && !info.bank && (
            <p className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">{t("payContactUs")}</p>
          )}
        </>
      )}

      {info.contact_line_id && (
        <a href={lineUrl(info.contact_line_id)} target="_blank" rel="noopener noreferrer"
          className="text-center text-xs font-semibold text-gray-500 hover:text-gray-800">
          {t("payQuestions")} LINE {info.contact_line_id}
        </a>
      )}
    </>,
  );
}
