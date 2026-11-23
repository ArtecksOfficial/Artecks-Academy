"use client";
// ─── Site-wide footer ─────────────────────────────────────────────────────────
// Rendered once from layout.tsx. Dark navy band in the sidebar's colours:
//   1. a "book a trial" call-to-action strip
//   2. brand + LINE button + the club's social accounts
//   3. link columns: Lessons / Artecks / Contact
//   4. bottom bar: © + business details, Privacy·Terms·Refunds, language
// Business details come from lib/legal/operator.ts and only show when filled.
// The club's LINE *group* invite is deliberately not here: anyone could join a
// chat full of parents from a public footer.
// Hidden in Kid Mode, where kids shouldn't be sent off-site.

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Facebook, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import LegalLinks from "./LegalLinks";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import { OPERATOR } from "@/lib/legal/operator";
import { STORE_URL } from "@/lib/store";
import { TEACH_URL } from "@/lib/teach";
import { getKidSession } from "@/lib/kid-mode";

export const CLUB_FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61574222435834";
export const CLUB_INSTAGRAM_URL = "https://www.instagram.com/linkoucoffeechessclub/";

function lineAddUrl(id: string) {
  return `https://line.me/R/ti/p/${encodeURIComponent(id.startsWith("@") ? id : `~${id}`)}`;
}

interface FooterLink { href: string; en: string; zh: string; external?: boolean }

const LESSONS: FooterLink[] = [
  { href: "/coaches", en: "Coaches & programs", zh: "教練與課程" },
  { href: "/book", en: "Book a lesson", zh: "預約課程" },
  { href: "/packages", en: "Lesson packages", zh: "課程套票" },
  { href: "/leaderboard", en: "Leaderboard", zh: "排行榜" },
  { href: "/#faq", en: "FAQ", zh: "常見問題" },
];

const ARTECKS: FooterLink[] = [
  { href: STORE_URL, en: "Artecks Store", zh: "Artecks 商店", external: true },
  { href: CHESS_URL, en: "Artecks Chess", zh: "Artecks Chess", external: true },
  { href: TEACH_URL, en: "Teach with us", zh: "成為老師" },
];

function FooterLinkItem({ link, zh }: { link: FooterLink; zh: boolean }) {
  const cls = "text-sm text-white/70 hover:text-[#E7C98A] transition-colors";
  const label = zh ? link.zh : link.en;
  return (
    <li>
      {link.external ? (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
      ) : (
        <Link href={link.href} className={cls}>{label}</Link>
      )}
    </li>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#E7C98A]">{title}</h3>
      {children}
    </div>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-[#E7C98A] hover:text-[#E7C98A] transition-colors"
    >
      {children}
    </a>
  );
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
    <footer className="bg-[#0E1E3A] text-white">
      {/* 1. Call to action */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-black">
              {zh ? "讓孩子用英文學西洋棋" : "Chess, taught in English, right here in Linkou"}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {zh ? "第一次上課？先預約一堂體驗課。" : "New to the academy? Start with a trial lesson."}
            </p>
          </div>
          <Link
            href="/book"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#E7C98A] px-6 py-3 text-sm font-bold text-[#0E1E3A] hover:bg-[#f0d9a5] transition-colors"
          >
            {zh ? "預約體驗課" : "Book a trial lesson"} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* 2 + 3. Brand and link columns */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <Link href="/" className="flex w-fit items-center gap-3">
            <img src="/logo.png" alt="" className="h-10 w-auto rounded bg-white p-1" />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">Artecks</span>
              <span className="text-lg font-black">Academy</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            {zh
              ? "林口的全英語兒童西洋棋課程，由教練帶著孩子一步步進步。"
              : "English-taught chess lessons for kids in Linkou, with coaches who track every child's progress."}
          </p>
          {OPERATOR.line && (
            <a
              href={lineAddUrl(OPERATOR.line)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#05b34c] transition-colors"
            >
              <MessageCircle size={16} />
              {zh ? "加入 LINE 好友" : "Add us on LINE"}
            </a>
          )}
          <div className="flex items-center gap-2">
            <span className="mr-1 text-xs text-white/50">{zh ? "俱樂部動態" : "Club updates"}</span>
            <SocialIcon href={CLUB_FACEBOOK_URL} label="Facebook"><Facebook size={16} /></SocialIcon>
            <SocialIcon href={CLUB_INSTAGRAM_URL} label="Instagram"><Instagram size={16} /></SocialIcon>
          </div>
        </div>

        <Column title={zh ? "課程" : "Lessons"}>
          <ul className="flex flex-col gap-2.5">
            {LESSONS.map((l) => <FooterLinkItem key={l.href} link={l} zh={zh} />)}
          </ul>
        </Column>

        <Column title="Artecks">
          <ul className="flex flex-col gap-2.5">
            {ARTECKS.map((l) => <FooterLinkItem key={l.href} link={l} zh={zh} />)}
          </ul>
        </Column>

        <Column title={zh ? "聯絡我們" : "Contact"}>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            {OPERATOR.line && (
              <li className="flex items-center gap-2.5">
                <MessageCircle size={15} className="shrink-0 text-[#E7C98A]" />
                <a href={lineAddUrl(OPERATOR.line)} target="_blank" rel="noopener noreferrer" className="hover:text-[#E7C98A] transition-colors">
                  LINE {OPERATOR.line}
                </a>
              </li>
            )}
            {OPERATOR.email && (
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-[#E7C98A]" />
                <a href={`mailto:${OPERATOR.email}`} className="break-all hover:text-[#E7C98A] transition-colors">{OPERATOR.email}</a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#E7C98A]" />
              <span>{OPERATOR.address || (zh ? "新北市林口區" : "Linkou, New Taipei City")}</span>
            </li>
          </ul>
        </Column>
      </div>

      {/* 4. Bottom bar — extra bottom padding clears the phone tab bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 pt-5 pb-28 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between lg:pb-6">
          <span>
            © {new Date().getFullYear()} {OPERATOR.brand}
            {business.length > 0 && <> · {business.join(" · ")}</>}
          </span>
          <div className="flex items-center gap-4">
            <LegalLinks className="text-white/60" />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
