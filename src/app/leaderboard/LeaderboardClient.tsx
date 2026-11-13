"use client";
// ─── Kids' XP leaderboard — by age group, this month / all time ──────────────
// Opted-in kids only, nicknames only. Parents manage their kids below.

import SiteHeader from "@/app/components/SiteHeader";
import AuthButton from "@/app/components/AuthButton";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Trophy } from "lucide-react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import LineLoginButton from "@/app/components/LineLoginButton";

interface Row { rank: number; name: string; xp: number; mine: boolean }
interface Board { period: string; prize: string; lesson_xp: number; arena_xp?: { participation: number; win: number; podium: number[] }; groups: { key: string; label: string; rows: Row[] }[] }
interface Kid {
  id: number; first_name: string; nickname: string; leaderboard_opt_in: boolean;
  age: number; age_group: string; display_name: string; xp_month: number; xp_total: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500";

export default function LeaderboardClient() {
  const { t, locale } = useLanguage();
  const { user, isLoading } = useAuth();
  const [period, setPeriod] = useState<"month" | "all">("all");
  const [board, setBoard] = useState<Board | null>(null);
  const [group, setGroup] = useState("8-10");
  const [kids, setKids] = useState<Kid[] | null>(null);

  const loadBoard = useCallback(() => {
    fetch(`/api/leaderboard?period=${period}`, { headers: authHeaders() })
      .then((r) => r.json()).then((d: Board) => setBoard(Array.isArray(d?.groups) ? d : { period, prize: "", lesson_xp: 100, groups: [] })).catch(() => setBoard({ period, prize: "", lesson_xp: 100, groups: [] }));
  }, [period]);
  useEffect(() => { loadBoard(); }, [loadBoard, user]);

  const loadKids = useCallback(() => {
    fetch("/api/students", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : [])).then((d) => setKids(Array.isArray(d) ? d : [])).catch(() => setKids([]));
  }, []);
  useEffect(() => { if (user) loadKids(); }, [user, loadKids]);

