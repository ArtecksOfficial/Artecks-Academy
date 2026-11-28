"use client";
// ─── Kids' XP leaderboard — every age on one board, this month / all time ─────
// Every kid, by first name only (Nov 2026). Parents manage their kids below.

import SiteHeader from "@/app/components/SiteHeader";
import AuthButton from "@/app/components/AuthButton";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import LineLoginButton from "@/app/components/LineLoginButton";
import { DEFAULT_RULES, type LingoRules } from "@/lib/lingo";

interface Row { rank: number; name: string; xp: number; mine: boolean }
interface Board { period: string; prize: string; lesson_xp: number; arena_xp?: { participation: number; win: number; podium: number[] }; homework_xp?: number; groups: { key: string; label: string; rows: Row[] }[] }
interface Kid {
  id: number; first_name: string; nickname: string; leaderboard_opt_in: boolean;
  age: number; age_group: string; display_name: string; xp_month: number; xp_total: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#C49A4A]";

export default function LeaderboardClient() {
  const { t, locale } = useLanguage();
  const { user, isLoading } = useAuth();
  const [period, setPeriod] = useState<"month" | "all">("all");
  const [board, setBoard] = useState<Board | null>(null);
  const [kids, setKids] = useState<Kid[] | null>(null);
  // English-word XP: the backend's Lingo rules when signed in, else the defaults.
  const [wordXp, setWordXp] = useState<LingoRules>(DEFAULT_RULES);
  useEffect(() => {
    if (!user) return;
    fetch("/api/lingo/me", { headers: authHeaders() }).then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.rules && typeof d.rules.remembered_xp === "number") setWordXp(d.rules); }).catch(() => {});
  }, [user]);

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

  // One board for every age (Nov 28 2026). Older backends only send age groups: merge them.
  const rows = useMemo(() => {
    const all = board?.groups?.find((g) => g.key === "all")?.rows;
    if (all) return all;
    const merged = (board?.groups ?? []).flatMap((g) => g.rows).sort((a, b) => b.xp - a.xp);
    let rank = 0;
    return merged.map((r, i) => {
      if (i === 0 || merged[i - 1].xp !== r.xp) rank = i + 1;
      return { ...r, rank };
    });
  }, [board]);

  // 10 kids per page; open on the page with my child the first time the board loads.
  const PAGE = 10;
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const [page, setPage] = useState(0);
  useEffect(() => {
    const mine = rows.findIndex((r) => r.mine);
    setPage(mine >= 0 ? Math.floor(mine / PAGE) : 0);
  }, [rows]);
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <SiteHeader />

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col gap-5">
        <div>
          <h1 className="font-serif-tc text-3xl sm:text-4xl font-black text-gray-900 tracking-tight inline-flex items-center gap-3">
            <Trophy className="text-amber-500" size={32} /> {t("lbTitle")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">{t("lbSub")}</p>
          <p className="mt-3 inline-block rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5">🎁 {t("lbPrize")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-end gap-3 mb-4">
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
            {shown.map((r, i) => (
              <li key={`${r.rank}-${r.name}-${page}-${i}`}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${r.mine ? "bg-[#FBF5E8] ring-2 ring-[#E7C98A]" : r.rank <= 3 ? "bg-amber-50/60" : "bg-gray-50"}`}>
                <span className="w-8 text-center text-lg font-black text-gray-700">{r.rank <= 3 ? MEDAL[r.rank - 1] : r.rank}</span>
                <span className="flex-1 text-sm font-bold text-gray-900 truncate">
                  {r.name}
                  {r.mine && <span className="ml-2 text-[10px] font-bold text-[#A07C34] uppercase">{t("lbYou")}</span>}
                </span>
                <span className="text-sm font-black text-[#A07C34] tabular-nums">{r.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ol>
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button type="button" onClick={() => setPage((n) => Math.max(0, n - 1))} disabled={page === 0}
                aria-label={locale === "zh" ? "上一頁" : "Previous"}
                className="rounded-full p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100">
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-bold text-gray-500 tabular-nums">
                {page * PAGE + 1}–{Math.min(rows.length, page * PAGE + PAGE)} / {rows.length}
              </span>
              <button type="button" onClick={() => setPage((n) => Math.min(pages - 1, n + 1))} disabled={page >= pages - 1}
                aria-label={locale === "zh" ? "下一頁" : "Next"}
                className="rounded-full p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-5">
        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-gray-900">{t("lbHowTitle")}</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-gray-700">
            <li className="flex justify-between"><span>{t("lbHow1")}</span><b className="text-[#A07C34]">+{board?.lesson_xp ?? 100} XP</b></li>
            {board?.arena_xp && (
              <>
                <li className="flex justify-between"><span>{t("lbHowArena")}</span><b className="text-[#A07C34]">+{board.arena_xp.participation} XP</b></li>
                <li className="flex justify-between"><span>{t("lbHowArenaWin")}</span><b className="text-[#A07C34]">+{board.arena_xp.win} XP</b></li>
                {board.arena_xp.podium.length > 0 && (
                  <li className="flex justify-between"><span>{t("lbHowArenaPodium")}</span><b className="text-[#A07C34]">{board.arena_xp.podium.map((x) => `+${x}`).join(" / ")} XP</b></li>
                )}
              </>
            )}
            <li className="flex justify-between"><span>{t("lbHowWordRemembered")}</span><b className="text-[#A07C34]">+{wordXp.remembered_xp} XP</b></li>
            <li className="flex justify-between"><span>{t("lbHowWordUsed")}</span><b className="text-[#A07C34]">+{wordXp.used_xp} XP</b></li>
            <li className="flex justify-between"><span>{t("lbHowHomework")}</span><b className="text-[#A07C34]">{board?.homework_xp ? `+${board.homework_xp} XP` : "+XP"}</b></li>
            <li className="flex justify-between"><span>{t("lbHow2")}</span><b className="text-[#A07C34]">+XP</b></li>
          </ul>
          <p className="mt-3 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold px-3 py-2">🎁 {t("lbHowCoupon")}</p>
        </section>

        <section className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-black text-gray-900">{t("lbKidsTitle")}</h2>
          {!user && !isLoading ? (
            <>
              <p className="text-sm text-gray-600">{t("lbKidsLogin")}</p>
              <LineLoginButton next="/leaderboard" label={t("pkgLoginLine")} />
              <Link href="/login?next=/leaderboard" className="text-center text-sm font-bold text-[#A07C34]">{t("pkgLoginEmail")}</Link>
            </>
          ) : (
            <>
              {(kids ?? []).map((k) => <KidCard key={k.id} kid={k} onChange={() => { loadKids(); loadBoard(); }} />)}
              <AddKid onAdded={loadKids} />
            </>
          )}
        </section>
        </div>
        </div>
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

export function KidCard({ kid }: { kid: Kid; onChange?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl bg-gray-50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-gray-900">{kid.first_name} · {kid.age}</span>
        <span className="text-xs text-gray-600 text-right">
          {t("lbThisMonth")} <b className="text-[#A07C34]">{kid.xp_month}</b> · {t("lbTotal")} <b>{kid.xp_total}</b>
        </span>
      </div>
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
      leaderboard_opt_in: true, // every child is on the leaderboard; kept so the field stays consistent
    });
    setBusy(false);
    if (r?.ok) {
      setOpen(false);
      onAdded();
      return;
    }
    const d = await r?.json().catch(() => ({}));
    const badName = JSON.stringify(d?.first_name ?? "").includes("isn't allowed");
    setErr(d?.detail === "duplicate" ? t("lbDuplicate") : badName ? t("lbBadName") : t("lbError"));
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-xl border-2 border-dashed border-[#E7C98A] text-[#A07C34] text-sm font-bold px-4 py-2.5">
        + {t("lbAddKid")}
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#E7C98A] p-4 flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_80px] gap-3">
        <input name="first_name" required maxLength={50} placeholder={t("lbFirstName")} aria-label={t("lbFirstName")} className={input} />
        <input name="age" required type="number" min={3} max={99} placeholder={t("lbAge")} aria-label={t("lbAge")} className={input} />
      </div>
      <p className="text-[11px] text-gray-500 -mt-1">{t("lbNameHint")}</p>
      {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="rounded-xl bg-[#13223F] disabled:opacity-60 text-white text-sm font-bold py-2.5">
        {busy ? "…" : t("lbAddKid")}
      </button>
    </form>
  );
}
