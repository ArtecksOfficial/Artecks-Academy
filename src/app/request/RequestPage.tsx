"use client";

import Link from "next/link";
import { LanguageToggle, useLanguage } from "@/lib/i18n/LanguageContext";
import RequestForm from "./RequestForm";

export default function RequestPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F7FB" }}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Artecks" className="h-8 w-auto" />
            <span className="text-sm font-black text-gray-900">Artecks Academy</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{t("reqTitle")}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-3 mb-8 leading-relaxed">{t("reqSub")}</p>
        <RequestForm />
      </main>
    </div>
  );
}
