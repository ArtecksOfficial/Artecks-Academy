"use client";
// ─── English words — each child's word bank and practice, inside Academy ─────
// Same backend and rules as lingo.artecks.com (/api/lingo/*): spaced review,
// +XP when a word is remembered, +XP when a coach ticks a word used in class.
// Parents pick a child, a kid login sees only themselves, coaches also tick
// their students' remembered words as used. ?kid=<id> opens one child.

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Languages, Loader2, Sparkles, X } from "lucide-react";
import SiteHeader from "@/app/components/SiteHeader";
import LineLoginButton from "@/app/components/LineLoginButton";
import { useAuth } from "@/app/components/AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  DEFAULT_RULES, type AnswerResult, type Card, type LingoMe, type LingoRules, type LingoStudent,
  type LingoWord, type ReadyWord, type Stage,
} from "@/lib/lingo";

const card = "rounded-3xl bg-white border border-[#E2DDD2] p-5 sm:p-6 shadow-sm";
const LANG = "en";

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  const r = await fetch(`/api/lingo/${path}`, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
  }).catch(() => null);
  if (!r) return { ok: false, status: 0, data: null };
  const data = (await r.json().catch(() => null)) as T | null;
  return { ok: r.ok, status: r.status, data };
}

type Tab = "learning" | "remembered" | "used";
const TAB_STAGES: Record<Tab, Stage[]> = { learning: ["new", "learning"], remembered: ["remembered"], used: ["used"] };

