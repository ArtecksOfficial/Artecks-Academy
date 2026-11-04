"use client";
// ─── Coach dashboard ──────────────────────────────────────────────────────────
// Coaches log in with their own Artecks account (linked by the admin). They
// see only their own sessions and students — never parent contact details —
// and cannot choose reward amounts.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";

interface Student {
  id: number;
  student_name: string;
  student_age: number;
  chess_experience_level: string;
  special_notes: string;
  status: "confirmed" | "attended" | "cancelled";
  skill_tags: string[];
  coach_notes: string;
  generated_summary: string;
  parent_name?: string;
  contact_method?: string;
  contact_value?: string;
}

interface CoachSession {
  id: number;
  title: string;
  topic: string;
  start_time: string;
  end_time: string | null;
  location_name: string;
  location_address: string;
  private_access_notes: string;
  is_private: boolean;
  students: Student[];
}

interface Slot {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  area: string;
  note: string;
}

type Status = "loading" | "anon" | "not_coach" | "ready";

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`/api/coach/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: data as T | null };
}

function fmt(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "zh-TW", {
    timeZone: "Asia/Taipei",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_ZH = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

export default function CoachDashboard() {
  const { user, isLoading, logout } = useAuth();
  const { t, locale } = useLanguage();
  const [status, setStatus] = useState<Status>("loading");
  const [coachName, setCoachName] = useState("");
  const [tab, setTab] = useState<"sessions" | "availability">("sessions");
  const [sessions, setSessions] = useState<CoachSession[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const me = await api<{ name: string }>("me");
    if (me.status === 401) return setStatus("anon");
    if (!me.ok) return setStatus("not_coach");
    setCoachName(me.data?.name ?? "");
    const [s, a] = await Promise.all([api<CoachSession[]>("sessions"), api<Slot[]>("availability")]);
    setSessions(s.data ?? []);
    setSlots(a.data ?? []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setStatus("anon");
      return;
    }
    load().catch(() => setStatus("not_coach"));
  }, [isLoading, user, load]);

  async function markAttended(bookingId: number) {
    setError(null);
    const r = await api(`bookings/${bookingId}/attend`, { method: "POST", body: "{}" });
    if (!r.ok) return setError(t("coachError"));
    setSessions((ss) =>
      ss.map((s) => ({
        ...s,
        students: s.students.map((st) => (st.id === bookingId ? { ...st, status: "attended" } : st)),
      })),
    );
  }

  async function saveReport(bookingId: number, skills: string, notes: string): Promise<boolean> {
    setError(null);
    const skill_tags = skills.split(/[,，、]/).map((x) => x.trim()).filter(Boolean);
    const r = await api<Student>(`bookings/${bookingId}/report`, {
      method: "POST",
      body: JSON.stringify({ skill_tags, coach_notes: notes }),
    });
    if (!r.ok) {
      setError(t("coachError"));
      return false;
    }
    return true;
  }

  async function addSlot(slot: Omit<Slot, "id" | "note">) {
    setError(null);
    const r = await api<Slot>("availability", { method: "POST", body: JSON.stringify(slot) });
    if (!r.ok || !r.data) return setError(t("coachError"));
    setSlots((s) => [...s, r.data!].sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time)));
  }

  async function removeSlot(id: number) {
    setError(null);
    const r = await api(`availability/${id}`, { method: "DELETE" });
    if (!r.ok) return setError(t("coachError"));
    setSlots((s) => s.filter((x) => x.id !== id));
  }

  const weekdays = locale === "en" ? WEEKDAYS_EN : WEEKDAYS_ZH;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB" }}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <span className="text-sm font-black text-gray-900 truncate">{t("coachTitle")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {user && (
              <button onClick={() => logout()} className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1">
                {t("coachLogout")}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {status === "loading" && <p className="text-sm text-gray-400">…</p>}

        {status === "anon" && (
          <div className="rounded-3xl bg-white border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-600 mb-4">{t("coachLoginPrompt")}</p>
            <Link href="/login?next=/coach" className="inline-block rounded-xl bg-indigo-600 text-white font-bold px-6 py-3 text-sm">
              {t("coachLogin")}
            </Link>
          </div>
        )}

        {status === "not_coach" && (
          <div className="rounded-3xl bg-white border border-amber-200 p-8 text-center">
            <p className="text-sm text-amber-800">{t("coachNotCoach")}</p>
          </div>
        )}

        {status === "ready" && (
          <>
            <h1 className="text-2xl font-black text-gray-900 mb-5">{coachName}</h1>
            <div className="flex gap-2 mb-5" role="tablist">
              {(["sessions", "availability"] as const).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    tab === k ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {k === "sessions" ? t("coachTabSessions") : t("coachTabAvailability")}
                </button>
              ))}
            </div>

            {error && <p role="alert" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

            {tab === "sessions" && (
              <div className="flex flex-col gap-4">
                {sessions.length === 0 && <p className="text-sm text-gray-500">{t("coachNoSessions")}</p>}
                {sessions.map((s) => (
                  <SessionCard key={s.id} s={s} locale={locale} t={t} onAttend={markAttended} onSaveReport={saveReport} />
                ))}
              </div>
            )}

            {tab === "availability" && (
              <AvailabilityPanel slots={slots} weekdays={weekdays} t={t} onAdd={addSlot} onRemove={removeSlot} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

type T = ReturnType<typeof useLanguage>["t"];

function SessionCard({
  s, locale, t, onAttend, onSaveReport,
}: {
  s: CoachSession;
  locale: string;
  t: T;
  onAttend: (id: number) => void;
  onSaveReport: (id: number, skills: string, notes: string) => Promise<boolean>;
}) {
  const past = new Date(s.start_time).getTime() < Date.now();
  return (
    <article className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-indigo-600">{fmt(s.start_time, locale)}</p>
          <h2 className="text-base font-black text-gray-900 mt-0.5">{s.title}</h2>
          <p className="text-sm text-gray-600 mt-1">📍 {s.location_name}{s.location_address ? ` · ${s.location_address}` : ""}</p>
          {s.private_access_notes && <p className="text-xs text-gray-500 mt-1">{s.private_access_notes}</p>}
        </div>
        {s.is_private && (
          <span className="flex-shrink-0 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5">
            {t("coachPrivate")}
          </span>
        )}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t("coachStudents")}</p>
        {s.students.length === 0 && <p className="text-sm text-gray-400">{t("coachNoStudents")}</p>}
        <ul className="flex flex-col gap-3">
          {s.students.map((st) => (
            <StudentRow key={st.id} st={st} t={t} canAttend={past || s.is_private} onAttend={onAttend} onSaveReport={onSaveReport} />
          ))}
        </ul>
      </div>
    </article>
  );
}

function StudentRow({
  st, t, canAttend, onAttend, onSaveReport,
}: {
  st: Student;
  t: T;
  canAttend: boolean;
  onAttend: (id: number) => void;
  onSaveReport: (id: number, skills: string, notes: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState(st.skill_tags.join(", "));
  const [notes, setNotes] = useState(st.coach_notes);
  const [saved, setSaved] = useState(false);
  const attended = st.status === "attended";

  return (
    <li className="rounded-2xl bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">
            {st.student_name}{st.student_age ? <span className="font-normal text-gray-500">, {st.student_age}</span> : null}
          </p>
          {st.special_notes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{st.special_notes}</p>}
          {st.contact_value && (
            <p className="text-xs text-gray-600 mt-1">
              {t("coachParent")}: {st.parent_name}
              {" · "}
              {st.contact_method === "line" ? (
                <a href={`https://line.me/R/ti/p/~${encodeURIComponent(st.contact_value.replace(/^@/, ""))}`} target="_blank" rel="noopener noreferrer" className="text-[#06C755] font-semibold">
                  LINE {st.contact_value}
                </a>
              ) : (
                <span>{(st.contact_method ?? "").toUpperCase()} {st.contact_value}</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {attended ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">✓ {t("coachAttended")}</span>
          ) : (
            canAttend && (
              <button onClick={() => onAttend(st.id)} className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full px-3 py-1.5">
                {t("coachAttend")}
              </button>
            )
          )}
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-xs font-semibold text-indigo-600 px-2 py-1.5">
            {t("coachReport")} {open ? "▴" : "▾"}
          </button>
        </div>
      </div>
      {open && (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaved(false);
            if (await onSaveReport(st.id, skills, notes)) setSaved(true);
          }}
        >
          <label className="text-xs font-semibold text-gray-600">
            {t("coachSkills")}
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Tactics, Endgame"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            {t("coachNotes")}
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-xl bg-indigo-600 text-white text-sm font-bold px-4 py-2">{t("coachSave")}</button>
            {saved && <span className="text-xs font-semibold text-emerald-600">✓ {t("coachSaved")}</span>}
          </div>
        </form>
      )}
    </li>
  );
}

