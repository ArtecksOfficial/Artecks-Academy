"use server";
// ─── Coach Session Actions — Stub ─────────────────────────────────────────────
// Attendance and lesson reports are now managed via Django admin.
// These stubs exist so CoachClient compiles without errors.

import { revalidatePath } from "next/cache";

export interface AttendResult {
  success: boolean;
  error?: string;
}

export async function markAttendedAndCredit(_bookingId: string): Promise<AttendResult> {
  return {
    success: false,
    error: "Attendance is now marked via Django admin at artecks.com/admin/academy/",
  };
}

export interface CreateReportState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function createLessonReport(
  _prev: CreateReportState,
  _formData: FormData
): Promise<CreateReportState> {
  return {
    status: "error",
    message: "Lesson reports are now managed via Django admin at artecks.com/admin/academy/",
  };
}
