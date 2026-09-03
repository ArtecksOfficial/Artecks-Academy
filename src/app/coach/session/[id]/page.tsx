// ─── Coach Cockpit — Redirects to Django Admin ────────────────────────────────
// The coach cockpit has been migrated to Django admin.
// Lesson reports and attendance are managed via artecks.com/admin/academy/

import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoachSessionPage({ params }: PageProps) {
  const { id } = await params;
  // Redirect to Django admin booking list for this session
  redirect(
    `https://artecks.com/admin/academy/academybooking/?session__id__exact=${id}`
  );
}
