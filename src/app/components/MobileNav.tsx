"use client";
// ─── Phone / tablet navigation: bottom tab bar + full menu sheet ─────────────
// Below `lg` the desktop sidebar is hidden. The tab bar keeps the things
// parents use most one tap away (incl. Play chess, which the old top-bar
// scroller didn't have), and "Menu" opens every link from the sidebar.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, BookOpen, BookOpenCheck, CalendarDays, CalendarPlus, ClipboardList, Home, LayoutDashboard, LogIn, LogOut, Menu, Sparkles, Swords, Trophy, UserCog, X, type LucideIcon } from "lucide-react";
import { useAuth } from "./AuthContext";
import LegalLinks from "./LegalLinks";
import { getAccessToken } from "@/lib/auth-client";
import { CHESS_URL, getKidSession } from "@/lib/kid-mode";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import { COACH_GROUPS, GROUPS, type Item } from "@/lib/nav";
import { useMode } from "./ModeContext";
import { GEMS_ENABLED } from "@/lib/gems";

interface Tab { tab?: string; href: string; en: string; zh: string; icon: LucideIcon; external?: boolean; primary?: boolean }

export default function MobileNav() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const path = usePathname() || "/";
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [kidMode, setKidMode] = useState(false);
  const [wallet, setWallet] = useState<{ xp: number; gems: number } | null>(null);
  const { isCoach, mode, switchTo, coachTab } = useMode();

  useEffect(() => { setKidMode(getKidSession() !== null); setOpen(false); }, [path, user]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open || !user) return;
    const token = getAccessToken();
    if (!token) return;
    fetch("/api/wallet", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.xp === "number") setWallet({ xp: d.xp, gems: d.gems ?? 0 }); })
      .catch(() => {});
  }, [open, user]);

  const coachTabs: Tab[] = [
    { href: "/coach?tab=sessions", tab: "sessions", en: "Sessions", zh: "課程", icon: ClipboardList },
    { href: "/coach?tab=homework", tab: "homework", en: "Homework", zh: "作業", icon: BookOpenCheck },
    { href: "/coach?tab=availability", tab: "availability", en: "Calendar", zh: "行事曆", icon: CalendarDays, primary: true },
    { href: "/coach?tab=profile", tab: "profile", en: "Profile", zh: "檔案", icon: UserCog },
  ];
  const parentTabs: Tab[] = [
    !user
      ? { href: "/", en: "Home", zh: "首頁", icon: Home }
      : kidMode
        ? { href: "/achievements", en: "XP", zh: "XP", icon: Sparkles }
        : { href: "/bookings/mine", en: "Lessons", zh: "課程", icon: BookOpen },
    kidMode
      ? { href: "/leaderboard", en: "Leaderboard", zh: "排行榜", icon: Trophy }
      : { href: "/book", en: "Book", zh: "預約", icon: CalendarPlus },
    { href: CHESS_URL, en: "Play chess", zh: "下棋", icon: Swords, external: true, primary: true },
    user && !kidMode
      ? { href: "/dashboard", en: "Learning", zh: "學習", icon: LayoutDashboard }
      : user
        ? { href: "/account", en: "Me", zh: "我的", icon: LayoutDashboard }
        : { href: `/login?next=${encodeURIComponent(path)}`, en: "Log in", zh: "登入", icon: LogIn },
  ];
  const tabs = mode === "coach" ? coachTabs : parentTabs;
  const groups = mode === "coach" ? COACH_GROUPS
    : GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !(isCoach && i.href === "/coach")) }));

  const isActive = (href: string, item?: Item | Tab) =>
    item?.tab ? path === "/coach" && coachTab === item.tab
    : href.startsWith("http") || href.startsWith("/#") ? false : href === "/" ? path === "/" : path === href || path.startsWith(href.split("?")[0] + "/") || path === href.split("?")[0];

  const name = user ? (user.first_name || user.username || user.email) : "";

  return (
    <>
      <nav aria-label={zh ? "主選單" : "Main"}
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[#E2DDD2] bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {tabs.map((t) => {
            const active = isActive(t.href, t);
            const inner = t.primary ? (
              <>
                <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#13223F] text-[#E7C98A] shadow-lg ring-4 ring-white">
                  <t.icon size={20} aria-hidden />
                </span>
                <span className="mt-0.5 text-[10px] font-bold text-[#13223F]">{zh ? t.zh : t.en}</span>
              </>
            ) : (
              <>
                <t.icon size={20} aria-hidden className={active ? "text-[#A07C34]" : "text-[#5B6478]"} />
                <span className={`mt-0.5 text-[10px] font-semibold ${active ? "text-[#13223F]" : "text-[#5B6478]"}`}>{zh ? t.zh : t.en}</span>
              </>
            );
            const cls = "flex h-14 flex-col items-center justify-center";
            return (
              <li key={t.en}>
                {t.external
                  ? <a href={t.href} className={cls}>{inner}</a>
                  : <Link href={t.href} aria-current={active ? "page" : undefined} className={cls}>{inner}</Link>}
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog"
              className="flex h-14 w-full flex-col items-center justify-center">
              <Menu size={20} aria-hidden className="text-[#5B6478]" />
              <span className="mt-0.5 text-[10px] font-semibold text-[#5B6478]">{zh ? "選單" : "Menu"}</span>
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[70] flex flex-col justify-end bg-[#0E1E3A]/50" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={zh ? "選單" : "Menu"}
            className="max-h-[88vh] overflow-y-auto rounded-t-3xl bg-[#0E1E3A] text-white pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between gap-3 bg-[#0E1E3A] px-5 pt-4 pb-3">
              {user ? (
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C49A4A] text-sm font-black text-[#0E1E3A]">{name[0]?.toUpperCase() ?? "?"}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{name}</p>
                    {wallet && <p className="text-xs text-white/60">⚡ {wallet.xp.toLocaleString()} XP{GEMS_ENABLED && <> · <span className="text-[#E7C98A]">💎 {wallet.gems.toLocaleString()}</span></>}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-sm font-bold">Artecks Academy</p>
              )}
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <button type="button" onClick={() => setOpen(false)} aria-label={zh ? "關閉" : "Close"} className="rounded-full p-2 text-white/70 hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-3">
              {groups.map((group) => {
                if (group.signedInOnly && !user) return null;
                const items = group.items.filter((i) => !(kidMode && i.guardianOnly) && !(user && i.guestOnly));
                if (!items.length) return null;
                return (
                  <div key={group.en} className="mt-3">
                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{zh ? group.zh : group.en}</p>
                    <ul className="grid grid-cols-2 gap-1">
                      {items.map((item) => {
                        const active = isActive(item.href, item);
                        const cls = `flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-white/10 text-white" : "text-white/80 active:bg-white/10"}`;
                        const inner = <><item.icon size={17} aria-hidden className={active ? "text-[#E7C98A]" : "text-white/50"} /><span className="truncate">{zh ? item.zh : item.en}</span></>;
                        return (
                          <li key={item.href}>
                            {item.external
                              ? <a href={item.href} className={cls} {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a>
                              : <Link href={item.href} onClick={() => setOpen(false)} className={cls}>{inner}</Link>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-white/10 px-5 pt-4 flex flex-col gap-3">
              {isCoach && !kidMode && (
                <button type="button" onClick={() => { setOpen(false); switchTo(mode === "coach" ? "parent" : "coach"); }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#C49A4A]/50 py-2.5 text-sm font-bold text-[#E7C98A]">
                  <ArrowLeftRight size={15} aria-hidden />
                  {mode === "coach" ? (zh ? "切換到學習" : "Switch to learning") : (zh ? "切換到教學" : "Switch to teaching")}
                </button>
              )}
              {user ? (
                !kidMode && (
                  <button type="button" onClick={async () => { await logout(); setOpen(false); router.push("/"); }}
                    className="flex items-center gap-2 text-sm font-semibold text-white/70">
                    <LogOut size={16} /> {zh ? "登出" : "Log out"}
                  </button>
                )
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/login?next=${encodeURIComponent(path)}`} className="rounded-xl bg-[#C49A4A] py-2.5 text-center text-sm font-bold text-[#0E1E3A]">{zh ? "登入" : "Log in"}</Link>
                  <Link href="/signup" className="rounded-xl bg-white/10 py-2.5 text-center text-sm font-bold">{zh ? "註冊" : "Sign up"}</Link>
                </div>
              )}
              <LegalLinks className="text-[11px] text-white/40" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
