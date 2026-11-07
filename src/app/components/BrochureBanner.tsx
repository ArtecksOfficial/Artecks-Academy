"use client";
// ─── Brochure banner — coaches + programs, matching the printed tri-fold ─────
// Navy + gold like the brochure, laid out for phones (not a pasted image).

import Link from "next/link";

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

export default function BrochureBanner({ locale }: { locale: string }) {
  const l: L = locale === "zh" ? "zh" : "en";
  return (
    <section
      id="coaches-programs"
      className="rounded-3xl overflow-hidden relative text-white"
      style={{ scrollMarginTop: "120px", background: "linear-gradient(160deg, #0b1a33 0%, #10264a 100%)", border: `1px solid ${GOLD}55` }}
    >
      <div className="relative p-6 sm:p-10 flex flex-col gap-10">
        <header className="text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
            {l === "zh" ? "為孩子找到合適的教練" : "Find the right coach for your child"}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black">
            <span style={{ color: GOLD }}>{l === "zh" ? "認識" : "Meet Our "}</span>
            {l === "zh" ? "我們的教練" : "Coaches"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {l === "zh" ? "所有教練皆以英文教授西洋棋" : "Every coach teaches chess in English"}
          </p>
        </header>

        {/* Coaches */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Programs */}
        <div>
          <h2 className="text-center text-xl sm:text-2xl font-black">
            <span style={{ color: GOLD }}>{l === "zh" ? "課程" : "Our "}</span>
            {l === "zh" ? "方案" : "Programs"}
          </h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROGRAMS.map((p) => (
              <div key={p.fmt.toString()} className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 flex items-center gap-4">
                <span className="text-3xl" style={{ color: GOLD }} aria-hidden="true">{p.icon}</span>
                <div>
                  <p className="font-black text-sm sm:text-base">{tx(p.title, l)}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: GOLD }}>
                    {tx(p.fmt, l)} · {l === "zh" ? "1–9 年級" : "Gr. 1–9"} · {tx(p.price, l)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>
            {l === "zh" ? "每堂 60 分鐘 · 5 堂與 10 堂套票" : "60-min lessons · 5 & 10-lesson packages"}
          </p>
        </div>

        {/* CTAs */}
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
