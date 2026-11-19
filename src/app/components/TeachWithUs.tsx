"use client";
// Homepage band inviting teachers who teach in English (chess or other subjects) to sign up at /teach.

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TEACH_URL } from "@/lib/teach";

export default function TeachWithUs() {
  const { locale } = useLanguage();
  const zh = locale === "zh";

  return (
    <section id="teach" aria-labelledby="teach-title" style={{ scrollMarginTop: "120px" }}
      className="rounded-2xl bg-[#0E1E3A] px-6 py-8 sm:px-10 sm:py-9 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
      <div className="flex-1">
        <h2 id="teach-title" className="font-serif-tc text-2xl sm:text-3xl font-black text-white">
          {zh ? "也想用英文教學嗎？" : "Want to teach in English too?"}
        </h2>
        <p className="mt-2 text-sm text-[#C9D2E3] leading-relaxed max-w-xl">
          {zh
            ? "我們正在尋找能用英文教孩子的老師，西洋棋或其他科目都歡迎。建立你的老師檔案、設定時間與地點，審核通過後家長就能預約你。"
            : "We're looking for teachers who can teach kids in English, whether that's chess or another subject. Create your teacher profile and set your hours and places. Once we approve you, parents can book you."}
        </p>
      </div>
      <Link href={TEACH_URL}
        className="inline-flex justify-center items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-black text-[#0E1E3A] bg-[#C49A4A] hover:bg-[#D4AE63] transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9DCC0]">
        {zh ? "成為老師" : "Become a teacher"}
      </Link>
    </section>
  );
}
