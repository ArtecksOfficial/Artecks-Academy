"use client";
// Renders one policy (privacy, terms or refund) from src/lib/legal/content.ts.

import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LEGAL_DOCS, type LegalSlug } from "@/lib/legal/content";
import { OPERATOR } from "@/lib/legal/operator";

const OTHERS: { slug: LegalSlug; href: string }[] = [
  { slug: "privacy", href: "/privacy" },
  { slug: "terms", href: "/terms" },
  { slug: "refund", href: "/refund" },
];

export default function LegalPage({ slug }: { slug: LegalSlug }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const doc = LEGAL_DOCS[slug];
  const pick = (b: { zh: string; en: string }) => (zh ? b.zh : b.en);

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-serif-tc text-3xl font-black text-[#13223F]">{pick(doc.title)}</h1>
        {OPERATOR.effectiveDate && (
          <p className="mt-2 text-xs text-gray-500">{zh ? "生效日期：" : "Effective: "}{OPERATOR.effectiveDate}</p>
        )}
        <p className="mt-5 text-sm leading-relaxed text-gray-700">{pick(doc.intro)}</p>

        {doc.sections.map((s) => (
          <section key={s.heading.en} className="mt-7">
            <h2 className="text-base font-black text-[#13223F]">{pick(s.heading)}</h2>
            {s.body.map((p) => (
              <p key={p.en} className="mt-2 text-sm leading-relaxed text-gray-700">{pick(p)}</p>
            ))}
          </section>
        ))}

        <section className="mt-8 rounded-3xl bg-white border border-[#E2DDD2] p-5 text-sm text-gray-700">
          <h2 className="text-base font-black text-[#13223F]">{zh ? "聯絡我們" : "Contact us"}</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-gray-500">{zh ? "經營者" : "Operator"}</dt>
            <dd>{OPERATOR.legalName || OPERATOR.brand}{OPERATOR.taxId ? (zh ? `（統一編號 ${OPERATOR.taxId}）` : ` (Tax ID ${OPERATOR.taxId})`) : ""}</dd>
            <dt className="text-gray-500">LINE</dt>
            <dd>{OPERATOR.line}</dd>
            {OPERATOR.email && (<><dt className="text-gray-500">Email</dt><dd>{OPERATOR.email}</dd></>)}
            {OPERATOR.address && (<><dt className="text-gray-500">{zh ? "地址" : "Address"}</dt><dd>{OPERATOR.address}</dd></>)}
          </dl>
        </section>

        <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#A07C34]">
          {OTHERS.filter((o) => o.slug !== slug).map((o) => (
            <Link key={o.slug} href={o.href} className="hover:underline">{pick(LEGAL_DOCS[o.slug].title)}</Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
