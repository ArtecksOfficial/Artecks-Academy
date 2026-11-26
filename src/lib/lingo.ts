// Artecks Lingo (lingo.artecks.com): each child's English word bank.
export const LINGO_URL = "https://lingo.artecks.com";

export interface LingoCounts { total: number; learning: number; remembered: number; used: number; due: number }

/** "brave = 勇敢的 | The knight is brave." per line → words (meaning and example optional). */
export function parseWords(lines: string) {
  return lines.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 30).map((l) => {
    const [main, example = ""] = l.split("|").map((x) => x.trim());
    const [text, meaning = ""] = main.split(/=|：|:/).map((x) => x.trim());
    return { text: text.slice(0, 60), meaning: meaning.slice(0, 120), example: example.slice(0, 200) };
  }).filter((w) => w.text);
}
