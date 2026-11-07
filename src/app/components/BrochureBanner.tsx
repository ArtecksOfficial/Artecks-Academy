"use client";
// ─── Brochure banner — auto-advancing pages: coaches → programs → why ─────────
// Navy + gold like the printed tri-fold. Pauses on hover/touch/focus, never
// auto-advances for prefers-reduced-motion, swipeable, buttons stay put.

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const GOLD = "#C9A35F";

const COACHES = [
  {
    name: "Issac Chang", photo: "/coaches/issac-chang.jpg",
    lang: { en: "English & Mandarin", zh: "英文、中文" },
    spec: { en: "2024 National Champion (Open) · Coaching since 2024", zh: "2024 全國冠軍（公開組）· 2024 年起執教" },
    founder: true,
  },
  {
    name: "Michael Ladror", photo: "/coaches/michael-ladror.jpg",
    lang: { en: "English", zh: "英文" },
    spec: { en: "English-immersion board game and chess coaching", zh: "全英語桌遊與西洋棋教學" },
  },
  {
    name: "Allen Hsieh", photo: "/coaches/allen-hsieh.jpg",
    lang: { en: "English & Mandarin", zh: "英文、中文" },
    spec: { en: "Interactive chess coaching & tactical analysis · 15K+ YouTube community", zh: "互動式教學與戰術分析 · YouTube 1.5 萬訂閱" },
  },
  {
    name: "Jared Bullock", photo: "/coaches/jared-bullock.jpg",
    lang: { en: "English", zh: "英文" },
    spec: { en: "Youth beginner chess & interactive play", zh: "兒童入門西洋棋與互動遊戲" },
  },
] as const;

const PROGRAMS = [
  { icon: "♟\uFE0E", title: { en: "Private coaching", zh: "一對一" }, fmt: "1-on-1", price: "NT$1,200" },
  { icon: "♞", title: { en: "Paired lessons", zh: "一對二" }, fmt: "1-on-2", price: { en: "NT$1,000 each", zh: "每人 NT$1,000" } },
  { icon: "♜", title: { en: "Small-group classes", zh: "小班團體課" }, fmt: { en: "3+ kids", zh: "3 人以上" }, price: { en: "NT$800 each", zh: "每人 NT$800" } },
] as const;

type L = "en" | "zh";
const tx = (v: string | { en: string; zh: string }, l: L) => (typeof v === "string" ? v : v[l]);

const WHY = [
  { icon: "📖", en: "English-language learning through meaningful activities", zh: "透過有意義的活動自然學英文" },
  { icon: "♞", en: "Chess instruction tailored to each student's level", zh: "依每位學生程度量身教學" },
  { icon: "👥", en: "Individual attention and small-group learning", zh: "一對一關注與小班學習" },
  { icon: "💡", en: "Strategic thinking, communication and problem-solving", zh: "培養策略思考、溝通與解決問題能力" },
] as const;

const INTERVAL_MS = 7000;

function Title({ kicker, gold, rest }: { kicker?: string; gold: string; rest: string }) {
  return (
    <header className="text-center">
      {kicker && <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: GOLD }}>{kicker}</p>}
      <h2 className="mt-2 text-2xl sm:text-3xl font-black">
        <span style={{ color: GOLD }}>{gold}</span>{rest}
      </h2>
    </header>
  );
}

