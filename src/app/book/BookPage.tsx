"use client";
// ─── Slot booking — area → 60-min slot → details → pay / pending ─────────────
// Parents pick a coach and see that coach's own calendar (Nov 2026).
// New families' bookings still wait for the owner to confirm the place.

import SiteHeader from "@/app/components/SiteHeader";
import AuthButton from "@/app/components/AuthButton";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Gem, Loader2, MapPin } from "lucide-react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { ReferralWelcome } from "@/app/components/Referral";
import { captureRef, myReferral, type MyReferral } from "@/lib/referral";
import { IS_NATIVE_BUILD, webUrl } from "@/lib/platform";

interface SlotResp {
  price_twd: number;
  slot_minutes: number;
  max_gems?: number;
  gem_value_twd?: number;
  coaches: { id: number; name: string; title: string; price_twd?: number }[];
  slots: { start: string; end: string }[];
  // First chess lesson of a first-time family is a trial; first_time is null for guests.
  trial_price_twd?: number | null;
  first_time?: boolean | null;
}

// Pair and group lessons are matched by age and level, so they go through a request.
const LESSON_TYPES = [
  { key: "private", en: "1-on-1", zh: "一對一", price: 1200, href: null },
  { key: "pair", en: "Pair (2 kids)", zh: "一對二", price: 1000, href: "/request?type=pair" },
  { key: "group", en: "Small group (3+)", zh: "小班（3 人以上）", price: 800, href: "/request?type=group" },
] as const;

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
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C49A4A] focus:ring-2 focus:ring-[#E7C98A]";
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
  const zh = locale === "zh";
  const router = useRouter();
  const [subjects, setSubjects] = useState<{ key: string; en: string; zh: string; price_twd: number }[]>([]);
  const [subject, setSubject] = useState("chess");
  const [areas, setAreas] = useState<string[] | null>(null);
  const [area, setArea] = useState<string>("");
  const [data, setData] = useState<SlotResp | null>(null);
  // Parents pick the coach; each coach's calendar is shown on its own.
  const [coachList, setCoachList] = useState<SlotResp["coaches"]>([]);
  const [coach, setCoach] = useState<number | null>(null);
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
  const [gems, setGems] = useState(0);
  const [useGems, setUseGems] = useState(true);

  useEffect(() => {
    if (!user) { setCredits(0); setGems(0); return; }
    fetch("/api/packages/mine", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setCredits(d?.credits?.private ?? 0); setGems(d?.gems ?? 0); })
      .catch(() => {});
  }, [user]);
  // Lesson packages are chess packages for now.
  const payWithCredit = subject === "chess" && credits > 0 && useCredit;
  // Family gems take up to the server's cap off a single lesson (the server re-checks).
  const gemsAvailable = Math.min(gems, data?.max_gems ?? 0);
  const gemsToUse = !payWithCredit && useGems ? gemsAvailable : 0;
  const gemDiscount = gemsToUse * (data?.gem_value_twd ?? 3);

  // Referral half-off (the server decides; this only previews it for signed-in parents):
  // a new family through an invite link, or a sharing family with a reward waiting.
  const [mineRef, setMineRef] = useState<MyReferral | null>(null);
  useEffect(() => {
    if (!user) { setMineRef(null); return; }
    myReferral(authHeaders(), ref).then(setMineRef);
  }, [user, ref]);
  const refKind = mineRef?.welcome_available ? "welcome" : (mineRef?.rewards_available ?? 0) > 0 ? "reward" : "";
  const refDiscount = !payWithCredit && refKind ? Math.floor((data?.price_twd ?? 0) / 2) : 0;
  // Trial: shown unless we know this family isn't new, or a referral/package already applies.
  const trialPrice = data?.trial_price_twd ?? null;
  const showTrial = !!trialPrice && data?.first_time !== false && !payWithCredit && !refDiscount && !ref;
  const trialDiscount = showTrial ? Math.max(0, (data?.price_twd ?? 0) - (trialPrice ?? 0)) : 0;
  const priceToPay = Math.max(0, (data?.price_twd ?? 0) - gemDiscount - refDiscount - trialDiscount);
  const coachName = coachList.find((c) => c.id === coach)?.name.split(" ")[0] ?? "";
  const subjectLabel = subjects.find((x) => x.key === subject) ?? { en: "Chess", zh: "西洋棋" };

  useEffect(() => {
    // Referral links look like /book?ref=ABC1234; the code is kept for 30 days.
    setRef(captureRef());
  }, []);

  useEffect(() => {
    // /book?subject=english opens straight on English
    const want = new URLSearchParams(window.location.search).get("subject") ?? "";
    fetch("/api/slots?subjects=1").then((r) => r.json()).then((list) => {
      if (!Array.isArray(list)) return;
      setSubjects(list);
      if (list.some((x: { key: string }) => x.key === want)) setSubject(want);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setAreas(null); setArea(""); setData(null); setSlot("");
    fetch(`/api/slots?subject=${subject}`).then((r) => r.json()).then((a: string[]) => {
      setAreas(Array.isArray(a) ? a : []);
      if (Array.isArray(a) && a.length === 1) setArea(a[0]);
    }).catch(() => setAreas([]));
  }, [subject]);

  useEffect(() => {
    // Which coaches teach here: one call without a coach filter.
    setCoachList([]); setCoach(null); setData(null);
    if (!area) return;
    const p = new URLSearchParams({ area, days: "14", subject });
    fetch(`/api/slots?${p.toString()}`, { headers: authHeaders() }).then((r) => r.json()).then((d: SlotResp) => {
      const list = d?.coaches ?? [];
      setCoachList(list);
      if (list.length === 1) setCoach(list[0].id);
    }).catch(() => setCoachList([]));
  }, [area, subject, user]);

  useEffect(() => {
    if (!area || coach == null) return;
    setLoading(true);
    setSlot("");
    const p = new URLSearchParams({ area, days: "14", subject, coach: String(coach) });
    fetch(`/api/slots?${p.toString()}`, { headers: authHeaders() }).then((r) => r.json()).then((d: SlotResp) => {
      setData(d);
      const first = d.slots?.[0];
      setDay(first ? tpeDayKey(first.start) : "");
    }).catch(() => setData(null)).finally(() => setLoading(false));
  }, [area, subject, user, coach]);

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
          coach,
          gems: gemsToUse,
          subject,
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
          // iOS app: payment runs on the web site (opens in Safari).
          if (IS_NATIVE_BUILD) window.location.href = webUrl(u.pathname + u.search);
          else router.push(u.pathname + u.search);
        } catch {
          window.location.href = IS_NATIVE_BUILD ? webUrl(body.pay_url) : body.pay_url;
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
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <SiteHeader />

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col gap-5">
        {!mineRef || mineRef.welcome_available ? <ReferralWelcome code={ref} /> : null}
        {pending ? (
          <div className="rounded-3xl bg-white border border-gray-200 p-8 text-center shadow-sm">
            <CheckCircle size={44} className="mx-auto text-emerald-500 mb-3" />
            <h1 className="text-xl font-black text-gray-900">{t("bookPendingTitle")}</h1>
            <p className="text-sm font-semibold text-[#A07C34] mt-2">{fmtFull(pending.start, locale)} · {area}</p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{t("bookPendingBody")}</p>
            <Link href="/" className="inline-block mt-6 text-sm font-bold text-[#A07C34]">← {t("reqBackHome")}</Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-serif-tc text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{t("bookTitle")}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">{t("bookSub")}</p>
              {subjects.length <= 1 && (
                <span className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-bold text-[#13223F]">
                  ♟ {zh ? subjectLabel.zh : subjectLabel.en} · {zh ? "全英語授課" : "taught in English"}
                </span>
              )}
            </div>

            {showTrial && (
              <div className="rounded-3xl bg-[#13223F] text-white px-5 py-4 shadow-sm">
                <p className="text-sm font-black">🎁 {zh ? `第一次來？第一堂一對一是體驗課：NT$ ${trialPrice!.toLocaleString()}` : `New here? Your first 1-on-1 lesson is a trial: NT$ ${trialPrice!.toLocaleString()}`}</p>
                <p className="text-xs text-[#C9D2E3] mt-1">
                  {zh ? `原價 NT$ ${(data?.price_twd ?? 0).toLocaleString()}。選個時間就好，不用另外申請。之後的課程照原價。`
                      : `Normally NT$ ${(data?.price_twd ?? 0).toLocaleString()}. Just pick a time below, no code needed. Lessons after that are the normal price.`}
                </p>
              </div>
            )}

            {/* Lesson type */}
            <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{zh ? "上課方式" : "Lesson type"}</h2>
              <div className="grid sm:grid-cols-3 gap-2">
                {LESSON_TYPES.map((lt) => {
                  const body = (
                    <>
                      <span className="block text-sm font-bold">{zh ? lt.zh : lt.en}</span>
                      <span className={`block text-xs mt-0.5 ${lt.href ? "text-gray-500" : "text-[#E7C98A]"}`}>
                        {lt.href
                          ? <>NT$ {lt.price.toLocaleString()} / {zh ? "人・堂" : "student"}{zh ? " · 依年齡程度配對" : " · we match kids by age & level"}</>
                          : (zh ? "價格依教練而定，選教練時會看到" : "Each coach sets their price; you'll see it below")}
                      </span>
                    </>
                  );
                  return lt.href ? (
                    <Link key={lt.key} href={lt.href} className="rounded-2xl px-4 py-3 text-left bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      {body}
                      <span className="block text-[11px] font-bold text-[#A07C34] mt-1">{zh ? "申請配對 →" : "Request a match →"}</span>
                    </Link>
                  ) : (
                    <div key={lt.key} aria-current="true" className="rounded-2xl px-4 py-3 text-left bg-[#13223F] text-white">
                      {body}
                      <span className="block text-[11px] font-bold text-[#E7C98A] mt-1">{zh ? "直接選下方時間" : "Pick a time below"}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Subject */}
            {subjects.length > 1 && (
              <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{zh ? "想學什麼？" : "What would you like to learn?"}</h2>
                <div className="grid grid-cols-2 gap-2 sm:max-w-md">
                  {subjects.map((x) => (
                    <button key={x.key} type="button" onClick={() => setSubject(x.key)} aria-pressed={subject === x.key}
                      className={`rounded-2xl px-4 py-3 text-left transition-colors ${
                        subject === x.key ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                      <span className="block text-sm font-bold">{zh ? x.zh : x.en}</span>
                      <span className={`block text-xs mt-0.5 ${subject === x.key ? "text-[#E7C98A]" : "text-gray-500"}`}>NT$ {x.price_twd.toLocaleString()} / {zh ? "堂" : "lesson"}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Area */}
            <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("bookArea")}</h2>
              {areas === null && <Loader2 className="animate-spin text-gray-300" size={18} />}
              {areas?.length === 0 && (
                <p className="text-sm text-gray-600">
                  {t("bookNoAreas")} <Link href="/request" className="font-bold text-[#A07C34]">→</Link>
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {areas?.map((a) => (
                  <button key={a} type="button" onClick={() => setArea(a)} aria-pressed={area === a}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      area === a ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    <MapPin size={13} /> {a}
                  </button>
                ))}
              </div>
              {area && (
                <p className="text-xs text-gray-500 mt-3">
                  {zh ? `確切上課地點（${area}）會在預約後透過 LINE 與您確認。` : `We'll confirm the exact place in ${area} with you on LINE after you book.`}
                </p>
              )}
            </section>

            {/* Coach */}
            {area && coachList.length > 0 && (
              <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{zh ? "選擇教練" : "Pick a coach"}</h2>
                  <Link href="/coaches" className="text-xs font-bold text-[#A07C34] hover:text-[#8A6A2C]">{zh ? "認識教練 →" : "Meet the coaches →"}</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {coachList.map((c) => (
                    <button key={c.id} type="button" onClick={() => { setCoach(c.id); setSlot(""); }} aria-pressed={coach === c.id}
                      className={`rounded-2xl px-4 py-2.5 text-left transition-colors ${
                        coach === c.id ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                      <span className="block text-sm font-bold">{c.name}</span>
                      {c.title && <span className={`block text-[11px] ${coach === c.id ? "text-[#E7C98A]" : "text-gray-500"}`}>{c.title}</span>}
                      {c.price_twd != null && (
                        <span className={`mt-0.5 block text-xs font-bold ${coach === c.id ? "text-white" : "text-[#13223F]"}`}>
                          NT$ {c.price_twd.toLocaleString()} {zh ? "／堂" : "/ lesson"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Time */}
            {area && coach != null && (
              <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("bookPickTime")}</h2>
                  {data && <span className="text-xs text-gray-500">{coachName ? `${coachName} · ` : ""}NT$ {data.price_twd.toLocaleString()} {t("bookPerLesson")} · {data.slot_minutes} min</span>}
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
                            day === k ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                          {fmtDay(k, locale)}
                          <span className={`block text-[10px] font-semibold ${day === k ? "text-[#E7C98A]" : "text-gray-400"}`}>
                            {byDay.get(k)!.length}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {(byDay.get(day) ?? []).map((s) => (
                        <button key={s.start} type="button" onClick={() => setSlot(s.start)} aria-pressed={slot === s.start}
                          className={`rounded-xl py-3 text-sm font-bold transition-colors border ${
                            slot === s.start ? "bg-[#13223F] text-white border-[#13223F]"
                              : "bg-white text-[#A07C34] border-[#E7C98A] hover:border-[#C49A4A]"}`}>
                          {fmtTime(s.start)}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <Link href="/request" className="block mt-3 text-xs font-semibold text-gray-500 hover:text-[#8A6A2C]">
                  {t("bookCantFind")}
                </Link>
                {subject === "chess" && credits === 0 && (
                  <Link href="/packages" className="block mt-2 text-xs font-bold text-[#A07C34] hover:text-[#8A6A2C]">
                    {t("bookPackagesLink")}
                  </Link>
                )}
              </section>
            )}

            {/* Details */}
            {slot && (
              <form onSubmit={submit} className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#FBF5E8] px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-[#13223F]">
                    <Clock size={15} /> {fmtFull(slot, locale)} · {area}{coachName ? ` · ${coachName}` : ""}
                  </span>
                  <button type="button" onClick={() => setSlot("")} className="text-xs font-semibold text-[#A07C34]">{t("bookChange")}</button>
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
                          contactMethod === c.value ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
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
                          level === l.value ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
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
                  <input type="checkbox" name="account_consent" required className="mt-0.5 accent-[#13223F] w-4 h-4 flex-shrink-0" />
                  <span>{t("consentLabel")}</span>
                </label>

                {subject === "chess" && credits > 0 && (
                  <label className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 cursor-pointer">
                    <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)}
                      className="accent-emerald-600 w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">{t("bookUseCredit")}</span>
                    <span className="ml-auto text-xs">{credits} {t("bookCreditsLeft")}</span>
                  </label>
                )}

                {!payWithCredit && gemsAvailable > 0 && (
                  <label className="flex items-center gap-3 rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3 text-sm text-[#13223F] cursor-pointer">
                    <input type="checkbox" checked={useGems} onChange={(e) => setUseGems(e.target.checked)}
                      className="accent-[#C49A4A] w-4 h-4 flex-shrink-0" />
                    <Gem size={15} className="text-[#A07C34] flex-shrink-0" />
                    <span className="font-semibold">
                      {zh ? `使用 ${gemsAvailable} 顆寶石折抵 NT$ ${(gemsAvailable * (data?.gem_value_twd ?? 3)).toLocaleString()}`
                          : `Use ${gemsAvailable} gems for NT$ ${(gemsAvailable * (data?.gem_value_twd ?? 3)).toLocaleString()} off`}
                    </span>
                    <span className="ml-auto text-xs text-[#5B6478]">{zh ? `共 ${gems} 顆` : `${gems} gems`}</span>
                  </label>
                )}

                {refDiscount > 0 && (
                  <p className="flex items-center justify-between rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3 text-sm font-semibold text-[#13223F]">
                    <span>🎁 {t(refKind === "reward" ? "refDiscountReward" : "refDiscountWelcome")}</span>
                    <span>− NT$ {refDiscount.toLocaleString()}</span>
                  </p>
                )}

                {showTrial && trialDiscount > 0 && (
                  <p className="flex items-center justify-between rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3 text-sm font-semibold text-[#13223F]">
                    <span>🎁 {zh ? "體驗課（新家庭第一堂）" : "Trial lesson (new family's first lesson)"}</span>
                    <span>− NT$ {trialDiscount.toLocaleString()}</span>
                  </p>
                )}
                {showTrial && data?.first_time == null && (
                  <p className="text-[11px] text-gray-500 -mt-2">
                    {zh ? "已經上過課的家庭將以原價計算，下一頁會顯示實際金額。" : "Families who've had lessons before pay the normal price; the next page shows the exact amount."}
                  </p>
                )}

                {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

                <button type="submit" disabled={sending}
                  className="w-full rounded-2xl bg-[#13223F] hover:bg-[#1C3157] disabled:opacity-60 text-white font-black py-4 text-base transition-colors shadow-lg">
                  {sending ? t("bookSending") : payWithCredit ? t("bookSubmitCredit") : `${t("bookSubmit")} · NT$ ${priceToPay.toLocaleString()}`}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
