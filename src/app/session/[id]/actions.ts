"use server";
// ─── Session Booking Actions ──────────────────────────────────────────────────

import { createServerClient } from "@/lib/supabase";
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
  const artecksAccountId = (formData.get("artecks_account_id") as string) || null;
  const paymentLast5 = (formData.get("payment_last5") as string) || null;
  const contactMethod = formData.get("contact_method") as ContactMethod;
  const contactValue = formData.get("contact_value") as string;

  if (!sessionId || !parentName || !parentPhone || !studentName || !studentAge || !contactMethod || !contactValue) {
    return { status: "error", message: "請填寫所有必填欄位。" };
  }

  const supabase = createServerClient();

  const { data, error } = await supabase.rpc("book_session_atomic", {
    p_session_id: sessionId,
    p_parent_name: parentName,
    p_parent_phone: parentPhone,
    p_student_name: studentName,
    p_student_age: studentAge,
    p_contact_method: contactMethod,
    p_contact_value: contactValue,
    p_artecks_account_id: artecksAccountId,
    p_payment_last5: paymentLast5,
  });

  if (error) {
    console.error("[bookSession] RPC transport error:", error);
    return { status: "error", message: "報名失敗，請稍後再試。" };
  }

  // RPC returns { success, booking_id, private_access_notes } or { success: false, error }
  if (!data?.success) {
    const msg: string = data?.error ?? "";
    if (msg.includes("completely full")) {
      return { status: "error", message: "很抱歉，名額已滿。" };
    }
    if (msg.includes("already booked")) {
      return { status: "error", message: "此學生已報名本堂課。" };
    }
    if (msg.includes("not open") || msg.includes("closed")) {
      return { status: "error", message: "此課程目前未開放報名。" };
    }
    return { status: "error", message: msg || "報名失敗，請稍後再試。" };
  }

  revalidatePath(`/session/${sessionId}`);
  return { status: "success", bookingId: data.booking_id };
}
