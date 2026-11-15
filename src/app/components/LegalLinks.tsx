"use client";
// Small "Privacy · Terms · Refunds" row. Renders nothing until the policies are published.

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LEGAL_PUBLISHED } from "@/lib/legal/operator";

export default function LegalLinks({ className = "" }: { className?: string }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  if (!LEGAL_PUBLISHED) return null;
  const links = [
    { href: "/privacy", label: zh ? "隱私權政策" : "Privacy" },
    { href: "/terms", label: zh ? "服務條款" : "Terms" },
    { href: "/refund", label: zh ? "退款政策" : "Refunds" },
  ];
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="underline-offset-2 hover:underline">{l.label}</Link>
      ))}
    </span>
  );
}
