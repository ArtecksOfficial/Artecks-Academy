// ─── Client-side Academy calls ────────────────────────────────────────────────
// Replaces the former Server Actions (src/app/session/[id]/actions.ts,
// src/app/my-membership/actions.ts, src/app/actions.ts). A static export can't
// run Server Actions, so these call the /api/* route handlers instead — the
// same handlers on the web, and on the deployed web app from the iOS build.

export type ContactMethod = "whatsapp" | "line" | "sms" | "email";

export interface BookingState {
  status: "idle" | "success" | "error";
  message?: string;
  bookingId?: string;
  appliedDiscountAmount?: number;
  isMember?: boolean;
}

interface BookingResult {
  success: boolean;
  booking_id?: number;
  applied_discount_amount?: number;
  is_member?: boolean;
  error?: string;
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
  const accountConsent = formData.get("account_consent") === "on";

  if (!sessionId || !parentName || !parentPhone || !studentName || !studentAge || !contactMethod || !contactValue) {
    return { status: "error", message: "請填寫所有必填欄位。" };
  }

  let result: BookingResult;
  try {
    const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parent_name: parentName,
        parent_phone: parentPhone,
        student_name: studentName,
        student_age: studentAge,
        contact_method: contactMethod,
        contact_value: contactValue,
        chess_experience_level: chessExperienceLevel,
        special_notes: specialNotes,
        artecks_account_id: artecksAccountId,
        account_consent: accountConsent,
      }),
    });
    result = await res.json();
  } catch {
    return { status: "error", message: "報名失敗，請稍後再試。" };
  }

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

  return {
    status: "success",
    bookingId: String(result.booking_id),
    appliedDiscountAmount: result.applied_discount_amount ?? 0,
    isMember: result.is_member ?? false,
  };
}

/**
 * Check membership status. Uses the provider-aware endpoint when providerSlug
 * is given, otherwise the legacy account-id endpoint.
 */
export async function checkMembership(
  accountId: string,
  providerSlug?: string
): Promise<{ is_member: boolean; discount_percent?: string; plan_name?: string }> {
  try {
    const res = providerSlug
      ? await fetch(
          `/api/memberships/check?${new URLSearchParams({
            provider_slug: providerSlug,
            account_id: accountId.trim().toUpperCase(),
          }).toString()}`,
          { cache: "no-store" }
        )
      : await fetch("/api/memberships/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account_id: accountId.trim().toUpperCase() }),
        });
    if (!res.ok) return { is_member: false };
    return res.json();
  } catch {
    return { is_member: false };
  }
}

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
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface MembershipLookupResult {
  is_member: boolean;
  provider_name?: string;
  plan_name?: string;
  discount_percent?: number | string;
  current_period_end?: string;
  error?: string;
}

export async function lookupMembershipByPhone(
  phone: string,
  providerSlug: string = "issac"
): Promise<MembershipLookupResult> {
  try {
    const params = new URLSearchParams({ provider_slug: providerSlug, phone: phone.trim() });
    const res = await fetch(`/api/memberships/check?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) return { is_member: false, error: "Provider not found." };
      if (res.status === 400) return { is_member: false };
      return { is_member: false, error: "Server error. Please try again." };
    }
    return res.json();
  } catch {
    return { is_member: false, error: "Connection error. Please try again." };
  }
}

export async function seedTestSession(): Promise<{ error?: string }> {
  return {
    error:
      "Sessions are managed via Django admin at store.artecks.com/admin/academy/. " +
      "Use the Django admin to create and manage sessions.",
  };
}