  // Open on my child's age group the first time kids load
  useEffect(() => { if (kids?.length) setGroup(kids[0].age_group); }, [kids?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = board?.groups?.find((g) => g.key === group)?.rows ?? [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F6F2" }}>
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-5">
        <div>
          <h1 className="font-serif-tc text-3xl sm:text-4xl font-black text-gray-900 tracking-tight inline-flex items-center gap-3">
            <Trophy className="text-amber-500" size={32} /> {t("lbTitle")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">{t("lbSub")}</p>
          {board?.prize && <p className="mt-3 inline-block rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5">🏆 {board.prize}</p>}
        </div>

        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex gap-2 overflow-x-auto" role="tablist">
              {(board?.groups ?? []).map((g) => (
                <button key={g.key} type="button" role="tab" aria-selected={group === g.key} onClick={() => setGroup(g.key)}
                  className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    group === g.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {g.label} {t("lbGroup")}
                </button>
              ))}
            </div>
            <div className="flex rounded-full bg-gray-100 p-0.5 flex-shrink-0">
              {(["month", "all"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPeriod(p)} aria-pressed={period === p}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${period === p ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                  {p === "month" ? t("lbMonth") : t("lbAll")}
                </button>
              ))}
            </div>
          </div>

          {board === null && <Loader2 className="animate-spin text-gray-300" size={20} />}
          {board && rows.length === 0 && <p className="text-sm text-gray-500 py-6 text-center">{t("lbEmpty")}</p>}
          <ol className="flex flex-col gap-1.5">
            {rows.map((r, i) => (
              <li key={`${r.rank}-${r.name}-${i}`}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${r.mine ? "bg-indigo-50 ring-2 ring-indigo-300" : i < 3 ? "bg-amber-50/60" : "bg-gray-50"}`}>
                <span className="w-8 text-center text-lg font-black text-gray-700">{r.rank <= 3 ? MEDAL[r.rank - 1] : r.rank}</span>
                <span className="flex-1 text-sm font-bold text-gray-900 truncate">
                  {r.name}
                  {r.mine && <span className="ml-2 text-[10px] font-bold text-indigo-600 uppercase">{t("lbYou")}</span>}
                </span>
                <span className="text-sm font-black text-indigo-700 tabular-nums">{r.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-gray-900">{t("lbHowTitle")}</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-gray-700">
            <li className="flex justify-between"><span>{t("lbHow1")}</span><b className="text-indigo-700">+{board?.lesson_xp ?? 100} XP</b></li>
            {board?.arena_xp && (
              <>
                <li className="flex justify-between"><span>{t("lbHowArena")}</span><b className="text-indigo-700">+{board.arena_xp.participation} XP</b></li>
                <li className="flex justify-between"><span>{t("lbHowArenaWin")}</span><b className="text-indigo-700">+{board.arena_xp.win} XP</b></li>
                {board.arena_xp.podium.length > 0 && (
                  <li className="flex justify-between"><span>{t("lbHowArenaPodium")}</span><b className="text-indigo-700">{board.arena_xp.podium.map((x) => `+${x}`).join(" / ")} XP</b></li>
                )}
              </>
            )}
            <li className="flex justify-between"><span>{t("lbHow2")}</span><b className="text-indigo-700">+XP</b></li>
            <li className="text-gray-400">{t("lbHow3")}</li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-black text-gray-900">{t("lbKidsTitle")}</h2>
          {!user && !isLoading ? (
            <>
              <p className="text-sm text-gray-600">{t("lbKidsLogin")}</p>
              <LineLoginButton next="/leaderboard" label={t("pkgLoginLine")} />
              <Link href="/login?next=/leaderboard" className="text-center text-sm font-bold text-indigo-600">{t("pkgLoginEmail")}</Link>
            </>
          ) : (
            <>
              {(kids ?? []).map((k) => <KidCard key={k.id} kid={k} onChange={() => { loadKids(); loadBoard(); }} />)}
              <AddKid onAdded={loadKids} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

async function send(path: string, method: string, body?: object) {
  return fetch(`/api/students${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);
}

export function KidCard({ kid, onChange }: { kid: Kid; onChange: () => void }) {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState(kid.nickname);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function patch(body: object) {
    setBusy(true);
    setErr(false);
    const r = await send(`/${kid.id}`, "PATCH", body);
    setBusy(false);
    if (!r || !r.ok) setErr(true);
    else onChange();
  }

  return (
    <div className="rounded-2xl bg-gray-50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-gray-900">{kid.first_name} · {kid.age}</span>
        <span className="text-xs text-gray-600 text-right">
          {t("lbThisMonth")} <b className="text-indigo-700">{kid.xp_month}</b> · {t("lbTotal")} <b>{kid.xp_total}</b>
        </span>
      </div>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input type="checkbox" checked={kid.leaderboard_opt_in} disabled={busy}
          onChange={(e) => patch({ leaderboard_opt_in: e.target.checked })} className="accent-indigo-600 w-4 h-4" />
        <span className="font-semibold text-gray-800">{t("lbOptIn")}</span>
      </label>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); patch({ nickname }); }}>
        <input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 20))} placeholder={kid.first_name}
          aria-label={t("lbNickname")} className={input} />
        <button type="submit" disabled={busy || nickname === kid.nickname}
          className="rounded-xl bg-indigo-600 disabled:opacity-40 text-white text-xs font-bold px-4 whitespace-nowrap">{t("lbSave")}</button>
      </form>
      {err && <p role="alert" className="text-xs text-red-600">{t("lbError")}</p>}
    </div>
  );
}

export function AddKid({ onAdded }: { onAdded: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    const r = await send("", "POST", {
      first_name: String(f.get("first_name") || "").trim(),
      age: Number(f.get("age") || 0),
      nickname: String(f.get("nickname") || "").trim(),
      leaderboard_opt_in: f.get("opt_in") === "on",
    });
    setBusy(false);
    if (r?.ok) {
      setOpen(false);
      onAdded();
      return;
    }
    const d = await r?.json().catch(() => ({}));
    setErr(d?.detail === "duplicate" ? t("lbDuplicate") : t("lbError"));
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-xl border-2 border-dashed border-indigo-300 text-indigo-700 text-sm font-bold px-4 py-2.5">
        + {t("lbAddKid")}
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-2xl border border-indigo-200 p-4 flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_80px] gap-3">
        <input name="first_name" required maxLength={50} placeholder={t("lbFirstName")} aria-label={t("lbFirstName")} className={input} />
        <input name="age" required type="number" min={3} max={99} placeholder={t("lbAge")} aria-label={t("lbAge")} className={input} />
      </div>
      <div>
        <input name="nickname" maxLength={20} placeholder={t("lbNickname")} aria-label={t("lbNickname")} className={input} />
        <p className="text-[11px] text-gray-500 mt-1">{t("lbNickHint")}</p>
      </div>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input type="checkbox" name="opt_in" className="accent-indigo-600 w-4 h-4" />
        <span className="font-semibold text-gray-800">{t("lbOptIn")}</span>
      </label>
      {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="rounded-xl bg-indigo-600 disabled:opacity-60 text-white text-sm font-bold py-2.5">
        {busy ? "…" : t("lbAddKid")}
      </button>
    </form>
  );
}
