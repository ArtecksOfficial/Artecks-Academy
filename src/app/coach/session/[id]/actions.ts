"use server";
// ─── Coach Session Actions ────────────────────────────────────────────────────

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const ARTECKS_API = process.env.ARTECKS_CORE_API_URL;
const ARTECKS_TOKEN = process.env.ARTECKS_INTERNAL_SERVICE_KEY;

export interface AttendResult {
  success: boolean;
  error?: string;
}

export async function markAttendedAndCredit(bookingId: string): Promise<AttendResult> {
  const supabase = createAdminClient();

  // Fetch booking to check state and get account info
  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select("attended, rewards_credited, artecks_account_id, session_id")
    .eq("id", bookingId)
    .single();

  if (fetchErr || !booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.attended && booking.rewards_credited) {
    return { success: true }; // Already done — idempotent
  }

  // Mark attended
  const { error: updateErr } = await supabase
    .from("bookings")
    .update({ attended: true, rewards_credited: true })
    .eq("id", bookingId);

  if (updateErr) {
    console.error("[markAttendedAndCredit] update error:", updateErr);
    return { success: false, error: updateErr.message };
  }

  // Credit Artecks rewards if account linked
  if (booking.artecks_account_id && ARTECKS_API && ARTECKS_TOKEN) {
    try {
      await fetch(`${ARTECKS_API}/api/v1/rewards/credit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ARTECKS_TOKEN}`,
        },
        body: JSON.stringify({
          account_id: booking.artecks_account_id,
          source_booking_id: bookingId,
          xp: 100,
          coins: 30,
        }),
      });
    } catch (e) {
      console.error("[markAttendedAndCredit] rewards API error:", e);
      // Non-fatal — booking is already marked attended
    }
  }

  revalidatePath(`/coach/session/${booking.session_id}`);
  return { success: true };
}

export interface CreateReportState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function createLessonReport(
  _prev: CreateReportState,
  formData: FormData
): Promise<CreateReportState> {
  const bookingId = formData.get("booking_id") as string;
  const skillTags = formData.getAll("skill_tags") as string[];
  const coachNotes = formData.get("coach_notes") as string;
  const xpAwarded = parseInt(formData.get("xp_awarded") as string, 10) || 100;
  const coinsAwarded = parseInt(formData.get("coins_awarded") as string, 10) || 30;

  if (!bookingId || !coachNotes || skillTags.length === 0) {
    return { status: "error", message: "請填寫教練筆記並選擇至少一個技能標籤。" };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("lesson_reports").upsert(
    {
      booking_id: bookingId,
      skill_tags: skillTags,
      coach_notes: coachNotes,
      xp_awarded: xpAwarded,
      coins_awarded: coinsAwarded,
    },
    { onConflict: "booking_id" }
  );

  if (error) {
    console.error("[createLessonReport] error:", error);
    return { status: "error", message: error.message };
  }

  return { status: "success" };
}
