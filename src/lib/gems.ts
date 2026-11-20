// Academy is XP-only for now (owner decision, Nov 2026). Gems stay hidden on the
// academy site until NEXT_PUBLIC_ACADEMY_GEMS_ENABLED=true, which should be set
// together with ACADEMY_GEMS_ENABLED=true on the backend. NEXT_PUBLIC_* is baked
// in at build time, so changing it needs a redeploy.
export const GEMS_ENABLED = process.env.NEXT_PUBLIC_ACADEMY_GEMS_ENABLED === "true";
