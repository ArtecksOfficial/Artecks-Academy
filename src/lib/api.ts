// ─── Artecks Academy — Django API client ─────────────────────────────────────
// All server-side fetches go through here. Never import from "use client" code.

import type { AcademySession, BookingReport } from "./types";

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
