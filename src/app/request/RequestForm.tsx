"use client";
// ─── Private lesson request form ──────────────────────────────────────────────
// No slots, no payment, no account. The owner follows up on LINE and assigns
// a coach, time and place from the admin.

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

type ContactMethod = "line" | "whatsapp" | "sms" | "email";

const WINDOWS: { value: string; key: DictionaryKey }[] = [
  { value: "weekday_morning", key: "winWeekdayMorning" },
  { value: "weekday_afternoon", key: "winWeekdayAfternoon" },
  { value: "weekday_evening", key: "winWeekdayEvening" },
  { value: "weekend_morning", key: "winWeekendMorning" },
  { value: "weekend_afternoon", key: "winWeekendAfternoon" },
  { value: "weekend_evening", key: "winWeekendEvening" },
];

const LEVELS: { value: string; key: DictionaryKey }[] = [
  { value: "beginner", key: "chessExpBeginner" },
  { value: "knows_rules", key: "chessExpKnowsRules" },
  { value: "experienced", key: "chessExpExperienced" },
];

const CONTACTS: { value: ContactMethod; key: DictionaryKey; placeholder: DictionaryKey }[] = [
  { value: "line", key: "line", placeholder: "contactPlaceholderLine" },
  { value: "whatsapp", key: "whatsapp", placeholder: "contactPlaceholderWhatsapp" },
  { value: "sms", key: "smsSms", placeholder: "contactPlaceholderSms" },
  { value: "email", key: "emailContact", placeholder: "contactPlaceholderEmail" },
];

const input =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C49A4A] focus:ring-2 focus:ring-[#E7C98A]";
const label = "block text-xs font-semibold text-gray-600 mb-1.5";

export default function RequestForm() {
  const { t, locale } = useLanguage();
  const [contactMethod, setContactMethod] = useState<ContactMethod>("line");
  const [windows, setWindows] = useState<string[]>([]);
  const [level, setLevel] = useState("beginner");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  // /request?type=pair|group comes from the booking page's lesson-type choice.
  const [lessonType, setLessonType] = useState<"" | "pair" | "group">("");
  const zh = locale === "zh";
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("type");
    if (v === "pair" || v === "group") setLessonType(v);
  }, []);
  const typeTag = lessonType === "pair" ? "[Pair lesson / 一對二]" : lessonType === "group" ? "[Group lesson / 小班]" : "";

  function toggleWindow(v: string) {
    setWindows((w) => (w.includes(v) ? w.filter((x) => x !== v) : [...w, v]));
    setError(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (windows.length === 0) {
      setError(t("reqPickWindow"));
      return;
    }
    const f = new FormData(e.currentTarget);
    const payload = {
      parent_name: String(f.get("parent_name") || "").trim(),
      parent_phone: String(f.get("parent_phone") || "").trim(),
      contact_method: contactMethod,
      contact_value: String(f.get("contact_value") || "").trim(),
      student_name: String(f.get("student_name") || "").trim(),
      student_age: Number(f.get("student_age") || 0),
      chess_experience_level: level,
      preferred_windows: windows,
      area: String(f.get("area") || "").trim(),
      notes: [typeTag, String(f.get("notes") || "").trim()].filter(Boolean).join(" "),
      account_consent: f.get("account_consent") === "on",
    };
    setState("sending");
    try {
      const res = await fetch("/api/lesson-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setState("idle");
      setError(t("reqError"));
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-3xl bg-white border border-gray-200 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">♟️</div>
        <h2 className="text-xl font-black text-gray-900">{t("reqDoneTitle")}</h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t("reqDoneBody")}</p>
        <Link href="/" className="inline-block mt-6 text-sm font-bold text-[#A07C34] hover:text-[#8A6A2C]">
          ← {t("reqBackHome")}
        </Link>
      </div>
    );
  }

  const contact = CONTACTS.find((c) => c.value === contactMethod)!;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {lessonType && (
        <div className="rounded-3xl bg-[#13223F] text-white px-5 py-4 shadow-sm">
          <p className="text-sm font-black">
            {lessonType === "pair"
              ? (zh ? "一對二課程 · 每人每堂 NT$1,000" : "Pair lesson · NT$1,000 per student")
              : (zh ? "小班課程（3 人以上）· 每人每堂 NT$800" : "Small group (3+) · NT$800 per student")}
          </p>
          <p className="text-xs text-[#C9D2E3] mt-1">
            {zh ? "我們會依孩子的年齡和程度配對同學，配好後透過 LINE 通知您時間和地點。"
                : "We match kids by age and level, then message you on LINE with the time and place."}
          </p>
        </div>
      )}
      {/* Parent */}
      <section className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("reqParentSection")}</h2>
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
              <button
                key={c.value}
                type="button"
                onClick={() => setContactMethod(c.value)}
                aria-pressed={contactMethod === c.value}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                  contactMethod === c.value ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t(c.key)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={label} htmlFor="contact_value">
            {contactMethod === "line" ? t("reqContactValue") : t("contactValue")} *
          </label>
          <input
            id="contact_value"
            name="contact_value"
            required
            maxLength={200}
            type={contactMethod === "email" ? "email" : "text"}
            placeholder={t(contact.placeholder)}
            className={input}
          />
        </div>
      </section>

      {/* Child */}
      <section className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("reqStudentSection")}</h2>
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
          <div className="flex flex-col gap-2">
            {LEVELS.map((l) => (
              <label key={l.value} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-colors ${
                level === l.value ? "border-[#13223F] bg-[#FBF5E8] text-[#13223F]" : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}>
                <input type="radio" name="level" value={l.value} checked={level === l.value} onChange={() => setLevel(l.value)} className="accent-[#13223F]" />
                {t(l.key)}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("reqPrefsSection")}</h2>
        <div>
          <span className={label}>{t("reqWindows")} *</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WINDOWS.map((w) => {
              const on = windows.includes(w.value);
              return (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => toggleWindow(w.value)}
                  aria-pressed={on}
                  className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                    on ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t(w.key)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className={label} htmlFor="area">{t("reqArea")}</label>
          <input id="area" name="area" maxLength={100} placeholder={t("reqAreaPlaceholder")} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="notes">{t("reqNotes")}</label>
          <textarea id="notes" name="notes" rows={3} maxLength={2000} className={input} />
        </div>
      </section>

      <label className="flex items-start gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-4 text-sm text-gray-700 leading-relaxed cursor-pointer">
        <input type="checkbox" name="account_consent" required className="mt-0.5 accent-[#13223F] w-4 h-4 flex-shrink-0" />
        <span>{t("consentLabel")}</span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-2xl bg-[#13223F] hover:bg-[#1C3157] disabled:opacity-60 text-white font-black py-4 text-base transition-colors shadow-lg"
      >
        {state === "sending" ? t("reqSending") : t("reqSubmit")}
      </button>
    </form>
  );
}
