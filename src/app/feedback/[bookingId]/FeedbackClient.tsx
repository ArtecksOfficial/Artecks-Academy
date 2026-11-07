"use client";

import SiteHeader from "@/app/components/SiteHeader";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Gem, Loader2, Star } from "lucide-react";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";

interface FbInfo {
  status: "ok" | "not_attended" | "too_late" | "done";
  title: string;
  start_time: string;
  coach_name: string;
  student_name: string;
  gems: number;
  reward_claimed: boolean;
}

function Stars({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}`}
            onClick={() => onChange(n)} className="p-1">
            <Star size={30} className={n <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackClient({ bookingId, token }: { bookingId: string; token: string }) {
  const { t, locale } = useLanguage();
  const { user, isLoading } = useAuth();
  const [info, setInfo] = useState<FbInfo | null | undefined>(undefined);
  const [rating, setRating] = useState(0);
  const [enjoyment, setEnjoyment] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ credited: number; needsLogin: boolean } | null>(null);

  const self = `/feedback/${bookingId}?t=${encodeURIComponent(token)}`;

  useEffect(() => {
    if (!/^\d+$/.test(bookingId) || !token) return setInfo(null);
    fetch(`/api/feedback/${bookingId}?t=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null)).then(setInfo).catch(() => setInfo(null));
  }, [bookingId, token]);

  async function claim() {
    setError(null);
    const r = await fetch(`/api/feedback/${bookingId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ t: token }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setError(t("coachError"));
    setResult({ credited: d.gems_credited ?? 0, needsLogin: false });
    setInfo((i) => (i ? { ...i, reward_claimed: true } : i));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!rating || !enjoyment) return setError(t("fbPickStars"));
    if (comment.trim().length < 20) return setError(t("fbCommentShort"));
    setSending(true);
    try {
      const r = await fetch(`/api/feedback/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user ? authHeaders() : {}) },
        body: JSON.stringify({ t: token, rating, enjoyment, comment: comment.trim() }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.detail ?? String(r.status));
      setResult({ credited: d.gems_credited ?? 0, needsLogin: !!d.needs_login_to_claim });
      setInfo((i) => (i ? { ...i, status: "done", reward_claimed: (d.gems_credited ?? 0) > 0 } : i));
    } catch {
      setError(t("coachError"));
    } finally {
      setSending(false);
    }
  }

  const card = "rounded-3xl bg-white border border-gray-200 p-6 shadow-sm";
  let body: React.ReactNode;
  if (info === undefined || isLoading) {
    body = <Loader2 className="animate-spin text-gray-300 mx-auto" />;
  } else if (info === null) {
    body = <div className={card}><p className="text-sm text-gray-600">{t("payNotFoundBody")}</p></div>;
  } else if (result || info.status === "done") {
    const unclaimed = !info.reward_claimed;
    body = (
      <div className={`${card} text-center`}>
        <h1 className="text-xl font-black text-gray-900">{t("fbThanksTitle")}</h1>
        <p className="text-sm text-gray-600 mt-2">{t("fbThanksBody")}</p>
        {result && result.credited > 0 && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-50 text-violet-700 font-bold text-sm px-4 py-2">
            <Gem size={15} /> +{result.credited} {t("fbGems")}
          </p>
        )}
        {unclaimed && (
          <div className="mt-5 rounded-2xl bg-violet-50 border border-violet-100 p-4">
            <p className="text-sm text-violet-900 font-semibold">{t("fbClaimPrompt").replace("{n}", String(info.gems))}</p>
            {user ? (
              <button onClick={claim} className="mt-3 rounded-xl bg-violet-600 text-white text-sm font-bold px-5 py-2.5">{t("fbClaim")}</button>
            ) : (
              <div className="mt-3 flex justify-center gap-2">
                <Link href={`/login?next=${encodeURIComponent(self)}`} className="rounded-xl bg-violet-600 text-white text-sm font-bold px-5 py-2.5">{t("coachLogin")}</Link>
                <Link href={`/signup?next=${encodeURIComponent(self)}`} className="rounded-xl bg-white border border-violet-200 text-violet-700 text-sm font-bold px-5 py-2.5">{t("fbSignup")}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  } else if (info.status !== "ok") {
    body = (
      <div className={card}>
        <p className="text-sm text-gray-600">{info.status === "too_late" ? t("fbTooLate") : t("fbNotYet")}</p>
      </div>
    );
  } else {
    body = (
      <form onSubmit={submit} className={`${card} flex flex-col gap-5`}>
        <div>
          <h1 className="font-serif-tc text-2xl font-black text-gray-900">{t("fbTitle")}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {info.student_name} · {info.coach_name} · {new Date(info.start_time).toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", { timeZone: "Asia/Taipei", month: "long", day: "numeric" })}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-50 text-violet-700 font-semibold text-xs px-3 py-1.5">
            <Gem size={13} /> {t("fbReward").replace("{n}", String(info.gems))}
          </p>
        </div>
        <Stars value={rating} onChange={setRating} label={t("fbRating")} />
        <Stars value={enjoyment} onChange={setEnjoyment} label={t("fbEnjoyment")} />
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1.5">{t("fbComment")}</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={3000}
            placeholder={t("fbCommentPlaceholder")}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
          <span className="text-[11px] text-gray-400">{comment.trim().length}/20+</span>
        </label>
        <p className="text-xs text-gray-500">{t("fbPrivacy")}</p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={sending}
          className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black py-4">
          {sending ? "…" : t("fbSubmit")}
        </button>
      </form>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F6F2" }}>
      <SiteHeader />
      <main className="max-w-lg mx-auto px-4 py-8">{body}</main>
    </div>
  );
}
