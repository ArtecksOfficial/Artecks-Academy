// Which bookable subject a coach teaches. Mirrors SUBJECTS / coach_teaches in the
// backend (apps/academy/slots.py): empty subjects means chess.

const WORDS: Record<string, string[]> = {
  chess: ["chess", "西洋棋", "國際象棋", "棋"],
  english: ["english", "英文", "英語"],
};

export function coachTeaches(subjectsText: string | undefined, key: string): boolean {
  const text = (subjectsText || "").trim().toLowerCase();
  if (!text) return key === "chess";
  return (WORDS[key] ?? []).some((w) => text.includes(w));
}

/** The first subject parents can book right now that this coach teaches, or null. */
export function bookableSubjectFor(subjectsText: string | undefined, bookable: string[]): string | null {
  return bookable.find((k) => coachTeaches(subjectsText, k)) ?? null;
}
