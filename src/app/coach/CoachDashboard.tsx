"use client";
// ─── Coach dashboard ──────────────────────────────────────────────────────────
// Coaches log in with their own Artecks account (linked by the admin). They
// see only their own sessions and students — never parent contact details —
// and cannot choose reward amounts.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { announceCoachTab } from "@/app/components/ModeContext";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import ArenaPanel from "./ArenaPanel";
import CoachCalendar from "./CoachCalendar";
import HomeworkPanel from "./HomeworkPanel";
import ProfilePanel from "./ProfilePanel";
import CreateClassForm from "./CreateClassForm";
import { PRICE_REVIEWED_KEY } from "./PriceCard";
import PackageTracker, { TrackerPackage } from "@/app/components/PackageTracker";
import { LINGO_URL, parseWords } from "@/lib/lingo";

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
  student_id?: number | null;
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
  awaiting_approval?: boolean;
  max_seats?: number;
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
const COACH_TABS = ["sessions", "homework", "availability", "profile", "packages", "feedback", "arena"] as const;
type CoachTab = (typeof COACH_TABS)[number];

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
  const [tab, setTabState] = useState<CoachTab>("sessions");
  // The tab lives in the URL (/coach?tab=homework) so the coach-mode menu can link to it.
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const q = search.get("tab") as CoachTab | null;
    const next = q && COACH_TABS.includes(q) ? q : "sessions";
    setTabState(next);
    announceCoachTab(next);
  }, [search]);
  const setTab = (k: CoachTab) => {
    setTabState(k);
    announceCoachTab(k);
    router.replace(`${pathname}?tab=${k}`, { scroll: false });
  };
  // Packages tab: how many classes each of this coach's students has left.
  const [packages, setPackages] = useState<TrackerPackage[] | null>(null);
  const [fb, setFb] = useState<{ count: number; avg_rating: number | null; avg_enjoyment: number | null; comments: string[]; comments_hidden_until: number } | null>(null);
  const [sessions, setSessions] = useState<CoachSession[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [approval, setApproval] = useState<"approved" | "pending" | "rejected">("approved");
  // Setup still missing: LINE booking alerts and/or the payout bank account.
  const [setup, setSetup] = useState<{ line: boolean; payout: boolean; price: boolean }>({ line: true, payout: true, price: true });

  const load = useCallback(async () => {
    const me = await api<{ name: string; approval_status?: "approved" | "pending" | "rejected"; line_alerts_on?: boolean; payout_ready?: boolean; price_private_twd?: number | null }>("me");
    if (me.status === 401) return setStatus("anon");
    if (!me.ok) return setStatus("not_coach");
    setCoachName(me.data?.name ?? "");
    setApproval(me.data?.approval_status ?? "approved");
    let reviewed = false;
    try { reviewed = localStorage.getItem(PRICE_REVIEWED_KEY) === "1"; } catch { /* private mode */ }
    // Price is "done" once the coach set one, or saved/kept the standard price once.
    setSetup({ line: me.data?.line_alerts_on !== false, payout: me.data?.payout_ready !== false,
               price: !!me.data?.price_private_twd || reviewed });
    const [s, a, f] = await Promise.all([api<CoachSession[]>("sessions"), api<Slot[]>("availability"), api<typeof fb>("feedback")]);
    setSessions(s.data ?? []);
    setSlots(a.data ?? []);
    setFb(f.data ?? null);
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

  // Reload whenever the tab is opened, so counts are right after marking a class attended.
  useEffect(() => {
    if (tab !== "packages" || status !== "ready") return;
    api<{ packages: TrackerPackage[] }>("packages").then((r) => setPackages(r.ok && r.data ? r.data.packages : []));
  }, [tab, status]);

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
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
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

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {status === "loading" && <p className="text-sm text-gray-400">…</p>}

        {status === "anon" && (
          <div className="rounded-3xl bg-white border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-600 mb-4">{t("coachLoginPrompt")}</p>
            <Link href="/login?next=/coach" className="inline-block rounded-xl bg-[#13223F] text-white font-bold px-6 py-3 text-sm">
              {t("coachLogin")}
            </Link>
          </div>
        )}

        {status === "not_coach" && (
          <div className="rounded-3xl bg-white border border-amber-200 p-8 text-center">
            <p className="text-sm text-amber-800">{t("coachNotCoach")}</p>
            <Link href="/teach" className="mt-4 inline-block rounded-xl bg-[#13223F] text-white font-bold px-6 py-3 text-sm">
              {locale === "zh" ? "申請成為老師" : "Sign up as a teacher"}
            </Link>
          </div>
        )}

        {status === "ready" && (
          <>
            <h1 className="font-serif-tc text-2xl font-black text-gray-900 mb-5">{coachName}</h1>
            {approval === "pending" && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-bold">{locale === "zh" ? "⏳ 等待審核中" : "⏳ Waiting for approval"}</p>
                <p className="mt-1">
                  {locale === "zh"
                    ? "家長暫時還看不到你。先在「我的檔案」完成介紹，並在「可上課時間」設定時間、地點與休假；審核通過後就會出現在網站和預約行事曆上。"
                    : "Parents can't see you yet. Finish your Profile and set your hours, places and days off under Availability. Once approved, you'll appear on the site and in the booking calendar."}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-5" role="tablist">
              {COACH_TABS.map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    tab === k ? "bg-[#13223F] text-white" : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {k === "profile" ? (locale === "zh" ? "我的檔案" : "Profile") : k === "sessions" ? t("coachTabSessions") : k === "homework" ? (locale === "zh" ? "作業" : "Homework") : k === "packages" ? t("coachTabPackages") : k === "availability" ? t("coachTabAvailability") : k === "feedback" ? t("coachTabFeedback") : t("coachTabArena")}
                </button>
              ))}
            </div>

            {(!setup.line || !setup.payout || !setup.price) && tab !== "profile" && (
              <div role="alert" className="mb-5 rounded-2xl bg-[#FBF5E8] border-2 border-[#C49A4A] px-5 py-4">
                <p className="text-sm font-black text-[#13223F]">
                  {locale === "zh" ? "⚠️ 還差一步才能開始接課" : "⚠️ Finish setting up so you don't miss bookings or pay"}
                </p>
                <ul className="mt-2 text-sm text-[#13223F] list-disc pl-5">
                  {!setup.line && <li>{locale === "zh" ? "連結 LINE 並加 Artecks Academy 為好友（家長預約你時會通知你）" : "Connect LINE and add Artecks Academy as a friend (you get a message for every booking)"}</li>}
                  {!setup.payout && <li>{locale === "zh" ? "填寫收款帳戶（學院把課酬匯到這裡）" : "Add your payout bank account (where the academy pays you)"}</li>}
                  {!setup.price && <li>{locale === "zh" ? "設定你的一對一課程價格（或使用標準價格）" : "Set your 1-on-1 lesson price (or keep the standard price)"}</li>}
                </ul>
                <button type="button" onClick={() => setTab("profile")}
                  className="mt-3 rounded-xl bg-[#13223F] px-4 py-2 text-sm font-bold text-white">
                  {locale === "zh" ? "前往設定 →" : "Set it up now →"}
                </button>
              </div>
            )}

            {error && <p role="alert" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

            {tab === "sessions" && (
              <div className="flex flex-col gap-4">
                <CreateClassForm zh={locale === "zh"} onCreated={load} />
                {sessions.length === 0 && <p className="text-sm text-gray-500">{t("coachNoSessions")}</p>}
                {sessions.map((s) => (
                  <SessionCard key={s.id} s={s} locale={locale} t={t} onAttend={markAttended} onSaveReport={saveReport} />
                ))}
              </div>
            )}

            {tab === "feedback" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    [t("coachFbCount"), fb?.count ?? 0],
                    [t("coachFbRating"), fb?.avg_rating ?? "—"],
                    [t("coachFbEnjoy"), fb?.avg_enjoyment ?? "—"],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="rounded-2xl bg-white border border-gray-200 p-4 text-center">
                      <p className="text-2xl font-black text-gray-900">{v}</p>
                      <p className="text-[11px] font-semibold text-gray-500 mt-1">{k}</p>
                    </div>
                  ))}
                </div>
                {fb && fb.comments.length === 0 && (
                  <p className="text-sm text-gray-500">{t("coachFbHidden").replace("{n}", String(fb.comments_hidden_until))}</p>
                )}
                {fb?.comments.map((c, i) => (
                  <blockquote key={i} className="rounded-2xl bg-white border border-gray-200 p-4 text-sm text-gray-700 leading-relaxed">“{c}”</blockquote>
                ))}
              </div>
            )}

            {tab === "packages" && (
              packages === null
                ? <p className="text-sm text-gray-400">…</p>
                : <PackageTracker packages={packages} zh={locale === "zh"} forCoach />
            )}

            {tab === "arena" && <ArenaPanel t={t} />}

            {tab === "homework" && <HomeworkPanel zh={locale === "zh"} />}

            {tab === "profile" && <ProfilePanel zh={locale === "zh"} onSaved={(name) => setCoachName(name)} />}

            {tab === "availability" && (
              <div className="flex flex-col gap-6">
                <CoachCalendar zh={locale === "zh"} refreshKey={slots.length} />
                <div>
                  <h3 className="mb-2 text-sm font-black text-gray-900">{locale === "zh" ? "每週固定可上課時段" : "Weekly hours"}</h3>
                  <AvailabilityPanel slots={slots} weekdays={weekdays} t={t} onAdd={addSlot} onRemove={removeSlot} />
                </div>
              </div>
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
          <p className="text-xs font-semibold text-[#A07C34]">{fmt(s.start_time, locale)}</p>
          <h2 className="text-base font-black text-gray-900 mt-0.5">{s.title}</h2>
          <p className="text-sm text-gray-600 mt-1">📍 {s.location_name}{s.location_address ? ` · ${s.location_address}` : ""}</p>
          {s.private_access_notes && <p className="text-xs text-gray-500 mt-1">{s.private_access_notes}</p>}
        </div>
        {s.is_private && (
          <span className="flex-shrink-0 text-[11px] font-bold text-[#A07C34] bg-[#FBF5E8] border border-[#E7C98A] rounded-full px-2.5 py-0.5">
            {t("coachPrivate")}
          </span>
        )}
        {s.awaiting_approval && (
          <span className="flex-shrink-0 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-0.5">
            {locale === "zh" ? "等待學院審核" : "Waiting for approval"}
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
  const [words, setWords] = useState("");
  const [wordNote, setWordNote] = useState<string | null>(null);
  const attended = st.status === "attended";
  const { locale } = useLanguage();
  const zh = locale === "zh";

  async function addWords(): Promise<void> {
    const list = parseWords(words);
    if (!st.student_id || !list.length) return;
    const r = await fetch(`/api/lingo/students/${st.student_id}/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ language: "en", words: list }),
    }).catch(() => null);
    const d = r?.ok ? await r.json().catch(() => ({})) : null;
    if (!d) { setWordNote(zh ? "單字沒有加入，請再試一次。" : "Couldn't add the words. Please try again."); return; }
    const added = d.added?.length ?? 0, skipped = d.skipped?.length ?? 0;
    setWordNote(zh ? `已加入 ${added} 個單字${skipped ? `，${skipped} 個已存在` : ""}。`
                   : `Added ${added} word${added === 1 ? "" : "s"} to Lingo${skipped ? `, ${skipped} already there` : ""}.`);
    if (added) setWords("");
  }

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
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-xs font-semibold text-[#A07C34] px-2 py-1.5">
            {t("coachReport")} {open ? "▴" : "▾"}
          </button>
        </div>
      </div>
      {open && (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaved(false); setWordNote(null);
            if (await onSaveReport(st.id, skills, notes)) setSaved(true);
            await addWords();
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
          {st.student_id ? (
            <label className="text-xs font-semibold text-gray-600">
              {zh ? "今天的英文單字（會加入孩子的 Lingo 單字庫）" : "Today's English words (added to the child's Lingo word bank)"}
              <textarea value={words} onChange={(e) => setWords(e.target.value)} rows={3}
                placeholder={"brave = 勇敢的 | The knight is brave.\ndiagonal = 對角線"}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-sm" />
              <span className="mt-1 block font-normal text-gray-500">
                {zh ? "每行一個：單字 = 中文意思 | 例句（意思和例句可省略）。任何科目都可以。" : "One per line: word = Chinese meaning | example (both optional). Any subject."}
              </span>
            </label>
          ) : (
            <p className="text-xs text-gray-500">
              {zh ? "這位孩子還沒有 Artecks 帳號，所以還不能加入 Lingo 單字。" : "This child has no Artecks profile yet, so Lingo words can't be added."}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="rounded-xl bg-[#13223F] text-white text-sm font-bold px-4 py-2">{t("coachSave")}</button>
            {saved && <span className="text-xs font-semibold text-emerald-600">✓ {t("coachSaved")}</span>}
            {wordNote && <span role="status" className="text-xs font-semibold text-emerald-700">{wordNote}</span>}
            {st.student_id && (
              <a href={`${LINGO_URL}/coach`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#A07C34]">
                {zh ? "在 Lingo 勾選用出的單字 →" : "Tick used words on Lingo →"}
              </a>
            )}
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
        <button type="submit" className="col-span-2 sm:col-span-1 rounded-xl bg-[#13223F] text-white text-sm font-bold px-4 py-2.5">
          {t("coachAdd")}
        </button>
      </form>
    </div>
  );
}
