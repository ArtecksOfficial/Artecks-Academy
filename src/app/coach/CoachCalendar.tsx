"use client";
// ─── Teacher calendar: month view, days off, Google / Outlook / iCloud sync ──
// Lives on the coach dashboard's Availability tab, above the weekly windows.
// Days off and busy times from the linked calendar remove the teacher's slots
// from the parent booking calendar.

import { useCallback, useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth-client";

const TZ = "Asia/Taipei";

interface Lesson { id: number; start: string; end: string; title: string; location: string; students: string[] }
interface Day {
  date: string; off: boolean;
  windows: { start: string; end: string; area: string }[];
  lessons: Lesson[];
  busy: { start: string; end: string }[];
}
interface LinkStatus { connected: boolean; link: string; synced_at: string | null; error: string; busy_count: number }
interface Month { month: string; days: Day[]; outside_calendar: LinkStatus }
interface TimeOff { id: number; start_date: string; end_date: string; note: string }

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`/api/coach/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: data as T | null };
}

const pad = (n: number) => String(n).padStart(2, "0");
const thisMonth = () => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
};
const shiftMonth = (m: string, by: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + by, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const todayISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

export default function CoachCalendar({ zh, refreshKey }: { zh: boolean; refreshKey: number }) {
  const [month, setMonth] = useState(thisMonth);
  const [data, setData] = useState<Month | null>(null);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [m, t] = await Promise.all([api<Month>(`calendar?month=${month}`), api<TimeOff[]>("time-off")]);
    if (m.ok && m.data) setData(m.data);
    if (t.ok && t.data) setTimeOff(t.data);
  }, [month]);

  useEffect(() => { load().catch(() => {}); }, [load, refreshKey]);

  const loc = zh ? "zh-TW" : "en-US";
  const fmtTime = (iso: string) => new Intl.DateTimeFormat(loc, { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
  const fmtDate = (d: string) => new Intl.DateTimeFormat(loc, { month: "short", day: "numeric", weekday: "short" }).format(new Date(d + "T00:00:00"));
  const monthLabel = new Intl.DateTimeFormat(loc, { year: "numeric", month: "long" }).format(new Date(month + "-01T00:00:00"));
  const weekdayHead = zh ? ["一", "二", "三", "四", "五", "六", "日"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  async function addOff(start: string, end: string, note: string) {
    setError(null);
    const r = await api<TimeOff | { detail?: string; non_field_errors?: string[] }>("time-off", {
      method: "POST", body: JSON.stringify({ start_date: start, end_date: end || start, note }),
    });
    if (!r.ok) {
      const d = r.data as { non_field_errors?: string[]; detail?: string } | null;
      return setError(d?.non_field_errors?.[0] ?? d?.detail ?? (zh ? "無法新增，請再試一次。" : "Couldn't add that. Please try again."));
    }
    await load();
  }

  async function removeOff(id: number) {
    await api(`time-off/${id}`, { method: "DELETE" });
    await load();
  }

  const days = data?.days ?? [];
  const lead = days.length ? (new Date(days[0].date + "T00:00:00").getDay() + 6) % 7 : 0;
  const pickedDay = days.find((d) => d.date === picked) ?? null;
  const today = todayISO();

  return (
    <div className="flex flex-col gap-4">
      {/* Month grid */}
      <section className="rounded-3xl bg-white border border-gray-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => { setMonth((m) => shiftMonth(m, -1)); setPicked(null); }}
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100" aria-label={zh ? "上個月" : "Previous month"}>‹</button>
          <h2 className="text-base font-black text-gray-900">{monthLabel}</h2>
          <button type="button" onClick={() => { setMonth((m) => shiftMonth(m, 1)); setPicked(null); }}
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100" aria-label={zh ? "下個月" : "Next month"}>›</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />{zh ? "可上課" : "Available"}</span>
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-[#13223F]" />{zh ? "已排課" : "Lesson"}</span>
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />{zh ? "行事曆忙碌" : "Busy (your calendar)"}</span>
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-gray-300" />{zh ? "休假" : "Day off"}</span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400">
          {weekdayHead.map((w) => <div key={w}>{w}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: lead }).map((_, i) => <div key={`x${i}`} />)}
          {days.map((d) => {
            const n = Number(d.date.slice(8));
            const past = d.date < today;
            return (
              <button key={d.date} type="button" onClick={() => setPicked(d.date === picked ? null : d.date)}
                className={`flex min-h-[3.5rem] flex-col items-start rounded-lg border p-1.5 text-left transition-colors ${
                  d.date === picked ? "border-[#13223F] ring-2 ring-[#E7C98A]" : "border-gray-100 hover:border-gray-300"
                } ${d.off ? "bg-gray-100" : "bg-white"} ${past ? "opacity-50" : ""}`}
                aria-label={`${fmtDate(d.date)}${d.off ? (zh ? "，休假" : ", day off") : ""}`}>
                <span className={`text-xs font-bold ${d.date === today ? "rounded-full bg-[#13223F] px-1.5 text-white" : "text-gray-700"}`}>{n}</span>
                <span className="mt-auto flex flex-wrap gap-0.5">
                  {!d.off && d.windows.length > 0 && <i className="h-2 w-2 rounded-full bg-emerald-400" />}
                  {d.lessons.map((l) => <i key={l.id} className="h-2 w-2 rounded-full bg-[#13223F]" />)}
                  {d.busy.length > 0 && <i className="h-2 w-2 rounded-full bg-amber-400" />}
                  {d.off && <span className="text-[10px] font-semibold text-gray-500">{zh ? "休" : "Off"}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {pickedDay && (
          <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm">
            <p className="font-bold text-gray-900">{fmtDate(pickedDay.date)}</p>
            {pickedDay.off ? (
              <p className="mt-1 text-gray-600">{zh ? "休假，家長無法預約這天。" : "Day off. Parents can't book you this day."}</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5 text-gray-700">
                {pickedDay.windows.map((w, i) => (
                  <li key={`w${i}`}>🟢 {w.start}–{w.end}{w.area && <span className="text-gray-500"> · {w.area}</span>}</li>
                ))}
                {pickedDay.lessons.map((l) => (
                  <li key={l.id}>🔵 {fmtTime(l.start)}–{fmtTime(l.end)} · {l.students.join(", ") || l.title}
                    {l.location && <span className="text-gray-500"> · {l.location}</span>}</li>
                ))}
                {pickedDay.busy.map((b, i) => (
                  <li key={`b${i}`}>🟡 {fmtTime(b.start)}–{fmtTime(b.end)} <span className="text-gray-500">{zh ? "（你的行事曆）" : "(your calendar)"}</span></li>
                ))}
                {!pickedDay.windows.length && !pickedDay.lessons.length && !pickedDay.busy.length && (
                  <li className="text-gray-500">{zh ? "這天沒有開放時段。" : "No open hours this day."}</li>
                )}
              </ul>
            )}
            {!pickedDay.off && pickedDay.date >= today && (
              <button type="button" onClick={() => addOff(pickedDay.date, pickedDay.date, "")}
                className="mt-3 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100">
                {zh ? "這天請假" : "Take this day off"}
              </button>
            )}
          </div>
        )}
      </section>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <TimeOffPanel zh={zh} items={timeOff} onAdd={addOff} onRemove={removeOff} fmtDate={fmtDate} />
      <OutsideCalendar zh={zh} status={data?.outside_calendar ?? null} onChange={load} fmtTime={fmtTime} />
    </div>
  );
}

function TimeOffPanel({ zh, items, onAdd, onRemove, fmtDate }: {
  zh: boolean; items: TimeOff[]; onAdd: (s: string, e: string, n: string) => void; onRemove: (id: number) => void; fmtDate: (d: string) => string;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const field = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm w-full";
  return (
    <section className="rounded-3xl bg-white border border-gray-200 p-5">
      <h3 className="text-sm font-black text-gray-900">{zh ? "請假 / 休假日" : "Days off"}</h3>
      <p className="mt-0.5 text-xs text-gray-500">{zh ? "這些日子你的時段不會出現在預約行事曆上。已排的課不會自動取消，請通知 Academy。" : "Your slots disappear from the booking calendar on these days. Lessons already booked aren't cancelled. Tell the academy."}</p>
      {items.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-gray-100">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-gray-800">
                <strong>{fmtDate(t.start_date)}</strong>{t.end_date !== t.start_date && <> – <strong>{fmtDate(t.end_date)}</strong></>}
                {t.note && <span className="text-gray-500"> · {t.note}</span>}
              </span>
              <button type="button" onClick={() => onRemove(t.id)} className="px-2 py-1 text-xs font-semibold text-red-600">{zh ? "移除" : "Remove"}</button>
            </li>
          ))}
        </ul>
      )}
      <form className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end"
        onSubmit={(e) => { e.preventDefault(); if (!start) return; onAdd(start, end, note.trim()); setStart(""); setEnd(""); setNote(""); }}>
        <label className="text-xs font-semibold text-gray-600">{zh ? "第一天" : "First day"}
          <input type="date" required value={start} onChange={(e) => setStart(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-xs font-semibold text-gray-600">{zh ? "最後一天（可留空）" : "Last day (optional)"}
          <input type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="text-xs font-semibold text-gray-600 col-span-2 sm:col-span-1">{zh ? "備註" : "Note"}
          <input value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder={zh ? "例如：出國" : "e.g. Holiday"} className={`mt-1 ${field}`} />
        </label>
        <button type="submit" className="col-span-2 sm:col-span-1 rounded-xl bg-[#13223F] px-4 py-2.5 text-sm font-bold text-white">{zh ? "新增" : "Add"}</button>
      </form>
    </section>
  );
}

function OutsideCalendar({ zh, status, onChange, fmtTime }: {
  zh: boolean; status: LinkStatus | null; onChange: () => void; fmtTime: (iso: string) => string;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  async function send(init: RequestInit) {
    setBusy(true); setMsg(null);
    const r = await api<LinkStatus & { detail?: string }>("calendar-link", init);
    setBusy(false);
    if (!r.ok) setMsg(r.data?.detail ?? r.data?.error ?? (zh ? "無法連結，請再試一次。" : "Couldn't connect. Please try again."));
    else setUrl("");
    onChange();
  }

  const syncedAgo = status?.synced_at
    ? new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(new Date(status.synced_at)) + " " + fmtTime(status.synced_at)
    : null;

  return (
    <section className="rounded-3xl bg-white border border-gray-200 p-5">
      <h3 className="text-sm font-black text-gray-900">{zh ? "同步 Google 行事曆" : "Sync your Google Calendar"}</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        {zh ? "你行事曆上的忙碌時間會自動擋掉預約時段（每 15 分鐘更新）。也支援 Outlook 與 iCloud。" : "Busy times in your calendar automatically block booking slots (updated every 15 minutes). Outlook and iCloud work too."}
      </p>

      {status?.connected ? (
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <p className="text-gray-800">✅ {zh ? "已連結" : "Connected"} <span className="text-gray-400 text-xs">{status.link}</span></p>
          {syncedAgo && <p className="text-xs text-gray-500">{zh ? `上次同步：${syncedAgo}，${status.busy_count} 個忙碌時段` : `Last synced ${syncedAgo} · ${status.busy_count} busy time${status.busy_count === 1 ? "" : "s"}`}</p>}
          {status.error && <p role="alert" className="text-xs text-red-600">{status.error}</p>}
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => send({ method: "POST", body: "{}" })}
              className="rounded-xl bg-[#13223F] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? "…" : zh ? "立即同步" : "Sync now"}</button>
            <button type="button" disabled={busy} onClick={() => send({ method: "DELETE" })}
              className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50">{zh ? "取消連結" : "Disconnect"}</button>
          </div>
        </div>
      ) : (
        <form className="mt-3 flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => { e.preventDefault(); if (url.trim()) send({ method: "POST", body: JSON.stringify({ url: url.trim() }) }); }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" aria-label={zh ? "行事曆私人網址" : "Calendar private address"} />
          <button type="submit" disabled={busy || !url.trim()} className="rounded-xl bg-[#13223F] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "…" : zh ? "連結" : "Connect"}
          </button>
        </form>
      )}
      {msg && <p role="alert" className="mt-2 text-xs text-red-600">{msg}</p>}

      <button type="button" onClick={() => setShowHelp((v) => !v)} className="mt-3 text-xs font-semibold text-[#A07C34]">
        {showHelp ? "▾" : "▸"} {zh ? "如何取得 Google 行事曆的私人網址？" : "Where do I find my Google Calendar's private address?"}
      </button>
      {showHelp && (
        <ol className="mt-2 list-decimal pl-5 text-xs text-gray-600 space-y-1">
          {zh ? (
            <>
              <li>在電腦上開啟 Google 日曆，點右上角齒輪 → 設定。</li>
              <li>在左側「我的日曆設定」點選你的日曆。</li>
              <li>往下捲到「整合日曆」，複製「iCal 格式的私人網址」。</li>
              <li>貼到上方欄位並按「連結」。這個網址請勿分享給其他人。</li>
            </>
          ) : (
            <>
              <li>Open Google Calendar on a computer, click the gear icon → Settings.</li>
              <li>Under “Settings for my calendars” on the left, click your calendar.</li>
              <li>Scroll to “Integrate calendar” and copy “Secret address in iCal format”.</li>
              <li>Paste it above and press Connect. Don&apos;t share this address with anyone else.</li>
            </>
          )}
        </ol>
      )}
    </section>
  );
}
