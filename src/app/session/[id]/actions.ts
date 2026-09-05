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
  appliedDiscountAmount?: number;
  isMember?: boolean;
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
  const contactMethod = formData.get("contact_method") as ContactMethod;
  const contactValue = formData.get("contact_value") as string;
  const chessExperienceLevel = (formData.get("chess_experience_level") as string) || "";
  const specialNotes = (formData.get("special_notes") as string) || "";
  const artecksAccountId = (formData.get("artecks_account_id") as string) || "";

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
    chess_experience_level: chessExperienceLevel,
    special_notes: specialNotes,
    artecks_account_id: artecksAccountId,
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
  return {
    status: "success",
    bookingId: String(result.booking_id),
    appliedDiscountAmount: result.applied_discount_amount ?? 0,
    isMember: result.is_member ?? false,
  };
}

/**
 * Check membership status using the provider-aware endpoint.
 * Accepts either providerSlug (for session-level context) or falls back to
 * the legacy endpoint when no provider context is available.
 */
export async function checkMembership(
  accountId: string,
  providerSlug?: string
): Promise<{ is_member: boolean; discount_percent?: string; plan_name?: string }> {
  const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
  try {
    if (providerSlug) {
      // New provider-aware GET endpoint
      const params = new URLSearchParams({
        provider_slug: providerSlug,
        account_id: accountId.trim().toUpperCase(),
      });
      const res = await fetch(
        `${BACKEND}/api/academy/memberships/check/?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) return { is_member: false };
      return res.json();
    }

    // Legacy fallback (no provider context)
    const res = await fetch(`${BACKEND}/api/academy/check-membership/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: accountId.trim().toUpperCase() }),
      cache: "no-store",
    });
    if (!res.ok) return { is_member: false };
    return res.json();
  } catch {
    return { is_member: false };
  }
}

// ── Subscription Checkout ─────────────────────────────────────────────────────
export interface SubscriptionCheckoutPayload {
  plan_id: string;
  customer_email?: string;
  customer_phone?: string;
  artecks_account_id?: string;
  success_url: string;
  cancel_url: string;
}

export async function createSubscriptionCheckoutAction(
  payload: SubscriptionCheckoutPayload
): Promise<{ checkout_url: string } | null> {
  const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${BACKEND}/api/academy/subscriptions/checkout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
