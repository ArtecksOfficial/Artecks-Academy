"use client";
// ─── Coach dashboard: Homework tab ────────────────────────────────────────────
// Set homework for one or more of your students, tick it done at the next
// lesson (fixed rewards: XP to the child, gems to the parent, capped per week),
// or remove homework that isn't done yet. Coaches never choose reward amounts.

import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import { BookOpenCheck, Check, Loader2, Trash2 } from "lucide-react";
import { authHeaders } from "@/lib/auth-client";

interface Rules { xp: number; gems: number; weekly_max: number }
interface Kid { id: number; name: string; age: number; rewarded_this_week: number }
interface Hw {
  id: number; student_id: number; student_name: string; title: string; details: string;
  due_date: string | null; status: "assigned" | "done"; done_at: string | null; rewarded: boolean;
}
interface Data { rules: Rules; students: Kid[]; homework: Hw[] }

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`/api/coach/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: data as T | null };
}

const card = "rounded-3xl bg-white border border-gray-200 p-5";
const field = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm w-full";

export default function HomeworkPanel({ zh }: { zh: boolean }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const r = await api<Data>("homework");
    if (r.ok && r.data) setData(r.data);
    else setErr(zh ? "無法載入作業。" : "Couldn't load homework.");
  }, [zh]);
  useEffect(() => { load(); }, [load]);

  const fmtDate = (d: string) => new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { month: "short", day: "numeric", weekday: "short" }).format(new Date(d.length === 10 ? d + "T00:00:00" : d));
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());

  const open = useMemo(() => (data?.homework ?? []).filter((h) => h.status === "assigned")
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999")), [data]);
  const done = useMemo(() => (data?.homework ?? []).filter((h) => h.status === "done")
    .sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? "")).slice(0, 15), [data]);

  async function markDone(h: Hw) {
    setBusyId(h.id); setErr(null);
    const r = await api<Hw>(`homework/${h.id}/done`, { method: "POST", body: "{}" });
    setBusyId(null);
    if (!r.ok) return setErr(zh ? "無法標記完成，請再試一次。" : "Couldn't mark it done. Please try again.");
    load();
  }

  async function remove(h: Hw) {
    if (!window.confirm(zh ? `刪除「${h.title}」（${h.student_name}）？` : `Remove "${h.title}" for ${h.student_name}?`)) return;
    setBusyId(h.id); setErr(null);
    const r = await api(`homework/${h.id}`, { method: "DELETE" });
    setBusyId(null);
    if (!r.ok) return setErr(zh ? "無法刪除。" : "Couldn't remove it.");
    load();
  }

  if (!data) {
    return err ? <p role="alert" className="text-sm text-red-600">{err}</p> : <Loader2 className="animate-spin text-gray-300" />;
  }

  const { rules } = data;
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-gray-600">
        {zh
          ? `為學生出作業，下次上課時打勾完成。每完成一份：孩子 +${rules.xp} XP、家長 +${rules.gems} 顆寶石（每位孩子每週最多 ${rules.weekly_max} 份有獎勵）。`
          : `Set homework for your students and tick it done at the next lesson. Each one done: +${rules.xp} XP for the child and +${rules.gems} gems for the parent (rewards for up to ${rules.weekly_max} per child each week).`}
      </p>

      <AssignForm zh={zh} kids={data.students} onDone={load} />

      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}

      <section className={card}>
        <h3 className="text-sm font-black text-gray-900">{zh ? `待完成（${open.length}）` : `To do (${open.length})`}</h3>
        {open.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">{zh ? "目前沒有待完成的作業。" : "No open homework."}</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-gray-100">
            {open.map((h) => {
              const kid = data.students.find((k) => k.id === h.student_id);
              const capped = kid ? kid.rewarded_this_week >= rules.weekly_max : false;
              const late = h.due_date && h.due_date < today;
              return (
                <li key={h.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">{h.student_name} · {h.title}</p>
                    {h.details && <p className="mt-0.5 whitespace-pre-line text-xs text-gray-600">{h.details}</p>}
                    <p className="mt-1 text-[11px] text-gray-500">
                      {h.due_date && <span className={late ? "font-semibold text-red-600" : ""}>{zh ? "截止 " : "Due "}{fmtDate(h.due_date)}{late ? (zh ? "（已過期）" : " (overdue)") : ""}</span>}
                      {capped && <span className="ml-2 text-amber-700">{zh ? "本週獎勵已達上限" : "Weekly reward limit reached"}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" disabled={busyId === h.id} onClick={() => markDone(h)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                      {busyId === h.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {zh ? "完成" : "Done"}
                    </button>
                    <button type="button" disabled={busyId === h.id} onClick={() => remove(h)} aria-label={zh ? "刪除" : "Remove"}
                      className="rounded-xl border border-gray-200 px-2.5 py-2 text-gray-500 hover:text-red-600 disabled:opacity-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section className={card}>
          <h3 className="text-sm font-black text-gray-900">{zh ? "最近完成" : "Recently done"}</h3>
          <ul className="mt-3 flex flex-col divide-y divide-gray-100">
            {done.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="text-gray-800">✅ {h.student_name} · {h.title}</span>
                <span className="text-xs text-gray-500">
                  {h.done_at && fmtDate(h.done_at)}{" · "}
                  {h.rewarded ? (zh ? `+${rules.xp} XP、+${rules.gems} 寶石` : `+${rules.xp} XP, +${rules.gems} gems`) : (zh ? "未發獎勵（已達上限）" : "No reward (weekly limit)")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AssignForm({ zh, kids, onDone }: { zh: boolean; kids: Kid[]; onDone: () => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (kids.length === 0) {
    return (
      <section className={card}>
        <p className="text-sm text-gray-500">
          {zh ? "你還沒有學生。學生和你有課（已排定或已上過）後，就會出現在這裡。" : "No students yet. Children appear here once they have a lesson with you (booked or taught)."}
        </p>
      </section>
    );
  }

  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!picked.length || !title.trim()) return;
    setBusy(true); setMsg(null);
    const r = await api<{ detail?: string }>("homework", {
      method: "POST",
      body: JSON.stringify({ student_ids: picked, title: title.trim(), details: details.trim(), due_date: due || null }),
    });
    setBusy(false);
    if (!r.ok) {
      const d = (r.data as { detail?: string } | null)?.detail ?? "";
      return setMsg({ ok: false, text: d.startsWith("Too much")
        ? (zh ? "有學生的待完成作業太多（上限 10 份）。" : "A student already has too much open homework (10 max).")
        : (zh ? "無法新增作業，請再試一次。" : "Couldn't set the homework. Please try again.") });
    }
    setMsg({ ok: true, text: zh ? `已出給 ${picked.length} 位學生。` : `Set for ${picked.length} student${picked.length === 1 ? "" : "s"}.` });
    setPicked([]); setTitle(""); setDetails(""); setDue("");
    onDone();
  }

  return (
    <form onSubmit={submit} className={`${card} flex flex-col gap-3`}>
      <h3 className="inline-flex items-center gap-2 text-sm font-black text-gray-900"><BookOpenCheck size={16} className="text-indigo-600" /> {zh ? "出作業" : "Set homework"}</h3>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-600">{zh ? "給哪些學生" : "For"}</p>
          <button type="button" onClick={() => setPicked(picked.length === kids.length ? [] : kids.map((k) => k.id))}
            className="text-xs font-semibold text-indigo-600">{picked.length === kids.length ? (zh ? "全部取消" : "Clear") : (zh ? "全選" : "Select all")}</button>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {kids.map((k) => {
            const on = picked.includes(k.id);
            return (
              <button key={k.id} type="button" onClick={() => toggle(k.id)} aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${on ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 bg-white text-gray-700"}`}>
                {k.name} <span className={on ? "text-white/70" : "text-gray-400"}>· {k.age}</span>
              </button>
            );
          })}
        </div>
      </div>
      <label className="text-xs font-semibold text-gray-600">{zh ? "作業內容" : "What to do"}
        <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 120))} required
          placeholder={zh ? "例如：完成 10 題一步殺" : "e.g. Solve 10 mate-in-one puzzles"} className={`mt-1 ${field}`} />
      </label>
      <label className="text-xs font-semibold text-gray-600">{zh ? "說明（可選）" : "Details (optional)"}
        <textarea value={details} onChange={(e) => setDetails(e.target.value.slice(0, 1000))} rows={2} className={`mt-1 ${field}`} />
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-gray-600">{zh ? "截止日（可選）" : "Due (optional)"}
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <button type="submit" disabled={busy || !picked.length || !title.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {busy ? "…" : zh ? "出作業" : "Set homework"}
        </button>
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-xs font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}
