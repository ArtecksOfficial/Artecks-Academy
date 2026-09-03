"use server";
// ─── App-level Server Actions ─────────────────────────────────────────────────
// Sessions are now managed exclusively via Django admin.
// Seeding from the frontend is no longer supported.

export async function seedTestSession(): Promise<{ error?: string }> {
  return {
    error:
      "Sessions are managed via Django admin at artecks.com/admin/academy/. " +
      "Use the Django admin to create and manage sessions.",
  };
}
