"use client";
// ─── Top bar for phones and tablets ───────────────────────────────────────────
// Logo, bell, account and language. Navigation lives in MobileNav (bottom tab
// bar + menu sheet). From `lg` up, signed-in users get SiteSidebar and this hides;
// visitors who aren't logged in keep this bar on every screen size.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";
import { useShowSidebar } from "./useShowSidebar";

export default function SiteHeader() {
  const { locale } = useLanguage();
  const path = usePathname() || "/";
  const hasSidebar = useShowSidebar();

  // On the homepage the logo scrolls to the very top and clears any #section.
  function goHome(e: MouseEvent) {
    if (path !== "/") return;
    e.preventDefault();
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* noop */ }
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (window.location.hash) window.history.replaceState(null, "", "/");
  }

  return (
    <header className={`${hasSidebar ? "lg:hidden " : ""}sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2DDD2]`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        <Link href="/" onClick={goHome} className="flex items-center gap-2.5 min-w-0">
          <img src="/logo.png" alt="" className="h-8 w-auto" />
          <span className="hidden sm:inline text-sm font-black text-[#13223F] leading-none whitespace-nowrap">Artecks Academy</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <NotificationBell />
          <AuthButton locale={locale} />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