export default function BrochureBanner({ locale }: { locale: string }) {
  const l: L = locale === "zh" ? "zh" : "en";
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  const pages: { key: string; label: string; node: ReactNode }[] = [
    {
      key: "coaches",
      label: l === "zh" ? "教練" : "Coaches",
      node: (
        <div className="flex flex-col gap-6">
          <Title kicker={l === "zh" ? "為孩子找到合適的教練" : "Find the right coach for your child"}
            gold={l === "zh" ? "認識" : "Meet Our "} rest={l === "zh" ? "我們的教練" : "Coaches"} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {COACHES.map((c) => (
              <article key={c.name} className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 flex flex-col gap-3">
                <div className="relative aspect-[6/7] rounded-xl overflow-hidden bg-white" style={{ boxShadow: `0 0 0 2px ${GOLD}66` }}>
                  <img src={c.photo} alt={c.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover object-top" />
                  {"founder" in c && c.founder && (
                    <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full text-[#0b1a33]" style={{ background: GOLD }}>
                      {l === "zh" ? "創辦人" : "Founder"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide" style={{ color: GOLD }}>{c.name}</h3>
                  <p className="mt-1 text-[11px] sm:text-xs font-semibold text-slate-200">🗣 {c.lang[l]}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-relaxed">{c.spec[l]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "programs",
      label: l === "zh" ? "課程" : "Programs",
      node: (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <Title kicker={l === "zh" ? "每堂 60 分鐘 · 1–9 年級" : "60-minute lessons · Grades 1–9"}
            gold={l === "zh" ? "課程" : "Our "} rest={l === "zh" ? "方案" : "Programs"} />
          <div className="flex flex-col gap-3">
            {PROGRAMS.map((p) => (
              <div key={p.fmt.toString()} className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 flex items-center gap-4">
                <span className="text-3xl w-8 text-center" style={{ color: GOLD }} aria-hidden="true">{p.icon}</span>
                <div className="flex-1">
                  <p className="font-black text-base sm:text-lg">{tx(p.title, l)}</p>
                  <p className="text-xs font-semibold text-slate-300">{tx(p.fmt, l)}</p>
                </div>
                <p className="font-black text-sm sm:text-base text-right" style={{ color: GOLD }}>{tx(p.price, l)}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>
            {l === "zh" ? "5 堂與 10 堂套票（買 10 送 1）" : "5 & 10-lesson packages (buy 10, get 1 free)"}
          </p>
        </div>
      ),
    },
    {
      key: "why",
      label: l === "zh" ? "為什麼" : "Why us",
      node: (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <Title kicker={l === "zh" ? "林口 · 台北" : "Linkou · Taipei"}
            gold={l === "zh" ? "為什麼選擇 " : "Why "} rest="Artecks Academy?" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHY.map((w) => (
              <div key={w.en} className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 flex items-center gap-4">
                <span className="text-2xl" aria-hidden="true">{w.icon}</span>
                <p className="text-sm sm:text-base font-semibold text-slate-100">{w[l]}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];
  const n = pages.length;

  const go = useCallback((i: number) => setPage(((i % n) + n) % n), [n]);

  useEffect(() => {
    try {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(m.matches);
      const on = (e: MediaQueryListEvent) => setReduced(e.matches);
      m.addEventListener("change", on);
      return () => m.removeEventListener("change", on);
    } catch { /* old browsers */ }
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setTimeout(() => go(page + 1), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [page, paused, reduced, go]);

  return (
    <section
      id="coaches-programs"
      aria-roledescription="carousel"
      aria-label={l === "zh" ? "教練與課程" : "Coaches and programs"}
      className="rounded-3xl overflow-hidden relative text-white"
      style={{ scrollMarginTop: "120px", background: "linear-gradient(160deg, #0b1a33 0%, #10264a 100%)", border: `1px solid ${GOLD}55` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => { setPaused(true); touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const x0 = touchX.current; touchX.current = null;
        const dx = x0 === null ? 0 : e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) go(page + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="relative p-6 sm:p-10 flex flex-col gap-8">
        {/* Pages share one grid cell, so the banner keeps the tallest page's height (no jumping). */}
        <div className="grid">
          {pages.map((pg, i) => (
            <div
              key={pg.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${n}: ${pg.label}`}
              aria-hidden={i !== page}
              className="[grid-area:1/1] self-center transition-all duration-700 ease-out"
              style={{
                opacity: i === page ? 1 : 0,
                transform: i === page ? "translateX(0)" : `translateX(${i < page ? "-24px" : "24px"})`,
                pointerEvents: i === page ? "auto" : "none",
                visibility: i === page ? "visible" : "hidden",
                transitionProperty: "opacity, transform, visibility",
              }}
            >
              {pg.node}
            </div>
          ))}
        </div>

        {/* Page controls */}
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => go(page - 1)} aria-label={l === "zh" ? "上一頁" : "Previous"}
            className="w-9 h-9 rounded-full border border-white/20 hover:bg-white/10 text-lg leading-none">‹</button>
          {pages.map((pg, i) => (
            <button key={pg.key} type="button" onClick={() => go(i)} aria-label={pg.label} aria-current={i === page}
              className="h-2.5 rounded-full transition-all"
              style={{ width: i === page ? 28 : 10, background: i === page ? GOLD : "rgba(255,255,255,0.3)" }} />
          ))}
          <button type="button" onClick={() => go(page + 1)} aria-label={l === "zh" ? "下一頁" : "Next"}
            className="w-9 h-9 rounded-full border border-white/20 hover:bg-white/10 text-lg leading-none">›</button>
        </div>

        {/* CTAs — always visible */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/book" className="rounded-2xl px-6 py-3 text-center text-sm font-black text-[#0b1a33] hover:opacity-90 transition-opacity" style={{ background: GOLD }}>
            {l === "zh" ? "預約一堂課" : "Book a lesson"}
          </Link>
          <Link href="/packages" className="rounded-2xl px-6 py-3 text-center text-sm font-bold border hover:bg-white/10 transition-colors" style={{ borderColor: `${GOLD}99`, color: GOLD }}>
            {l === "zh" ? "購買套票" : "Lesson packages"}
          </Link>
          <a href="https://line.me/R/ti/p/@843yqhoa" target="_blank" rel="noopener noreferrer" className="rounded-2xl px-6 py-3 text-center text-sm font-bold bg-[#06C755] hover:bg-[#05b34c] transition-colors">
            {l === "zh" ? "LINE 詢問 @843yqhoa" : "Ask on LINE @843yqhoa"}
          </a>
        </div>
      </div>
    </section>
  );
}
