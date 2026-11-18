// ─── "Want to teach in English too?" — coach applications via LINE ───────────
// The button opens a chat with the Academy's LINE Official Account with a short
// application already typed in, so applicants send the details the owner needs
// to decide. Nothing is stored on the site; the owner replies on LINE.

const ACADEMY_LINE_ID = "@843yqhoa";

const TEMPLATE = {
  en: [
    "Hi Artecks Academy! I'd like to teach with you.",
    "",
    "Name:",
    "Chess level / rating:",
    "Teaching experience:",
    "Native language / English level:",
    "Where I can teach (Linkou / Taipei / online):",
    "When I'm available:",
  ],
  zh: [
    "您好，我想加入 Artecks Academy 的教練團隊！",
    "",
    "姓名：",
    "西洋棋程度／積分：",
    "教學經驗：",
    "母語／英文程度：",
    "可教學地區（林口／台北／線上）：",
    "可上課時段：",
  ],
};

export function teachLineUrl(zh: boolean): string {
  const text = (zh ? TEMPLATE.zh : TEMPLATE.en).join("\n");
  return `https://line.me/R/oaMessage/${encodeURIComponent(ACADEMY_LINE_ID)}/?${encodeURIComponent(text)}`;
}
