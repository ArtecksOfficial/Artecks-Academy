"use client";
// ─── Slot booking — area → 60-min slot → details → pay / pending ─────────────
// One merged calendar across coaches. Parents never pick a coach: every
// booking waits for the owner, who assigns the coach and place.

import AuthButton from "@/app/components/AuthButton";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Loader2, MapPin } from "lucide-react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";

interface SlotResp {
  price_twd: number;
  slot_minutes: number;
  coaches: { id: number; name: string; title: string }[];
  slots: { start: string; end: string }[];
}

type ContactMethod = "line" | "whatsapp" | "sms" | "email";

const CONTACTS: { value: ContactMethod; key: DictionaryKey; placeholder: DictionaryKey }[] = [
  { value: "line", key: "line", placeholder: "contactPlaceholderLine" },
  { value: "whatsapp", key: "whatsapp", placeholder: "contactPlaceholderWhatsapp" },
  { value: "sms", key: "smsSms", placeholder: "contactPlaceholderSms" },
  { value: "email", key: "emailContact", placeholder: "contactPlaceholderEmail" },
];
const LEVELS: { value: string; key: DictionaryKey }[] = [
  { value: "beginner", key: "chessExpBeginner" },
  { value: "knows_rules", key: "chessExpKnowsRules" },
  { value: "experienced", key: "chessExpExperienced" },
];

const input =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const label = "block text-xs font-semibold text-gray-600 mb-1.5";

function tpeDayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }); // YYYY-MM-DD
}
function fmtDay(key: string, locale: string) {
  const d = new Date(`${key}T12:00:00+08:00`);
  return d.toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
    timeZone: "Asia/Taipei", weekday: "short", month: "numeric", day: "numeric",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit" });
}
function fmtFull(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "zh-TW", {
    timeZone: "Asia/Taipei", weekday: "short", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function BookPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [areas, setAreas] = useState<string[] | null>(null);
  const [area, setArea] = useState<string>("");
  const [data, setData] = useState<SlotResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("line");
  const [level, setLevel] = useState("beginner");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ start: string } | null>(null);
  const [ref, setRef] = useState("");
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [useCredit, setUseCredit] = useState(true);

  useEffect(() => {
    if (!user) { setCredits(0); return; }
    fetch("/api/packages/mine", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCredits(d?.credits?.private ?? 0))
      .catch(() => {});
  }, [user]);
  const payWithCredit = credits > 0 && useCredit;

  useEffect(() => {
    // Referral links look like /book?ref=ABC1234
    const r = new URLSearchParams(window.location.search).get("ref") ?? "";
    if (/^[A-Za-z0-9]{4,12}$/.test(r)) setRef(r.toUpperCase());
  }, []);

  useEffect(() => {
    fetch("/api/slots").then((r) => r.json()).then((a: string[]) => {
      setAreas(Array.isArray(a) ? a : []);
      if (Array.isArray(a) && a.length === 1) setArea(a[0]);
    }).catch(() => setAreas([]));
  }, []);

  useEffect(() => {
    if (!area) return;
    setLoading(true);
    setSlot("");
    const p = new URLSearchParams({ area, days: "14" });
    fetch(`/api/slots?${p.toString()}`).then((r) => r.json()).then((d: SlotResp) => {
      setData(d);
      const first = d.slots?.[0];
      setDay(first ? tpeDayKey(first.start) : "");
    }).catch(() => setData(null)).finally(() => setLoading(false));
  }, [area]);

  const byDay = useMemo(() => {
    const m = new Map<string, { start: string; end: string }[]>();
    for (const s of data?.slots ?? []) {
      const k = tpeDayKey(s.start);
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    return m;
  }, [data]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    setSending(true);
    try {
      const res = await fetch("/api/slots/book", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          use_package: payWithCredit,
          start: slot,
          area,
          parent_name: String(f.get("parent_name") || "").trim(),
          parent_phone: String(f.get("parent_phone") || "").trim(),
          contact_method: contactMethod,
          contact_value: String(f.get("contact_value") || "").trim(),
          student_name: String(f.get("student_name") || "").trim(),
          student_age: Number(f.get("student_age") || 0),
          chess_experience_level: level,
          special_notes: String(f.get("notes") || "").trim(),
          account_consent: f.get("account_consent") === "on",
          ref,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setError(t("bookTaken"));
        setSlot("");
        setData((d) => (d ? { ...d, slots: d.slots.filter((s) => s.start !== slot) } : d));
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      if (body.status === "confirmed" && body.pay_url) {
        try {
          const u = new URL(body.pay_url);
          router.push(u.pathname + u.search);
        } catch {
          window.location.href = body.pay_url;
        }
        return;
      }
      setPending({ start: body.start ?? slot });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t("reqError"));
    } finally {
      setSending(false);
    }
  }

  const contact = CONTACTS.find((c) => c.value === contactMethod)!;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB" }}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <span className="text-sm font-black text-gray-900">Artecks Academy</span>
          </Link>
          <div className="flex items-center gap-2"><AuthButton locale={locale} /><LanguageToggle /></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-5">
        {pending ? (
          <div className="rounded-3xl bg-white border border-gray-200 p-8 text-center shadow-sm">
            <CheckCircle size={44} className="mx-auto text-emerald-500 mb-3" />
            <h1 className="text-xl font-black text-gray-900">{t("bookPendingTitle")}</h1>
            <p className="text-sm font-semibold text-indigo-600 mt-2">{fmtFull(pending.start, locale)} · {area}</p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{t("bookPendingBody")}</p>
            <Link href="/" className="inline-block mt-6 text-sm font-bold text-indigo-600">← {t("reqBackHome")}</Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{t("bookTitle")}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">{t("bookSub")}</p>
            </div>

            {/* Area */}
            <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("bookArea")}</h2>
              {areas === null && <Loader2 className="animate-spin text-gray-300" size={18} />}
              {areas?.length === 0 && (
                <p className="text-sm text-gray-600">
                  {t("bookNoAreas")} <Link href="/request" className="font-bold text-indigo-600">→</Link>
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {areas?.map((a) => (
                  <button key={a} type="button" onClick={() => setArea(a)} aria-pressed={area === a}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      area === a ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    <MapPin size={13} /> {a}
                  </button>
                ))}
              </div>
            </section>

            {/* Time */}
            {area && (
              <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("bookPickTime")}</h2>
                  {data && <span className="text-xs text-gray-500">NT$ {data.price_twd.toLocaleString()} {t("bookPerLesson")} · {data.slot_minutes} min</span>}
                </div>

                {loading && <Loader2 className="animate-spin text-gray-300 my-4" size={20} />}
                {!loading && data && data.slots.length === 0 && (
                  <p className="text-sm text-gray-500 py-2">{t("bookNoSlots")}</p>
                )}

                {!loading && byDay.size > 0 && (
                  <>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" role="tablist">
                      {[...byDay.keys()].map((k) => (
                        <button key={k} type="button" role="tab" aria-selected={day === k} onClick={() => { setDay(k); setSlot(""); }}
                          className={`flex-shrink-0 rounded-2xl px-3.5 py-2 text-xs font-bold transition-colors ${
                            day === k ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                          {fmtDay(k, locale)}
                          <span className={`block text-[10px] font-semibold ${day === k ? "text-indigo-100" : "text-gray-400"}`}>
                            {byDay.get(k)!.length}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {(byDay.get(day) ?? []).map((s) => (
                        <button key={s.start} type="button" onClick={() => setSlot(s.start)} aria-pressed={slot === s.start}
                          className={`rounded-xl py-3 text-sm font-bold transition-colors border ${
                            slot === s.start ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400"}`}>
                          {fmtTime(s.start)}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <Link href="/request" className="block mt-4 text-xs font-semibold text-gray-500 hover:text-indigo-600">
                  {t("bookCantFind")}
                </Link>
                {credits === 0 && (
                  <Link href="/packages" className="block mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-500">
                    {t("bookPackagesLink")}
                  </Link>
                )}
              </section>
            )}

            {/* Details */}
            {slot && (
              <form onSubmit={submit} className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-indigo-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                    <Clock size={15} /> {fmtFull(slot, locale)} · {area}
                  </span>
                  <button type="button" onClick={() => setSlot("")} className="text-xs font-semibold text-indigo-600">{t("bookChange")}</button>
                </div>

                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("bookDetails")}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label} htmlFor="parent_name">{t("reqParentName")} *</label>
                    <input id="parent_name" name="parent_name" required maxLength={100} className={input} autoComplete="name" />
                  </div>
                  <div>
                    <label className={label} htmlFor="parent_phone">{t("reqPhone")} *</label>
                    <input id="parent_phone" name="parent_phone" required maxLength={30} inputMode="tel" autoComplete="tel" placeholder="0912 345 678" className={input} />
                  </div>
                </div>
                <div>
                  <span className={label}>{t("reqContactHow")} *</span>
                  <div className="grid grid-cols-4 gap-2">
                    {CONTACTS.map((c) => (
                      <button key={c.value} type="button" onClick={() => setContactMethod(c.value)} aria-pressed={contactMethod === c.value}
                        className={`rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                          contactMethod === c.value ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {t(c.key)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="contact_value">{contactMethod === "line" ? t("reqContactValue") : t("contactValue")} *</label>
                  <input id="contact_value" name="contact_value" required maxLength={200}
                    type={contactMethod === "email" ? "email" : "text"} placeholder={t(contact.placeholder)} className={input} />
                </div>
                <div className="grid grid-cols-[1fr_96px] gap-4">
                  <div>
                    <label className={label} htmlFor="student_name">{t("reqStudentName")} *</label>
                    <input id="student_name" name="student_name" required maxLength={100} className={input} />
                  </div>
                  <div>
                    <label className={label} htmlFor="student_age">{t("reqStudentAge")} *</label>
                    <input id="student_age" name="student_age" required type="number" min={3} max={99} className={input} />
                  </div>
                </div>
                <div>
                  <span className={label}>{t("reqLevel")}</span>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {LEVELS.map((l) => (
                      <button key={l.value} type="button" onClick={() => setLevel(l.value)} aria-pressed={level === l.value}
                        className={`rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-colors ${
                          level === l.value ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {t(l.key)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="notes">{t("reqNotes")}</label>
                  <textarea id="notes" name="notes" rows={2} maxLength={2000} className={input} />
                </div>
                <label className="flex items-start gap-3 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-700 leading-relaxed cursor-pointer">
                  <input type="checkbox" name="account_consent" required className="mt-0.5 accent-indigo-600 w-4 h-4 flex-shrink-0" />
                  <span>{t("consentLabel")}</span>
                </label>

                {credits > 0 && (
                  <label className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 cursor-pointer">
                    <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)}
                      className="accent-emerald-600 w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">{t("bookUseCredit")}</span>
                    <span className="ml-auto text-xs">{credits} {t("bookCreditsLeft")}</span>
                  </label>
                )}

                {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

                <button type="submit" disabled={sending}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black py-4 text-base transition-colors shadow-lg">
                  {sending ? t("bookSending") : payWithCredit ? t("bookSubmitCredit") : `${t("bookSubmit")} · NT$ ${(data?.price_twd ?? 0).toLocaleString()}`}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
