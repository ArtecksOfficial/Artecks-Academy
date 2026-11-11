"use client";
// ─── Coach dashboard: Academy Arena results ───────────────────────────────────
// The owner creates the event in admin. A coach ticks who played, enters wins
// and the podium place; the server works out the XP from fixed rules. Coaches
// never type an XP amount. Saving again corrects a result, it never adds twice.

import { useEffect, useMemo, useState } from "react";
import { authHeaders } from "@/lib/auth-client";
import type { useLanguage } from "@/lib/i18n/LanguageContext";

type T = ReturnType<typeof useLanguage>["t"];

interface Rules { participation: number; win: number; podium: number[] }
interface Result { student_id: number; name: string; wins: number; placement: number | null; xp: number }
interface ArenaEvent { id: number; name: string; date: string; results: Result[] }
interface Kid { id: number; name: string; age: number; age_group: string }
interface ArenaData { rules: Rules; events: ArenaEvent[]; students: Kid[] }
interface Row { played: boolean; wins: number; placement: number | null }

const MAX_WINS = 20;

async function call<D>(path: string, init?: RequestInit): Promise<D | null> {
  const res = await fetch(`/api/coach/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as D | null;
}

function xpFor(rules: Rules, row: Row): number {
  const podium = row.placement ? rules.podium[row.placement - 1] ?? 0 : 0;
  return rules.participation + row.wins * rules.win + podium;
}

function rowsFor(event: ArenaEvent | undefined): Record<number, Row> {
  const rows: Record<number, Row> = {};
  for (const r of event?.results ?? []) rows[r.student_id] = { played: true, wins: r.wins, placement: r.placement };
  return rows;
}

export default function ArenaPanel({ t }: { t: T }) {
  const [data, setData] = useState<ArenaData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [eventId, setEventId] = useState<number | null>(null);
  const [rows, setRows] = useState<Record<number, Row>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<"saved" | "error" | null>(null);

  useEffect(() => {
    call<ArenaData>("arena").then((d) => {
      if (!d) return setState("failed");
      setData(d);
      setEventId(d.events[0]?.id ?? null);
      setRows(rowsFor(d.events[0]));
      setState("ready");
    });
  }, []);

  const event = useMemo(() => data?.events.find((e) => e.id === eventId), [data, eventId]);
  const saved = useMemo(() => new Set(event?.results.map((r) => r.student_id)), [event]);

  function pickEvent(id: number) {
    setEventId(id);
    setRows(rowsFor(data?.events.find((e) => e.id === id)));
    setMsg(null);
  }

  function edit(id: number, patch: Partial<Row>) {
    setMsg(null);
    setRows((r) => ({ ...r, [id]: { ...(r[id] ?? { played: true, wins: 0, placement: null }), ...patch } }));
  }

  async function save() {
    if (!event || !data) return;
    const results = Object.entries(rows)
      .filter(([, r]) => r.played)
      .map(([id, r]) => ({ student_id: Number(id), wins: r.wins, placement: r.placement }));
    if (results.length === 0) return;
    setSaving(true);
    setMsg(null);
    const updated = await call<ArenaEvent>(`arena/${event.id}/results`, { method: "POST", body: JSON.stringify({ results }) });
    setSaving(false);
    if (!updated) return setMsg("error");
    setData({ ...data, events: data.events.map((e) => (e.id === updated.id ? updated : e)) });
    setRows(rowsFor(updated));
    setMsg("saved");
  }

  if (state === "loading") return <p className="text-sm text-gray-400">…</p>;
  if (state === "failed" || !data) return <p role="alert" className="text-sm text-red-600">{t("coachError")}</p>;
  if (data.events.length === 0) return <p className="text-sm text-gray-500">{t("arenaNoEvents")}</p>;

  const { rules } = data;
  const field = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm";
  const playedCount = Object.values(rows).filter((r) => r.played).length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">{t("arenaHint")}</p>

      <div className="rounded-3xl bg-white border border-gray-200 p-5 flex flex-col gap-3">
        <label className="text-xs font-semibold text-gray-600">
          {t("arenaEvent")}
          <select value={eventId ?? ""} onChange={(e) => pickEvent(Number(e.target.value))} className={`mt-1 w-full ${field}`}>
            {data.events.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.date}</option>)}
          </select>
        </label>
        <p className="text-xs text-gray-500">
          {t("arenaRules")
            .replace("{p}", String(rules.participation))
            .replace("{w}", String(rules.win))
            .replace("{podium}", rules.podium.map((x) => `+${x}`).join(" / "))}
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-gray-200 p-5">
        {data.students.length === 0 && <p className="text-sm text-gray-400">{t("arenaNoKids")}</p>}
        <ul className="flex flex-col divide-y divide-gray-100">
          {data.students.map((k) => {
            const row = rows[k.id] ?? { played: false, wins: 0, placement: null };
            const locked = saved.has(k.id); // already saved: correct the numbers, only the owner can remove
            return (
              <li key={k.id} className="py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <label className="flex items-center gap-2.5 min-w-0 flex-1 basis-40">
                  <input
                    type="checkbox"
                    checked={row.played}
                    disabled={locked}
                    onChange={(e) => edit(k.id, { played: e.target.checked })}
                    className="h-5 w-5 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-800 truncate">
                    <strong>{k.name}</strong> <span className="text-gray-400">· {k.age}</span>
                  </span>
                </label>
                {row.played && (
                  <>
                    <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      {t("arenaWins")}
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={MAX_WINS}
                        value={row.wins}
                        onChange={(e) => edit(k.id, { wins: Math.max(0, Math.min(MAX_WINS, Math.floor(Number(e.target.value)) || 0)) })}
                        className={`w-16 ${field}`}
                      />
                    </label>
                    <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      {t("arenaPlace")}
                      <select
                        value={row.placement ?? ""}
                        onChange={(e) => edit(k.id, { placement: e.target.value ? Number(e.target.value) : null })}
                        className={field}
                      >
                        <option value="">—</option>
                        {rules.podium.map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                      </select>
                    </label>
                    <span className="text-sm font-black text-indigo-700 tabular-nums ml-auto">+{xpFor(rules, row)} XP</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || playedCount === 0}
          className="rounded-xl bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 disabled:opacity-40"
        >
          {saving ? "…" : t("arenaSave").replace("{n}", String(playedCount))}
        </button>
        {msg === "saved" && <span role="status" className="text-sm font-semibold text-emerald-700">{t("arenaSaved")}</span>}
        {msg === "error" && <span role="alert" className="text-sm font-semibold text-red-600">{t("coachError")}</span>}
      </div>
      <p className="text-xs text-gray-400">{t("arenaUndoNote")}</p>
    </div>
  );
}
