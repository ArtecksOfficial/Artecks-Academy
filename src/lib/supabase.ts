// ─── Supabase Stub ────────────────────────────────────────────────────────────
// Supabase has been deprecated. All data is served by Django on Railway.
// These stubs prevent build failures from pages not yet migrated.
// Do NOT add new imports of this file — use @/lib/api instead.

export function createServerClient(): never {
  throw new Error(
    "Supabase is deprecated. Use the Django API via @/lib/api instead."
  );
}

export function createAdminClient(): never {
  throw new Error(
    "Supabase is deprecated. Use the Django API via @/lib/api instead."
  );
}