function AvailabilityPanel({
  slots, weekdays, t, onAdd, onRemove,
}: {
  slots: Slot[];
  weekdays: string[];
  t: T;
  onAdd: (s: Omit<Slot, "id" | "note">) => void;
  onRemove: (id: number) => void;
}) {
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("21:00");
  const [area, setArea] = useState("");
  const field = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm w-full";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">{t("coachAvailHint")}</p>
      <div className="rounded-3xl bg-white border border-gray-200 p-5">
        {slots.length === 0 && <p className="text-sm text-gray-400">{t("coachAvailNone")}</p>}
        <ul className="flex flex-col divide-y divide-gray-100">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-sm text-gray-800">
                <strong>{weekdays[s.weekday]}</strong> {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                {s.area && <span className="text-gray-500"> · {s.area}</span>}
              </span>
              <button onClick={() => onRemove(s.id)} className="text-xs font-semibold text-red-600 px-2 py-1">{t("coachRemove")}</button>
            </li>
          ))}
        </ul>
      </div>
      <form
        className="rounded-3xl bg-white border border-gray-200 p-5 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (end <= start) return;
          onAdd({ weekday, start_time: start, end_time: end, area: area.trim() });
        }}
      >
        <label className="text-xs font-semibold text-gray-600 col-span-2 sm:col-span-1">
          {t("coachDay")}
          <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className={`mt-1 ${field}`}>
            {weekdays.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-600">
          {t("coachFrom")}
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          {t("coachTo")}
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-xs font-semibold text-gray-600 col-span-2 sm:col-span-1">
          {t("coachArea")}
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Linkou" maxLength={100} className={`mt-1 ${field}`} />
        </label>
        <button type="submit" className="col-span-2 sm:col-span-1 rounded-xl bg-indigo-600 text-white text-sm font-bold px-4 py-2.5">
          {t("coachAdd")}
        </button>
      </form>
    </div>
  );
}
