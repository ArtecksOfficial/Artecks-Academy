// Artecks Lingo: each child's English word bank (backend /api/lingo/*), practised on /words.

export interface LingoCounts { total: number; learning: number; remembered: number; used: number; due: number }

/** "brave = 勇敢的 | The knight is brave." per line → words (meaning and example optional). */
export function parseWords(lines: string) {
  return lines.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 30).map((l) => {
    const [main, example = ""] = l.split("|").map((x) => x.trim());
    const [text, meaning = ""] = main.split(/=|：|:/).map((x) => x.trim());
    return { text: text.slice(0, 60), meaning: meaning.slice(0, 120), example: example.slice(0, 200) };
  }).filter((w) => w.text);
}

// ─── /words page (practice inside Academy, same backend as lingo.artecks.com) ──
export type Stage = "new" | "learning" | "remembered" | "used";

export interface LingoRules { remembered_xp: number; used_xp: number; used_gems: number; used_weekly_max: number; remembered_after: number }
export const DEFAULT_RULES: LingoRules = { remembered_xp: 5, used_xp: 10, used_gems: 0, used_weekly_max: 20, remembered_after: 4 };

export interface LingoStudent { id: number; name: string; age: number; words: LingoCounts }
export interface LingoMe { rules: LingoRules; kid_mode: boolean; is_coach: boolean; students: LingoStudent[] }

export interface LingoWord {
  id: number; language: string; text: string; reading: string; meaning: string; example: string;
  stage: Stage; box: number; due_at: string; reviews: number; correct: number;
  used_at: string | null; gems_awarded: number; added_by_coach: string | null;
}
export interface ReadyWord extends LingoWord { student_id: number; student_name: string }

export type Card =
  | { id: number; language: string; mode: "type"; meaning: string; hint: string; letters: number; first: string }
  | { id: number; language: string; mode: "choose"; meaning: string; options: { text: string; reading: string }[] }
  | { id: number; language: string; mode: "flash"; text: string; reading: string; example: string };

export interface AnswerResult { correct: boolean; text: string; reading: string; meaning: string; stage: Stage; box: number; due_at: string }
