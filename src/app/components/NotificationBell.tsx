"use client";
// ─── Bell: the parent's academy notifications (badge unlocks for now) ────────
// Used in the sidebar (dark) and the phone top bar (light). Opening it marks
// everything read.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAchievements } from "./AchievementsContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { rewardText } from "@/lib/achievements";

export default function NotificationBell({ variant = "light", align = "right" }: { variant?: "light" | "dark"; align?: "left" | "right" }) {
  const { bell, enabled, markAllRead } = useAchievements();
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!enabled) return null;
  const unread = bell?.unread ?? 0;
  const dark = variant === "dark";
  const fmt = (iso: string) => new Intl.DateTimeFormat(zh ? "zh-TW" : "en-US", { timeZone: "Asia/Taipei", month: "short", day: "numeric" }).format(new Date(iso));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { const next = !open; setOpen(next); if (next && unread) markAllRead(); }}
        aria-label={zh ? `通知${unread ? `（${unread} 則未讀）` : ""}` : `Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        className={`relative rounded-lg p-2 ${dark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-[#5B6478] hover:bg-gray-100 hover:text-[#13223F]"}`}
      >
        <Bell size={16} className={unread ? "ach-bell-ring" : undefined} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-[1.1rem] rounded-full bg-[#D9534F] px-1 text-[10px] font-black leading-[1.1rem] text-white text-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute z-[60] mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[#E2DDD2] bg-white text-left shadow-xl ${
          align === "left" ? "left-0 bottom-full mb-2" : "right-0 top-full"}`}>
          <div className="flex items-center justify-between border-b border-[#EEEAE1] px-4 py-3">
            <p className="text-sm font-black text-[#13223F]">{zh ? "通知" : "Notifications"}</p>
            <Link href="/achievements" onClick={() => setOpen(false)} className="text-xs font-bold text-[#A07C34] hover:underline">
              {zh ? "我的徽章 →" : "My badges →"}
            </Link>
          </div>
          {!bell || bell.items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              {zh ? "目前沒有通知。上課、留回饋都能解鎖徽章！" : "Nothing yet. Lessons and feedback unlock badges!"}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {bell.items.map((n) => (
                <li key={n.id}>
                  <Link href="/achievements" onClick={() => setOpen(false)} className="block px-4 py-2.5 hover:bg-[#F6F4EF]">
                    {n.badge ? (
                      <>
                        <p className="text-sm font-bold text-[#13223F]">
                          {n.badge.icon} {zh ? `解鎖徽章：${n.badge.title.zh}` : `Badge unlocked: ${n.badge.title.en}`}
                        </p>
                        {n.badge.reward.en && <p className="mt-0.5 text-xs text-gray-600">🎁 {rewardText(n.badge.reward, zh)}</p>}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-[#13223F]">{n.title}</p>
                        <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{n.message}</p>
                      </>
                    )}
                    <p className="mt-0.5 text-[11px] text-gray-400">{fmt(n.created_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
