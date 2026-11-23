"use client";
// ─── Left sidebar (desktop) — the main navigation on wide screens ────────────
// Same shape as the other Artecks sites (chess.artecks.com): brand at the top,
// grouped links with icons, account and wallet (XP, gems) at the bottom.
// Language is changed in Settings (and in the top bar on phones), not here.
// Below the `lg` breakpoint the sidebar is hidden and SiteHeader (the top bar)
// takes over; on `lg` and up SiteHeader hides and the page is shifted right
// by the sidebar's width (see globals.css, --sidebar-w).

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import { getAccessToken } from "@/lib/auth-client";
import { getKidSession } from "@/lib/kid-mode";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LegalLinks from "./LegalLinks";
import NotificationBell from "./NotificationBell";
import { COACH_GROUPS, GROUPS, type Item } from "@/lib/nav";
import { useMode } from "./ModeContext";
import { useShowSidebar } from "./useShowSidebar";
import { GEMS_ENABLED } from "@/lib/gems";

export default function SiteSidebar() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const path = usePathname() || "/";
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [wallet, setWallet] = useState<{ xp: number; gems: number } | null>(null);
  const [kidMode, setKidMode] = useState(false);
  const { isCoach, mode, switchTo, coachTab } = useMode();

  useEffect(() => { setKidMode(getKidSession() !== null); }, [path, user]);

  useEffect(() => {
    if (!user) { setWallet(null); return; }
    const token = getAccessToken();
    if (!token) return;
    fetch("/api/wallet", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.xp === "number") setWallet({ xp: d.xp, gems: d.gems ?? 0 }); })
      .catch(() => {});
  }, [user]);

  const isActive = (href: string, item?: Item) =>
    item?.tab ? path === "/coach" && coachTab === item.tab
      : href.startsWith("/#") || href.startsWith("http") ? false : href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
  // Coaches switch with the mode button, so "For coaches" only shows for others.
  const groups = mode === "coach" ? COACH_GROUPS
    : GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !(isCoach && i.href === "/coach")) }));

  const name = user ? (user.first_name || user.username || user.email) : "";
  const show = useShowSidebar();

  // The page is shifted right only while the sidebar is shown (see globals.css).
  useEffect(() => {
    document.body.classList.toggle("has-sidebar", show);
    return () => document.body.classList.remove("has-sidebar");
  }, [show]);

  if (!show) return null;

  return (
    <aside
      aria-label={zh ? "主選單" : "Main navigation"}
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[var(--sidebar-w)] flex-col bg-[#0E1E3A] text-white border-r border-white/10"
    >
      <Link href={user ? (kidMode ? "/leaderboard" : "/dashboard") : "/"} className="flex items-center gap-3 px-5 pt-6 pb-5">
        <img src="/logo.png" alt="" className="h-9 w-auto rounded bg-white p-1" />
        <span className="flex flex-col leading-none">
          <span className="text-xs font-bold tracking-[0.22em] uppercase">Artecks</span>
          <span className="mt-1 text-xs font-bold tracking-[0.22em] uppercase text-[#E7C98A]">Academy</span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {mode === "coach" && (
          <p className="mx-3 mb-3 rounded-lg bg-[#C49A4A]/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E7C98A]">{zh ? "教學中" : "Teaching"}</p>
        )}
        {groups.map((group) => {
          if (group.signedInOnly && !user) return null;
          const items = group.items.filter((i) => !(kidMode && i.guardianOnly) && !(user && i.guestOnly));
          if (items.length === 0) return null;
          return (
            <div key={group.en} className="mt-4 first:mt-0">
              {!group.hideTitle && (
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{zh ? group.zh : group.en}</p>
              )}
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = isActive(item.href, item);
                  const cls = `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`;
                  const inner = (
                    <>
                      <item.icon size={16} className={active ? "text-[#E7C98A]" : "text-white/50"} aria-hidden />
                      <span className="truncate">{zh ? item.zh : item.en}</span>
                    </>
                  );
                  return (
                    <li key={item.href}>
                      {item.external
                        ? <a href={item.href} className={cls}
                            {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a>
                        : <Link href={item.href} aria-current={active ? "page" : undefined} className={cls}>{inner}</Link>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <LegalLinks className="mt-5 px-3 text-[11px] text-white/40" />
      </nav>

      <div className="border-t border-white/10 p-3 flex flex-col gap-2">
        {isLoading ? (
          <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
        ) : user ? (
          <>
            {isCoach && !kidMode && (
              <button type="button" onClick={() => switchTo(mode === "coach" ? "parent" : "coach")}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#C49A4A]/50 py-2 text-xs font-bold text-[#E7C98A] hover:bg-[#C49A4A]/10">
                <ArrowLeftRight size={14} aria-hidden />
                {mode === "coach" ? (zh ? "切換到學習" : "Switch to learning") : (zh ? "切換到教學" : "Switch to teaching")}
              </button>
            )}
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <span className="h-8 w-8 shrink-0 rounded-full bg-[#C49A4A] text-[#0E1E3A] text-sm font-black flex items-center justify-center">
                {name[0]?.toUpperCase() ?? "?"}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
              {!kidMode && <NotificationBell variant="dark" align="left" />}
              {!kidMode && (
                <button type="button" onClick={async () => { await logout(); router.push("/"); }}
                  className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label={zh ? "登出" : "Log out"} title={zh ? "登出" : "Log out"}>
                  <LogOut size={15} />
                </button>
              )}
            </div>
            {wallet && (
              <div className={`grid ${GEMS_ENABLED ? "grid-cols-2" : "grid-cols-1"} gap-2 text-xs font-bold`}>
                <span className="rounded-lg bg-white/5 px-2.5 py-2 text-center" title={zh ? "我的經驗值" : "My XP"}>⚡ {wallet.xp.toLocaleString()} XP</span>
                {GEMS_ENABLED && (
                  <Link href="/packages" className="rounded-lg bg-white/5 px-2.5 py-2 text-center text-[#E7C98A] hover:bg-white/10" title={zh ? "家庭寶石" : "Family gems"}>
                    💎 {wallet.gems.toLocaleString()}
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <Link href={`/login?next=${encodeURIComponent(path)}`} className="rounded-lg bg-[#C49A4A] py-2.5 text-center text-sm font-bold text-[#0E1E3A] hover:bg-[#D4AE63]">
              {zh ? "登入" : "Log in"}
            </Link>
            <Link href="/signup" className="rounded-lg bg-white/10 py-2.5 text-center text-sm font-bold text-white hover:bg-white/20">
              {zh ? "註冊" : "Sign up"}
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
