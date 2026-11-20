// Parent achievements (badges, the bell and "badge unlocked" pop-ups) are paused
// for now (owner decision, Nov 2026). /achievements shows the XP rules instead.
// Turn back on with NEXT_PUBLIC_ACADEMY_ACHIEVEMENTS_ENABLED=true (needs a redeploy).
export const ACHIEVEMENTS_ENABLED = process.env.NEXT_PUBLIC_ACADEMY_ACHIEVEMENTS_ENABLED === "true";
