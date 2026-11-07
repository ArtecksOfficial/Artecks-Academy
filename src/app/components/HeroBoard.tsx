"use client";
// ─── Hero chessboard — the one bold element on the homepage ──────────────────
// A real board with English coordinates. On load the knight plays g1 → f3 once,
// and the move is said in English underneath — the whole product in one picture.

import { useEffect, useState } from "react";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

// Opening position after 1. e4 e5 (white to play Nf3)
const PIECES: Record<string, string> = {
  a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
  a7: "♟", b7: "♟", c7: "♟", d7: "♟", f7: "♟", g7: "♟", h7: "♟", e5: "♟",
  a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", h1: "♖",
  a2: "♙", b2: "♙", c2: "♙", d2: "♙", f2: "♙", g2: "♙", h2: "♙", e4: "♙",
};
const BLACK = new Set(["♜", "♞", "♝", "♛", "♚", "♟"]);

export default function HeroBoard({ caption }: { caption: string }) {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* noop */ }
    if (reduce) { setMoved(true); return; }
    const id = window.setTimeout(() => setMoved(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  // Knight travels from g1 (col 6,row 7) to f3 (col 5,row 5) in 12.5% steps
  const knight = moved ? { left: 5 * 12.5, top: 5 * 12.5 } : { left: 6 * 12.5, top: 7 * 12.5 };

  return (
    <figure className="w-full max-w-[400px] mx-auto">
      <div className="relative pl-5 pb-5">
        <div className="relative aspect-square rounded-md overflow-hidden ring-1 ring-[#C49A4A]/50 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {RANKS.map((r, ri) => FILES.map((f, fi) => {
              const sq = `${f}${r}`;
              const dark = (ri + fi) % 2 === 1;
              const from = sq === "g1", to = sq === "f3";
              const p = PIECES[sq];
              return (
                <div key={sq} className="relative flex items-center justify-center"
                  style={{ background: dark ? "#2A4170" : "#E9DCC0" }}>
                  {(from || to) && (
                    <span aria-hidden="true" className="absolute inset-0 transition-opacity duration-500"
                      style={{ background: "#C49A4A", opacity: moved ? (to ? 0.6 : 0.45) : 0 }} />
                  )}
                  {p && (
                    <span aria-hidden="true" className="relative leading-none select-none text-[clamp(18px,5.2vw,38px)]"
                      style={{ color: BLACK.has(p) ? "#0E1E3A" : "#FBF8F1", textShadow: BLACK.has(p) ? "none" : "0 1px 0 #0E1E3A, 0 0 2px #0E1E3A" }}>
                      {p}{"\uFE0E"}
                    </span>
                  )}
                </div>
              );
            }))}
          </div>
          {/* The moving knight */}
          <span aria-hidden="true"
            className="absolute flex items-center justify-center leading-none select-none text-[clamp(18px,5.2vw,38px)] transition-all duration-[900ms] ease-[cubic-bezier(.6,.05,.3,1)]"
            style={{ width: "12.5%", height: "12.5%", left: `${knight.left}%`, top: `${knight.top}%`, color: "#FBF8F1", textShadow: "0 1px 0 #0E1E3A, 0 0 2px #0E1E3A" }}>
            {"♘\uFE0E"}
          </span>
        </div>
        {/* Coordinates in English, as the coach says them */}
        <div aria-hidden="true" className="absolute left-0 top-0 bottom-5 w-5 grid grid-rows-8 text-[10px] font-semibold text-[#C49A4A]/80">
          {RANKS.map((r) => <span key={r} className="flex items-center justify-center">{r}</span>)}
        </div>
        <div aria-hidden="true" className="absolute left-5 right-0 bottom-0 h-5 grid grid-cols-8 text-[10px] font-semibold text-[#C49A4A]/80">
          {FILES.map((f) => <span key={f} className="flex items-center justify-center">{f}</span>)}
        </div>
      </div>
      <figcaption className="mt-4 text-center text-sm text-[#E9DCC0]">
        <span className="font-serif-tc text-lg text-white transition-opacity duration-700" style={{ opacity: moved ? 1 : 0 }}>
          “Knight to f3.”
        </span>
        <span className="block mt-1 text-[#C9D2E3]">{caption}</span>
      </figcaption>
    </figure>
  );
}
