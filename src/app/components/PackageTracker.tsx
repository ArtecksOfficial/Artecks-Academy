"use client";
// ─── Package tracker — how a lesson package is being used, class by class ────
// Shared by parents (/account) and coaches (/coach → Packages).
// Each package shows a class counter, a month calendar with the lesson days
// marked, and a list where every class says how many are left after it.

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export interface TrackerLesson {
  booking_id: number;
  number: number;
  start: string;
  end: string | null;
  student: string;
  coach: string;
  status: "done" | "upcoming" | "to_confirm";
  left_after: number;
  mine?: boolean;
}

export interface TrackerPackage {
  id: number;
  format: string;
  format_label: string;
  lessons_total: number;
  done: number;
  scheduled: number;
  unbooked: number;
  left: number;
  paid_at: string | null;
  expires_at: string | null;
  is_expired: boolean;
  students: string[];
  lessons: TrackerLesson[];
  family?: string;
}

const TZ = "Asia/Taipei";
// Calendar day (YYYY-MM-DD) of an instant, in Taipei — lessons happen there, wherever the viewer is.
const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const fmtDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { timeZone: TZ, month: "short", day: "numeric", weekday: "short" }).format(new Date(iso));
const fmtDay = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { timeZone: TZ, year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
const fmtTime = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

const STATUS_STYLE: Record<TrackerLesson["status"], { dot: string; chip: string }> = {
  done: { dot: "bg-emerald-600 text-white", chip: "bg-emerald-50 text-emerald-800" },
  upcoming: { dot: "bg-white text-indigo-700 ring-2 ring-indigo-500", chip: "bg-indigo-50 text-indigo-800" },
  to_confirm: { dot: "bg-amber-100 text-amber-900 ring-2 ring-amber-400", chip: "bg-amber-50 text-amber-900" },
};

function statusLabel(s: TrackerLesson["status"], zh: boolean) {
  if (s === "done") return zh ? "已上課" : "Done";
  if (s === "upcoming") return zh ? "已預約" : "Booked";
  return zh ? "待教練確認" : "Waiting for coach";
}

export default function PackageTracker({ packages, zh, forCoach = false }: { packages: TrackerPackage[]; zh: boolean; forCoach?: boolean }) {
  if (packages.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {forCoach
          ? (zh ? "目前沒有學生使用套票。" : "None of your students are on a lesson package yet.")
          : (zh ? "還沒有付款完成的套票。" : "No paid package yet.")}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {packages.map((p) => <PackageCard key={p.id} pkg={p} zh={zh} forCoach={forCoach} />)}
    </div>
  );
}

function PackageCard({ pkg, zh, forCoach }: { pkg: TrackerPackage; zh: boolean; forCoach: boolean }) {
  const locale = zh ? "zh-TW" : "en-US";
  const finished = pkg.left === 0;
  const who = pkg.students.join(zh ? "、" : ", ");
  const title = forCoach && pkg.family ? `${who || pkg.family} · ${pkg.family}` : who;
  const low = !finished && !pkg.is_expired && pkg.left <= 2;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="text-sm font-black text-gray-900">{title || (zh ? "課程套票" : "Lesson package")}</h3>
          <p className="text-xs text-gray-500">
            {pkg.format_label} × {pkg.lessons_total}
            {pkg.expires_at && <> · {zh ? "使用期限 " : "use by "}{fmtDay(pkg.expires_at, locale)}</>}
          </p>
        </div>
        <p className={`text-right ${low ? "text-amber-700" : finished || pkg.is_expired ? "text-gray-500" : "text-indigo-700"}`}>
          <span className="text-3xl font-black leading-none">{pkg.left}</span>
          <span className="ml-1 text-xs font-bold">{zh ? "堂未上" : pkg.left === 1 ? "class left" : "classes left"}</span>
        </p>
      </header>

      {/* One box per class in the package. */}
      <ol className="mt-3 flex flex-wrap gap-1.5" aria-label={zh ? `共 ${pkg.lessons_total} 堂，已上 ${pkg.done} 堂` : `${pkg.done} of ${pkg.lessons_total} classes done`}>
        {Array.from({ length: pkg.lessons_total }, (_, i) => {
          const lesson = pkg.lessons[i];
          const cls = lesson ? STATUS_STYLE[lesson.status].dot : "bg-gray-100 text-gray-400";
          return (
            <li key={i} className={`h-7 w-7 rounded-lg text-[11px] font-bold flex items-center justify-center ${cls}`}
              title={lesson ? `${fmtDate(lesson.start, locale)} · ${statusLabel(lesson.status, zh)}` : (zh ? "尚未預約" : "Not booked yet")}>
              {i + 1}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-gray-600">
        {zh
          ? `已上 ${pkg.done} 堂 · 已預約 ${pkg.scheduled} 堂 · 尚未預約 ${pkg.unbooked} 堂`
          : `${pkg.done} done · ${pkg.scheduled} booked · ${pkg.unbooked} not booked yet`}
        {pkg.is_expired && <span className="ml-2 font-bold text-red-600">{zh ? "已過期" : "Expired"}</span>}
        {low && <span className="ml-2 font-bold text-amber-700">{zh ? "快用完了" : "Almost used up"}</span>}
      </p>

      {pkg.lessons.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,17rem)_1fr]">
          <MonthCalendar lessons={pkg.lessons} zh={zh} />
          <ul className="flex flex-col gap-1.5">
            {pkg.lessons.map((l) => (
              <li key={l.booking_id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 text-xs">
                <span className={`h-6 w-6 shrink-0 rounded-lg font-bold flex items-center justify-center ${STATUS_STYLE[l.status].dot}`}>{l.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-bold text-gray-900">{fmtDate(l.start, locale)} · {fmtTime(l.start, locale)}</span>
                  <span className="block truncate text-gray-500">
                    {[l.student, l.coach && (zh ? `教練 ${l.coach}` : `Coach ${l.coach}`)].filter(Boolean).join(" · ")}
                    {forCoach && l.mine === false && <> · {zh ? "其他教練" : "another coach"}</>}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLE[l.status].chip}`}>{statusLabel(l.status, zh)}</span>
                  <span className="block mt-0.5 text-gray-600">
                    {zh ? `上完剩 ${l.left_after} 堂` : `${l.left_after} left after this`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function MonthCalendar({ lessons, zh }: { lessons: TrackerLesson[]; zh: boolean }) {
  const byDay = useMemo(() => {
    const m = new Map<string, TrackerLesson>();
    lessons.forEach((l) => m.set(dayKey(l.start), l));
    return m;
  }, [lessons]);

  // Open on the next class to come, else the most recent one.
  const initial = useMemo(() => {
    const focus = lessons.find((l) => l.status === "upcoming") ?? lessons[lessons.length - 1];
    const [y, m] = dayKey(focus.start).split("-").map(Number);
    return { y, m };
  }, [lessons]);
  const [view, setView] = useState(initial);

  const first = new Date(Date.UTC(view.y, view.m - 1, 1));
  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
  const lead = first.getUTCDay(); // Sunday first
  const today = dayKey(new Date().toISOString());
  const move = (d: number) => setView(({ y, m }) => {
    const n = new Date(Date.UTC(y, m - 1 + d, 1));
    return { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1 };
  });
  const label = new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { timeZone: "UTC", year: "numeric", month: "long" }).format(first);
  const weekdays = zh ? ["日", "一", "二", "三", "四", "五", "六"] : ["S", "M", "T", "W", "T", "F", "S"];
  const btn = "h-7 w-7 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center";

  return (
    <div className="rounded-xl border border-gray-200 p-3 self-start">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} className={btn} aria-label={zh ? "上個月" : "Previous month"}><ChevronLeft size={16} /></button>
        <p className="text-xs font-bold text-gray-800 inline-flex items-center gap-1.5"><CalendarDays size={13} className="text-indigo-600" /> {label}</p>
        <button type="button" onClick={() => move(1)} className={btn} aria-label={zh ? "下個月" : "Next month"}><ChevronRight size={16} /></button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400">
        {weekdays.map((w, i) => <span key={i}>{w}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[11px]">
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const key = `${view.y}-${String(view.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const lesson = byDay.get(key);
          const cls = lesson ? `${STATUS_STYLE[lesson.status].dot} font-bold` : key === today ? "text-gray-900 font-bold underline" : "text-gray-500";
          return (
            <span key={d} className={`h-7 rounded-lg flex items-center justify-center ${cls}`}
              title={lesson ? (zh ? `第 ${lesson.number} 堂 · 上完剩 ${lesson.left_after} 堂` : `Class ${lesson.number} · ${lesson.left_after} left after this`) : undefined}>
              {d}
            </span>
          );
        })}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
        {(["done", "upcoming", "to_confirm"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded ${STATUS_STYLE[s].dot}`} /> {statusLabel(s, zh)}
          </span>
        ))}
      </p>
    </div>
  );
}
