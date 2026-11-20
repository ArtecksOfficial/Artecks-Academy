"use client";
// ─── Parent achievements: bell data + the "badge unlocked" pop-up ────────────
// Polls the bell endpoint (which also checks for new unlocks) on load, on every
// page change and once a minute while the tab is visible. New unlocks open a
// pop-up once; closing it tells the backend they've been celebrated.
// Parents only: nothing runs while signed out or in Kid Mode.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "./AuthContext";
import { authHeaders } from "@/lib/auth-client";
import { getKidSession } from "@/lib/kid-mode";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { rewardText, type Badge, type BellData } from "@/lib/achievements";
import { ACHIEVEMENTS_ENABLED } from "@/lib/achievements-flag";

const POLL_MS = 60_000;
const MAX_SINGLE_POPUPS = 2; // more than this at once (first visit) → one summary pop-up

interface Ctx {
  bell: BellData | null;
  enabled: boolean;
  refresh: () => void;
  markAllRead: () => void;
}

const AchievementsCtx = createContext<Ctx>({ bell: null, enabled: false, refresh: () => {}, markAllRead: () => {} });

export function useAchievements() {
  return useContext(AchievementsCtx);
}

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const path = usePathname() || "/";
  const [bell, setBell] = useState<BellData | null>(null);
  const [queue, setQueue] = useState<Badge[]>([]);
  const [enabled, setEnabled] = useState(false);
  const shown = useRef<Set<string>>(new Set());

  // Paused for now (ACHIEVEMENTS_ENABLED): no bell, no pop-ups, no requests.
  useEffect(() => { setEnabled(ACHIEVEMENTS_ENABLED && !!user && getKidSession() === null); }, [user, path]);

  const refresh = useCallback(() => {
    if (!enabled) return;
    fetch("/api/achievements/notifications", { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: BellData | null) => {
        if (!d || !Array.isArray(d.items)) return;
        setBell(d);
        const fresh = (d.new ?? []).filter((b) => !shown.current.has(b.code));
        if (fresh.length) {
          fresh.forEach((b) => shown.current.add(b.code));
          setQueue((q) => [...q, ...fresh]);
        }
      })
      .catch(() => {});
  }, [enabled]);

  useEffect(() => { if (!enabled) { setBell(null); setQueue([]); } }, [enabled]);
  useEffect(() => { refresh(); }, [refresh, path]);
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, POLL_MS);
    return () => clearInterval(t);
  }, [enabled, refresh]);

  const markAllRead = useCallback(() => {
    setBell((b) => (b ? { ...b, unread: 0, items: b.items.map((i) => ({ ...i, is_read: true })) } : b));
    fetch("/api/achievements/notifications/read", {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: "{}",
    }).catch(() => {});
  }, []);

  const celebrate = useCallback((codes: string[]) => {
    fetch("/api/achievements/celebrated", {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ codes }),
    }).catch(() => {});
  }, []);

  // A pile of unlocks (first visit for a long-time family) → one summary; otherwise one at a time.
  const summary = queue.length > MAX_SINGLE_POPUPS;
  const current = summary ? null : queue[0] ?? null;
  const close = () => {
    const done = summary ? queue : queue.slice(0, 1);
    celebrate(done.map((b) => b.code));
    setQueue((q) => q.slice(done.length));
  };

  return (
    <AchievementsCtx.Provider value={{ bell, enabled, refresh, markAllRead }}>
      {children}
      {enabled && (summary || current) && (
        <UnlockPopup badges={summary ? queue : [current as Badge]} onClose={close} onSeeAll={close} />
      )}
    </AchievementsCtx.Provider>
  );
}

function UnlockPopup({ badges, onClose, onSeeAll }: { badges: Badge[]; onClose: () => void; onSeeAll: () => void }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const one = badges.length === 1 ? badges[0] : null;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#0E1E3A]/50 p-4" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="ach-pop-title"
        className="ach-pop relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" onClick={onClose} aria-label={zh ? "關閉" : "Close"}
          className="absolute right-3 top-3 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X size={16} />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A07C34]">
          {one ? (zh ? "解鎖新徽章" : "Badge unlocked") : (zh ? `解鎖 ${badges.length} 枚徽章` : `${badges.length} badges unlocked`)}
        </p>
        {one ? (
          <>
            <div className="ach-pop-icon mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FBF5E8] text-4xl ring-4 ring-[#E7C98A]">
              <span aria-hidden>{one.icon}</span>
            </div>
            <h2 id="ach-pop-title" className="mt-4 font-serif-tc text-2xl font-black text-[#13223F]">{zh ? one.title.zh : one.title.en}</h2>
            <p className="mt-1.5 text-sm text-gray-600">{zh ? one.description.zh : one.description.en}</p>
            {one.reward.en && (
              <p className="mt-4 inline-block rounded-full bg-[#13223F] px-4 py-1.5 text-sm font-bold text-[#E7C98A]">
                🎁 {rewardText(one.reward, zh)}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-3xl" aria-hidden>
              {badges.slice(0, 8).map((b) => <span key={b.code} className="ach-pop-icon">{b.icon}</span>)}
            </div>
            <h2 id="ach-pop-title" className="mt-4 font-serif-tc text-2xl font-black text-[#13223F]">
              {zh ? "謝謝您一路的支持！" : "Thank you for all you've done!"}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              {zh ? "您過去的努力已經解鎖了這些徽章，獎勵已加入您的帳戶。" : "Your family's journey so far has already earned these. The rewards are in your account."}
            </p>
          </>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/achievements" onClick={onSeeAll}
            className="rounded-xl bg-[#C49A4A] py-2.5 text-sm font-bold text-[#0E1E3A] hover:bg-[#D4AE63]">
            {zh ? "查看我的徽章" : "See my badges"}
          </Link>
          <button type="button" onClick={onClose} className="py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">
            {zh ? "太棒了！" : "Nice!"}
          </button>
        </div>
      </div>
    </div>
  );
}
