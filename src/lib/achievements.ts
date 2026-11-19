// ─── Parent achievements — shared types (see Django apps/academy/achievements.py) ─

export interface Bilingual { en: string; zh: string }

export interface BadgeReward {
  type: "gems" | "perk" | "note";
  gems?: number;
  perk?: string;
  en: string;
  zh: string;
}

export interface Badge {
  code: string;
  group: string;
  icon: string;
  title: Bilingual;
  description: Bilingual;
  reward: BadgeReward;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  target: number;
}

export interface Perk {
  id: number;
  kind: string;
  status: "available" | "used" | "void";
  label: Bilingual;
  how: Bilingual;
  from_badge: Bilingual | null;
  created_at: string;
  used_at: string | null;
}

export interface AchievementsOverview {
  groups: ({ key: string } & Bilingual)[];
  badges: Badge[];
  perks: Perk[];
  summary: { unlocked: number; total: number; gems_earned: number };
  new: Badge[];
}

export interface BellItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  code: string;
  badge: { icon: string; title: Bilingual; reward: BadgeReward } | null;
}

export interface BellData { unread: number; items: BellItem[]; new: Badge[] }

export function rewardText(r: BadgeReward, zh: boolean): string {
  if (r.type === "gems") return zh ? `+${r.gems} 顆寶石` : `+${r.gems} gems`;
  return zh ? r.zh : r.en;
}
