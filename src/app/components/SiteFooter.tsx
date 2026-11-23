"use client";
// ─── Site-wide footer ─────────────────────────────────────────────────────────
// One footer for every page (rendered from layout.tsx). Shows:
//   • the Academy LINE Official Account as the main contact button
//   • the customer-service email
//   • business details (only the fields filled in lib/legal/operator.ts)
//   • Privacy / Terms / Refunds (hidden until LEGAL_PUBLISHED)
//   • the Linkou Coffee Chess Club page and the other Artecks sites
// The club's LINE *group* invite is deliberately not here: anyone could join a
// chat full of parents from a public footer.
// Hidden in Kid Mode, where kids shouldn't be sent off-site.

import { useEffect, useState } from "react";
import LegalLinks from "./LegalLinks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { OPERATOR } from "@/lib/legal/operator";
import { STORE_URL } from "@/lib/store";
import { CHESS_URL, getKidSession } from "@/lib/kid-mode";

export const CLUB_FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61574222435834";

function lineAddUrl(id: string) {
  return `https://line.me/R/ti/p/${encodeURIComponent(id.startsWith("@") ? id : `~${id}`)}`;
}

export default function SiteFooter() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [kid, setKid] = useState(false);
  useEffect(() => { setKid(!!getKidSession()); }, []);
  if (kid) return null;

  const business = [
    OPERATOR.legalName,
    OPERATOR.taxId && `${zh ? "統一編號" : "Tax ID"} ${OPERATOR.taxId}`,
    OPERATOR.address,
  ].filter(Boolean);

  return (
    <footer className="mt-12 border-t border-gray-200 bg-white/60 px-5 pt-8 pb-28 lg:pb-8 text-sm text-gray-500">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg text-[#C49A4A]">♞</span>
            <span className="font-bold text-gray-700">{OPERATOR.brand}</span>
            <span className="text-xs text-gray-400">· {zh ? "新北市林口" : "Linkou, New Taipei"}</span>
          </div>
          {OPERATOR.line && (
            <a
              href={lineAddUrl(OPERATOR.line)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#05b34c] transition-colors"
            >
              {zh ? `LINE 聯絡我們 ${OPERATOR.line}` : `Message us on LINE ${OPERATOR.line}`}
            </a>
          )}
          {OPERATOR.email && (
            <a href={`mailto:${OPERATOR.email}`} className="w-fit hover:underline underline-offset-2">
              ✉️ {OPERATOR.email}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <a href={CLUB_FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
            ♟️ {zh ? "林口咖啡西洋棋俱樂部 →" : "Linkou Coffee Chess Club →"}
          </a>
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
            🛒 {zh ? "Artecks 商店 →" : "Artecks Store →"}
          </a>
          <a href={CHESS_URL} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
            ♞ {zh ? "Artecks 線上西洋棋 →" : "Play chess on Artecks →"}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {OPERATOR.brand}
          {business.length > 0 && <> · {business.join(" · ")}</>}
        </span>
        <LegalLinks />
      </div>
    </footer>
  );
}
