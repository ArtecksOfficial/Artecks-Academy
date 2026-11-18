"use client";
// Homepage band inviting teachers who teach in English (chess or other subjects) to apply over LINE.

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TEACH_LINE_URL } from "@/lib/teach";

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
            ? "我們正在尋找能用英文教孩子的老師，西洋棋或其他科目都歡迎。在 LINE 傳訊息給我們，介紹一下您自己和您教的科目，我們會盡快回覆。"
            : "We're looking for teachers who can teach kids in English, whether that's chess or another subject. Send us a message on LINE about yourself and what you teach, and we'll get back to you."}
        </p>
      </div>
      <a href={TEACH_LINE_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex justify-center items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-black text-white bg-[#06C755] hover:bg-[#05b34c] transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9DCC0]">
        {zh ? "用 LINE 跟我們聊聊" : "Message us on LINE"}
      </a>
    </section>
  );
}
