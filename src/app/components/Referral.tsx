"use client";
// Referral pieces shared by the booking, package, pay and account pages:
//  * ReferralWelcome — banner for a parent who arrived through someone's invite link
//  * ReferralShare   — "invite other parents" card with copy + share on LINE

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { checkRef, type RefCheck } from "@/lib/referral";

export function ReferralWelcome({ code }: { code: string }) {
  const { t } = useLanguage();
  const [check, setCheck] = useState<RefCheck | null>(null);
  useEffect(() => {
    if (!code) { setCheck(null); return; }
    checkRef(code).then(setCheck);
  }, [code]);
  if (!check?.valid) return null;
  const text = check.from_name ? t("refWelcome").replace("{name}", check.from_name) : t("refWelcomeNoName");
  return (
    <div role="status" className="flex items-start gap-3 rounded-2xl bg-[#FBF5E8] border border-[#E7C98A] px-4 py-3 text-sm font-semibold text-[#13223F]">
      <Gift size={18} className="text-[#A07C34] flex-shrink-0 mt-0.5" aria-hidden />
      <span>{text}</span>
    </div>
  );
}

export function ReferralShare({ url, rewards = 0, families = 0 }: { url: string; rewards?: number; families?: number }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const share = `https://line.me/R/share?text=${encodeURIComponent(`${t("refShareText")} ${url}`)}`;
  return (
    <section className="rounded-3xl bg-white border border-[#E7C98A] p-5 shadow-sm">
      <h2 className="text-base font-black text-gray-900 inline-flex items-center gap-2">
        <Gift size={17} className="text-[#A07C34]" aria-hidden /> {t("refTitle")}
      </h2>
      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{t("refBody")}</p>
      {(rewards > 0 || families > 0) && (
        <p className="text-sm font-semibold text-[#13223F] mt-2">
          {rewards > 0 && <span className="block">{t("refRewardsWaiting").replace("{n}", String(rewards))}</span>}
          {families > 0 && <span className="block text-xs font-normal text-gray-500 mt-0.5">{t("refFamilies").replace("{n}", String(families))}</span>}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
        <span className="flex-1 truncate font-mono text-xs text-gray-700">{url}</span>
        <button type="button" className="text-xs font-bold text-[#A07C34] flex-shrink-0"
          onClick={() => navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => {})}>
          {copied ? t("refCopied") : t("refCopy")}
        </button>
      </div>
      <a href={share} target="_blank" rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center rounded-xl py-3 text-sm font-bold text-white" style={{ backgroundColor: "#06C755" }}>
        {t("refShareLine")}
      </a>
    </section>
  );
}