export default function WordsClient() {
  const { locale, t } = useLanguage();
  const zh = locale === "zh";
  const { user, isLoading } = useAuth();

  const [me, setMe] = useState<LingoMe | null | "error">(null);
  const [coachKids, setCoachKids] = useState<LingoStudent[]>([]);
  const [ready, setReady] = useState<ReadyWord[]>([]);
  const [kidId, setKidId] = useState<number | null>(null);
  const [words, setWords] = useState<LingoWord[] | null>(null);
  const [tab, setTab] = useState<Tab>("learning");
  const [practising, setPractising] = useState(false);

  const rules: LingoRules = (me && me !== "error" ? me.rules : null) ?? DEFAULT_RULES;
  const own = useMemo(() => (me && me !== "error" ? me.students : []), [me]);
  const kids = useMemo(() => {
    const seen = new Set(own.map((s) => s.id));
    return [...own, ...coachKids.filter((s) => !seen.has(s.id))];
  }, [own, coachKids]);
  const kid = kids.find((k) => k.id === kidId) ?? null;
  const isOwn = own.some((s) => s.id === kidId);
  const isCoach = !!(me && me !== "error" && me.is_coach && !me.kid_mode);

  const loadCoach = useCallback(() => {
    api<{ students: LingoStudent[]; ready_to_check: ReadyWord[] }>("coach").then((r) => {
      if (!r.ok || !r.data) return;
      setCoachKids(Array.isArray(r.data.students) ? r.data.students : []);
      setReady(Array.isArray(r.data.ready_to_check) ? r.data.ready_to_check : []);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    api<LingoMe>("me").then((r) => {
      if (!r.ok || !r.data || !Array.isArray(r.data.students)) { setMe("error"); return; }
      setMe(r.data);
      if (r.data.is_coach && !r.data.kid_mode) loadCoach();
    });
  }, [user, loadCoach]);

  // Which child: ?kid= if it's one we can open, else the first.
  useEffect(() => {
    if (!kids.length || (kidId !== null && kids.some((k) => k.id === kidId))) return;
    const asked = Number(new URLSearchParams(window.location.search).get("kid"));
    setKidId(kids.some((k) => k.id === asked) ? asked : kids[0].id);
  }, [kids, kidId]);

  const loadWords = useCallback(() => {
    if (kidId === null) return;
    api<{ words: LingoWord[] }>(`students/${kidId}`).then((r) =>
      setWords(r.ok && r.data && Array.isArray(r.data.words) ? r.data.words.filter((w) => w.language === LANG) : []));
  }, [kidId]);
  useEffect(() => { setWords(null); loadWords(); }, [loadWords]);

  const pick = (id: number) => {
    setKidId(id);
    setPractising(false);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("kid", String(id));
      window.history.replaceState(null, "", u.toString());
    } catch { /* noop */ }
  };

  const due = (words ?? []).filter((w) => w.stage !== "used" && new Date(w.due_at).getTime() <= Date.now()).length;
  const shown = (words ?? []).filter((w) => TAB_STAGES[tab].includes(w.stage));
  const count = (t: Tab) => (words ?? []).filter((w) => TAB_STAGES[t].includes(w.stage)).length;
  const kidReady = ready.filter((w) => w.student_id === kidId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <SiteHeader />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col gap-5">
        <div>
          <h1 className="font-serif-tc text-3xl sm:text-4xl font-black text-[#13223F] tracking-tight inline-flex items-center gap-3">
            <Languages className="text-[#C49A4A]" size={30} /> {zh ? "英文單字" : "English words"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            {zh
              ? `老師每堂課後會加入新學到的單字。每天練習幾分鐘：記住一個單字 +${rules.remembered_xp} XP，在課堂上用出來再 +${rules.used_xp} XP。`
              : `After each lesson the teacher adds the new words. Practise a few minutes a day: +${rules.remembered_xp} XP for each word remembered, +${rules.used_xp} XP more when it's used in class.`}
          </p>
        </div>

        {!user && !isLoading && (
          <section className={`${card} flex flex-col gap-3 max-w-md`}>
            <p className="text-sm text-gray-600">{zh ? "登入後就能看孩子的單字並練習。" : "Log in to see your child's words and practise."}</p>
            <LineLoginButton next="/words" label={t("pkgLoginLine")} />
            <Link href="/login?next=/words" className="text-center text-sm font-bold text-[#A07C34]">{t("pkgLoginEmail")}</Link>
          </section>
        )}

        {user && me === null && <Loader2 className="animate-spin text-gray-300" size={22} />}
        {user && me === "error" && <p className="text-sm text-red-600">{zh ? "暫時無法載入單字，請稍後再試。" : "Couldn't load the words. Please try again later."}</p>}

        {user && me && me !== "error" && kids.length === 0 && (
          <section className={card}>
            <p className="text-sm text-gray-600">
              {zh ? "還沒有孩子的資料。先在排行榜頁加入孩子，上課後老師就會加入單字。" : "No children yet. Add your child on the leaderboard page; after a lesson the teacher adds their words."}
            </p>
            <Link href="/leaderboard" className="mt-3 inline-block text-sm font-bold text-[#A07C34]">{zh ? "加入孩子 →" : "Add a child →"}</Link>
          </section>
        )}

        {kids.length > 1 && !practising && (
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label={zh ? "選擇孩子" : "Choose a child"}>
            {kids.map((k) => (
              <button key={k.id} type="button" role="tab" aria-selected={k.id === kidId} onClick={() => pick(k.id)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  k.id === kidId ? "bg-[#13223F] text-white" : "bg-white border border-[#E2DDD2] text-[#13223F] hover:bg-[#FBF5E8]"}`}>
                {k.name}
              </button>
            ))}
          </div>
        )}

        {kid && practising && (
          <Practice kidId={kid.id} name={kid.name} zh={zh} rules={rules} words={words ?? []}
            onDone={() => { setPractising(false); loadWords(); }} />
        )}

        {kid && !practising && (
          <>
            <section className={`${card} flex flex-wrap items-center justify-between gap-4`}>
              <div>
                <h2 className="text-lg font-black text-[#13223F]">{kid.name}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {words === null ? "…" : zh
                    ? `${words.length} 個單字 · ${due} 個今天要練習`
                    : `${words.length} word${words.length === 1 ? "" : "s"} · ${due} to practise today`}
                </p>
              </div>
              {isOwn && (
                <button type="button" onClick={() => setPractising(true)} disabled={!due}
                  className="rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
                  {due ? (zh ? "開始練習 →" : "Practise now →") : (zh ? "今天都練習完了 🎉" : "All done for today 🎉")}
                </button>
              )}
            </section>

            {isCoach && kidReady.length > 0 && (
              <ReadyToTick words={kidReady} zh={zh} rules={rules} onTicked={() => { loadCoach(); loadWords(); }} />
            )}

            <section className={card}>
              <div className="flex gap-2 overflow-x-auto mb-4" role="tablist">
                {(["learning", "remembered", "used"] as const).map((t) => (
                  <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                    className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                      tab === t ? "bg-[#13223F] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    {t === "learning" ? (zh ? "學習中" : "New") : t === "remembered" ? (zh ? "已記住" : "Remembered") : (zh ? "用出來了" : "Used")}
                    {" "}{count(t)}
                  </button>
                ))}
              </div>
              {words === null && <Loader2 className="animate-spin text-gray-300" size={20} />}
              {words !== null && shown.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">
                  {tab === "learning"
                    ? (zh ? "目前沒有新單字。老師下次上課會再加入。" : "No new words right now. The teacher adds more after the next lesson.")
                    : tab === "remembered"
                      ? (zh ? "練習答對幾次，單字就會出現在這裡。" : "Words show up here after a few right answers in practice.")
                      : (zh ? "在課堂上用出記住的單字，老師勾選後會出現在這裡。" : "When your child uses a remembered word in class, the coach ticks it and it shows up here.")}
                </p>
              )}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shown.map((w) => (
                  <li key={w.id} className="rounded-2xl bg-[#F6F4EF] px-4 py-3">
                    <p className="text-sm font-black text-[#13223F]">
                      {w.text}{w.meaning && <span className="ml-2 font-semibold text-gray-600">{w.meaning}</span>}
                    </p>
                    {w.example && <p className="mt-0.5 text-xs text-gray-500">{w.example}</p>}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Practice: the words due today, one card at a time ───────────────────────

function Practice({ kidId, name, zh, rules, words, onDone }: {
  kidId: number; name: string; zh: boolean; rules: LingoRules; words: LingoWord[]; onDone: () => void;
}) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<(AnswerResult & { xp: number }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [score, setScore] = useState({ right: 0, done: 0, xp: 0 });
  const stageBefore = useRef(new Map(words.map((w) => [w.id, w.stage]))).current;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ cards: Card[] }>(`students/${kidId}/practice?language=${LANG}`).then((r) =>
      setCards(r.ok && r.data && Array.isArray(r.data.cards) ? r.data.cards : []));
  }, [kidId]);

  const c = cards?.[i];
  useEffect(() => { if (c?.mode === "type" && !result) inputRef.current?.focus(); }, [c, result]);

  const answer = async (body: { answer: string } | { knew: boolean }) => {
    if (!c || busy) return;
    setBusy(true);
    setError(false);
    const r = await api<AnswerResult>(`practice/${c.id}`, { method: "POST", body: JSON.stringify(body) });
    setBusy(false);
    if (!r.ok || !r.data) { setError(true); return; }
    const before = stageBefore.get(c.id);
    const xp = r.data.stage === "remembered" && before !== "remembered" && before !== "used" ? rules.remembered_xp : 0;
    if (xp) stageBefore.set(c.id, "remembered");
    setResult({ ...r.data, xp });
    setScore((s) => ({ right: s.right + (r.data!.correct ? 1 : 0), done: s.done + 1, xp: s.xp + xp }));
  };

  const next = () => { setResult(null); setTyped(""); setI((n) => n + 1); };
  const submitTyped = (e: FormEvent) => { e.preventDefault(); if (typed.trim()) answer({ answer: typed }); };

  if (cards === null) return <section className={card}><Loader2 className="animate-spin text-gray-300" size={22} /></section>;

  if (!c) {
    return (
      <section className={`${card} text-center flex flex-col items-center gap-3`}>
        <Sparkles className="text-[#C49A4A]" size={32} />
        <h2 className="text-xl font-black text-[#13223F]">{zh ? `${name} 練習完成！` : `Well done, ${name}!`}</h2>
        {score.done > 0 && (
          <p className="text-sm text-gray-600">
            {zh ? `答對 ${score.right} / ${score.done} 題` : `${score.right} of ${score.done} right`}
            {score.xp > 0 && <b className="ml-2 text-[#A07C34]">+{score.xp} XP</b>}
          </p>
        )}
        <button type="button" onClick={onDone} className="rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white">
          {zh ? "回到單字庫" : "Back to the word bank"}
        </button>
      </section>
    );
  }

  return (
    <section className={`${card} flex flex-col gap-5`}>
      <div className="flex items-center justify-between text-xs font-bold text-gray-500">
        <span>{i + 1} / {cards.length}</span>
        <button type="button" onClick={onDone} className="text-[#A07C34]">{zh ? "先停在這裡" : "Stop for now"}</button>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full bg-[#C49A4A] transition-all" style={{ width: `${(i / cards.length) * 100}%` }} />
      </div>

      {c.mode === "flash" ? (
        <div className="text-center">
          <p className="text-3xl font-black text-[#13223F]">{c.text}</p>
          {c.reading && <p className="mt-1 text-sm text-gray-500">{c.reading}</p>}
          {c.example && <p className="mt-3 text-sm text-gray-600">{c.example}</p>}
          <p className="mt-4 text-sm font-semibold text-gray-600">{zh ? "你知道這個字的意思嗎？" : "Do you know what it means?"}</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs font-bold text-gray-500">{zh ? "英文怎麼說？" : "How do you say it in English?"}</p>
          <p className="mt-2 text-3xl font-black text-[#13223F]">{c.meaning}</p>
          {c.mode === "type" && c.hint && <p className="mt-3 text-sm text-gray-600">{c.hint}</p>}
          {c.mode === "type" && (
            <p className="mt-2 text-xs text-gray-400 tracking-widest">{c.first}{" _".repeat(Math.max(0, c.letters - 1))}</p>
          )}
        </div>
      )}

      {!result && c.mode === "type" && (
        <form onSubmit={submitTyped} className="flex gap-2 max-w-md mx-auto w-full">
          <input ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={60}
            autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} enterKeyHint="done"
            aria-label={zh ? "輸入英文單字" : "Type the English word"}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base focus:outline-none focus:border-[#C49A4A]" />
          <button type="submit" disabled={busy || !typed.trim()} className="rounded-xl bg-[#13223F] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">
            {zh ? "確定" : "Check"}
          </button>
        </form>
      )}

      {!result && c.mode === "choose" && (
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto w-full">
          {c.options.map((o) => (
            <button key={o.text} type="button" disabled={busy} onClick={() => answer({ answer: o.text })}
              className="rounded-xl border border-[#E2DDD2] bg-white px-3 py-3 text-base font-bold text-[#13223F] hover:bg-[#FBF5E8] disabled:opacity-50">
              {o.text}{o.reading && <span className="block text-xs font-normal text-gray-500">{o.reading}</span>}
            </button>
          ))}
        </div>
      )}

      {!result && c.mode === "flash" && (
        <div className="flex gap-2 justify-center">
          <button type="button" disabled={busy} onClick={() => answer({ knew: false })}
            className="rounded-xl border border-[#E2DDD2] bg-white px-5 py-2.5 text-sm font-bold text-[#13223F]">{zh ? "還不會" : "Not yet"}</button>
          <button type="button" disabled={busy} onClick={() => answer({ knew: true })}
            className="rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white">{zh ? "我知道！" : "I knew it!"}</button>
        </div>
      )}

      {error && <p role="alert" className="text-center text-sm text-red-600">{zh ? "沒有送出，請再試一次。" : "That didn't go through. Please try again."}</p>}

      {result && (
        <div role="status" className={`rounded-2xl px-4 py-4 text-center ${result.correct ? "bg-emerald-50" : "bg-amber-50"}`}>
          <p className={`inline-flex items-center gap-1.5 text-sm font-black ${result.correct ? "text-emerald-700" : "text-amber-800"}`}>
            {result.correct ? <Check size={16} /> : <X size={16} />}
            {result.correct ? (zh ? "答對了！" : "Right!") : (zh ? "差一點！答案是：" : "Nearly! The answer is:")}
          </p>
          <p className="mt-1 text-2xl font-black text-[#13223F]">{result.text}</p>
          {result.meaning && <p className="text-sm text-gray-600">{result.meaning}</p>}
          {result.xp > 0 && (
            <p className="mt-2 text-sm font-black text-[#A07C34]">
              {zh ? `記住這個單字了！+${result.xp} XP` : `Word remembered! +${result.xp} XP`}
            </p>
          )}
          <button type="button" onClick={next} autoFocus className="mt-3 rounded-xl bg-[#13223F] px-5 py-2.5 text-sm font-bold text-white">
            {i + 1 < cards.length ? (zh ? "下一個 →" : "Next →") : (zh ? "完成" : "Finish")}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Coach: tick remembered words the child used in class ────────────────────

function ReadyToTick({ words, zh, rules, onTicked }: { words: ReadyWord[]; zh: boolean; rules: LingoRules; onTicked: () => void }) {
  const [busy, setBusy] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const tick = async (w: ReadyWord) => {
    setBusy(w.id);
    setNote("");
    const r = await api<{ detail?: string }>(`coach/words/${w.id}/used`, { method: "POST", body: "{}" });
    setBusy(null);
    if (r.ok) {
      setNote(zh ? `已勾選「${w.text}」，${w.student_name} +${rules.used_xp} XP` : `Ticked “${w.text}”: ${w.student_name} +${rules.used_xp} XP`);
      onTicked();
    } else {
      setNote(zh ? "沒有勾選成功，請再試一次。" : "Couldn't tick that word. Please try again.");
    }
  };

  return (
    <section className={card}>
      <h2 className="text-sm font-black text-[#13223F]">{zh ? "課堂上用出來的單字" : "Words used in class"}</h2>
      <p className="mt-1 text-xs text-gray-600">
        {zh ? `孩子已記住這些單字。上課時用出來就勾選：+${rules.used_xp} XP。` : `The child has remembered these. Tick each one they used in class: +${rules.used_xp} XP.`}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {words.map((w) => (
          <li key={w.id}>
            <button type="button" disabled={busy !== null} onClick={() => tick(w)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E7C98A] bg-[#FBF5E8] px-3 py-1.5 text-sm font-bold text-[#13223F] hover:bg-[#F5E7C8] disabled:opacity-50">
              {busy === w.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} {w.text}
            </button>
          </li>
        ))}
      </ul>
      {note && <p role="status" className="mt-3 text-xs font-semibold text-emerald-700">{note}</p>}
    </section>
  );
}
