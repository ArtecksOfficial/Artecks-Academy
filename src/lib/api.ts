// ─── Artecks Academy — Django API client ─────────────────────────────────────
// All server-side fetches go through here. Never import from "use client" code.

import type { AcademySession, BookingReport, MembershipCheckResult } from "./types";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
const BASE = `${BACKEND}/api/academy`;

function revalidation() {
  // Next.js 15 fetch cache: revalidate every 60 s so session spots stay fresh
  return { next: { revalidate: 60 } } as RequestInit;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<AcademySession[]> {
  const res = await fetch(`${BASE}/sessions/`, revalidation());
  if (!res.ok) {
    console.error("[api] fetchSessions failed", res.status, await res.text());
    return [];
  }
  return res.json();
}

export async function fetchSession(id: string | number): Promise<AcademySession | null> {
  const res = await fetch(`${BASE}/sessions/${id}/`, revalidation());
  if (!res.ok) return null;
  return res.json();
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export interface BookingPayload {
  parent_name: string;
  parent_phone: string;
  student_name: string;
  student_age: number;
  contact_method: string;
  contact_value: string;
  chess_experience_level?: string;
  special_notes?: string;
  artecks_account_id?: string;
}

export interface BookingResult {
  success: boolean;
  booking_id?: number;
  private_access_notes?: string;
  applied_discount_amount?: number;
  is_member?: boolean;
  error?: string;
}

export async function postBooking(
  sessionId: string | number,
  payload: BookingPayload
): Promise<BookingResult> {
  const res = await fetch(`${BASE}/sessions/${sessionId}/book/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = await res.json();
  return data;
}

// ── Membership ────────────────────────────────────────────────────────────────

export interface MembershipCheckParams {
  provider_id?: string;
  provider_slug?: string;
  email?: string;
  phone?: string;
  account_id?: string;
}

export async function checkProviderMembership(
  params: MembershipCheckParams
): Promise<MembershipCheckResult> {
  const qs = new URLSearchParams();
  if (params.provider_id)   qs.set("provider_id",   params.provider_id);
  if (params.provider_slug) qs.set("provider_slug", params.provider_slug);
  if (params.email)         qs.set("email",          params.email);
  if (params.phone)         qs.set("phone",          params.phone);
  if (params.account_id)   qs.set("account_id",     params.account_id);

  try {
    const res = await fetch(`${BASE}/memberships/check/?${qs.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { is_member: false };
    return res.json();
  } catch {
    return { is_member: false };
  }
}

// ── Subscription checkout ─────────────────────────────────────────────────────

export interface SubscriptionCheckoutPayload {
  plan_id: string;
  customer_email?: string;
  customer_phone?: string;
  artecks_account_id?: string;
  success_url: string;
  cancel_url: string;
}

export async function createSubscriptionCheckout(
  payload: SubscriptionCheckoutPayload
): Promise<{ checkout_url: string } | null> {
  try {
    const res = await fetch(`${BASE}/subscriptions/checkout/`, {
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

// ── Report ────────────────────────────────────────────────────────────────────

export async function fetchBookingReport(
  bookingId: string | number
): Promise<BookingReport | null> {
  const res = await fetch(
    `${BASE}/bookings/${bookingId}/report/`,
    revalidation()
  );
  if (!res.ok) return null;
  return res.json();
}

// ── My Bookings ───────────────────────────────────────────────────────────────

export interface MyBooking {
  id: number;
  session_title: string;
  session_start: string;
  session_end: string | null;
  location_name: string;
  price_twd: number;
  student_name: string;
  status: string;
  payment_status: string;
  xp_awarded: number;
  coins_awarded: number;
  applied_discount_amount: number;
  artecks_account_id: string | null;
  created_at: string;
}

export async function fetchMyBookings(phone: string): Promise<MyBooking[]> {
  const res = await fetch(
    `${BASE}/bookings/mine/?phone=${encodeURIComponent(phone)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

// ── Provider plans (public, no account_id required) ───────────────────────────

export async function fetchProviderPlans(
  providerSlug: string
): Promise<import("./types").Provider | null> {
  try {
    const res = await fetch(`${BASE}/providers/${providerSlug}/plans/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
