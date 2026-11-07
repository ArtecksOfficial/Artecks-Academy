"use client";

import SiteHeader from "@/app/components/SiteHeader";
import Link from "next/link";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import RequestForm from "./RequestForm";

export default function RequestPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F6F2" }}>
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="font-serif-tc text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{t("reqTitle")}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-3 mb-8 leading-relaxed">{t("reqSub")}</p>
        <RequestForm />
      </main>
    </div>
  );
}
