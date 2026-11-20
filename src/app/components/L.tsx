"use client";
// <L en="…" zh="…" />: one language at a time, also inside server components.
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function L({ en, zh }: { en: string; zh: string }) {
  return <>{useLanguage().locale === "zh" ? zh : en}</>;
}

/** A date/time in the reader's language (Taipei time). */
export function LDate({ iso, opts }: { iso: string; opts: Intl.DateTimeFormatOptions }) {
  const zh = useLanguage().locale === "zh";
  return <>{new Date(iso).toLocaleString(zh ? "zh-TW" : "en-US", { timeZone: "Asia/Taipei", ...opts })}</>;
}
