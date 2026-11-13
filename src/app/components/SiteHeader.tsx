"use client";
// ─── One header for every page — logo, nav, login/account, language ──────────
// Pages used to hand-build their own; this keeps the whole site one place.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import AuthButton from "./AuthButton";

export default function SiteHeader() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const path = usePathname() || "/";
  // Which homepage section is in the middle of the screen (null = top / Home).
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (path !== "/") { setSection(null); return; }
    const ids = ["coaches-programs", "faq", "line-contact"];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id);
      }
      // The band is the middle of the viewport, so at most one or two sections hit it; take the last in page order.
      const hit = ids.filter((id) => visible.has(id));
      setSection(hit.length ? hit[hit.length - 1] : null);
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  // On the homepage, "Home" (and the logo) scroll to the very top and clear any #section.
  function goHome(e: MouseEvent) {
    if (path !== "/") return;
    e.preventDefault();
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* noop */ }
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    setSection(null);
    if (window.location.hash) window.history.replaceState(null, "", "/");
  }

  const links = [
    { href: "/", label: zh ? "首頁" : "Home" },
    { href: "/dashboard", label: zh ? "學習總覽" : "Dashboard" },
    { href: "/#coaches-programs", label: zh ? "教練與課程" : "Coaches & programs" },
    { href: "/book", label: zh ? "預約課程" : "Book" },
    { href: "/packages", label: zh ? "課程套票" : "Packages" },
    { href: "/leaderboard", label: zh ? "排行榜" : "Leaderboard" },
    { href: "/#faq", label: zh ? "常見問題" : "FAQ" },
    { href: "/#line-contact", label: zh ? "聯絡我們" : "Contact" },
  ];

  return (
    // Top bar for phones and tablets only: from `lg` up, SiteSidebar is the navigation.
    <header className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E2DDD2]">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-3">
        <Link href="/" onClick={goHome} className="flex items-center gap-2.5 min-w-0">
          <img src="/logo.png" alt="" className="h-8 w-auto" />
          <span className="hidden min-[420px]:inline text-sm font-black text-[#13223F] leading-none whitespace-nowrap">Artecks Academy</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <AuthButton locale={locale} />
          <LanguageToggle />
        </div>
      </div>
      <nav aria-label={zh ? "主選單" : "Main"} className="border-t border-[#EEEAE1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {links.map(({ href, label }) => {
            const active = href.startsWith("/#")
              ? path === "/" && section === href.slice(2)
              : href === "/" ? path === "/" && section === null : path.startsWith(href);
            return (
              <Link key={href} href={href} onClick={href === "/" ? goHome : undefined} aria-current={active ? "page" : undefined}
                className={`relative flex-shrink-0 text-xs font-semibold px-3 py-2.5 whitespace-nowrap transition-colors ${
                  active ? "text-[#13223F]" : "text-[#5B6478] hover:text-[#A07C34]"}`}>
                {label}
                {active && <span aria-hidden="true" className="absolute left-3 right-3 bottom-0 h-0.5 bg-[#C49A4A] rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
