"use server";
// ─── Session Booking Actions ──────────────────────────────────────────────────
// Posts booking to Django API. No Supabase dependency.

import { postBooking } from "@/lib/api";
import { revalidatePath } from "next/cache";

export type ContactMethod = "whatsapp" | "line" | "sms" | "email";

export interface BookingState {
  status: "idle" | "success" | "error";
  message?: string;
  bookingId?: string;
}

export async function bookSession(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const sessionId = formData.get("session_id") as string;
  const parentName = formData.get("parent_name") as string;
  const parentPhone = formData.get("parent_phone") as string;
  const studentName = formData.get("student_name") as string;
  const studentAge = parseInt(formData.get("student_age") as string, 10);
  const artecksAccountId = (formData.get("artecks_account_id") as string) || "";
  const paymentLast5 = (formData.get("payment_last5") as string) || "";
  const contactMethod = formData.get("contact_method") as ContactMethod;
  const contactValue = formData.get("contact_value") as string;

  if (!sessionId || !parentName || !parentPhone || !studentName || !studentAge || !contactMethod || !contactValue) {
    return { status: "error", message: "請填寫所有必填欄位。" };
  }

  const result = await postBooking(sessionId, {
    parent_name: parentName,
    parent_phone: parentPhone,
    student_name: studentName,
    student_age: studentAge,
    contact_method: contactMethod,
    contact_value: contactValue,
    artecks_account_id: artecksAccountId,
    payment_last5: paymentLast5,
  });

  if (!result.success) {
    const msg = result.error ?? "";
    if (msg.includes("full") || msg.includes("額滿")) {
      return { status: "error", message: "很抱歉，名額已滿。" };
    }
    if (msg.includes("already") || msg.includes("已報名")) {
      return { status: "error", message: "此學生已報名本堂課。" };
    }
    if (msg.includes("not open") || msg.includes("closed") || msg.includes("未開放")) {
      return { status: "error", message: "此課程目前未開放報名。" };
    }
    return { status: "error", message: msg || "報名失敗，請稍後再試。" };
  }

  revalidatePath(`/session/${sessionId}`);
  return { status: "success", bookingId: String(result.booking_id) };
}
