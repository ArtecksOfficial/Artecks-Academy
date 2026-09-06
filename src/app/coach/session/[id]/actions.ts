"use server";
// ─── Coach Session Actions ────────────────────────────────────────────────────
// Marks attendance and creates lesson reports via Django API.

import { revalidatePath } from "next/cache";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
const BASE = `${BACKEND}/api/academy`;

// ── Attendance + reward credit ────────────────────────────────────────────────

export interface AttendResult {
  success: boolean;
  error?: string;
}

export async function markAttendedAndCredit(bookingId: string): Promise<AttendResult> {
  try {
    // 1. Mark attendance in Django
    const res = await fetch(`${BASE}/bookings/${bookingId}/attend/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text || "Failed to mark attendance" };
    }

    const data = await res.json();

    // 2. Credit rewards via wallet API (fire-and-forget)
    if (data.artecks_account_id) {
      fetch(`${BACKEND}/api/wallet/credit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: data.artecks_account_id,
          xp: data.xp_awarded ?? 100,
          gems: data.coins_awarded ?? 30,
          source: "academy_attendance",
          booking_id: bookingId,
        }),
        cache: "no-store",
      }).catch(() => {});
    }

    revalidatePath("/coach/session");
    return { success: true };
  } catch {
    return { success: false, error: "Network error — check connection and try again" };
  }
}

// ── Lesson report ─────────────────────────────────────────────────────────────

export interface CreateReportState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function createLessonReport(
  _prev: CreateReportState,
  formData: FormData
): Promise<CreateReportState> {
  const bookingId = formData.get("booking_id") as string;
  const coachNotes = formData.get("coach_notes") as string;
  const xpAwarded = parseInt(formData.get("xp_awarded") as string, 10) || 100;
  const coinsAwarded = parseInt(formData.get("coins_awarded") as string, 10) || 30;
  const skillTags = formData.getAll("skill_tags") as string[];

  if (!bookingId || !coachNotes) {
    return { status: "error", message: "請填寫必要欄位" };
  }

  try {
    const res = await fetch(`${BASE}/bookings/${bookingId}/report/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coach_notes: coachNotes,
        skill_tags: skillTags,
        xp_awarded: xpAwarded,
        coins_awarded: coinsAwarded,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return { status: "error", message: text || "儲存失敗，請稍後再試" };
    }

    revalidatePath(`/report/${bookingId}`);
    return { status: "success" };
  } catch {
    return { status: "error", message: "網路錯誤，請確認連線後再試" };
  }
}
