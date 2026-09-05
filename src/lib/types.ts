// ─── Artecks Academy — shared types ──────────────────────────────────────────
// Source of truth: Django AcademySession / AcademyBooking models.
// No Supabase types used.

export interface Coach {
  id: number;
  name: string;
  name_zh: string;
  title: string;
  bio: string;
  avatar_initials: string;
  line_id: string;
  bank_name: string;
  bank_code: string;
  bank_account: string;
}

export interface PriceVariant {
  label: string;           // "1-on-1" | "1-on-2" | "1-on-3+"
  max_students: number | null;  // null = no cap
  price: number;           // regular price per student (TWD)
  member_price: number;    // member price per student (TWD)
}

// ── Provider & Membership ──────────────────────────────────────────────────────

export interface ProviderPlan {
  id: string;
  name: string;
  slug: string;
  discount_percent: string;   // Decimal serialised as string from Django
  stripe_price_id: string;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  plans: ProviderPlan[];
}

export interface MembershipCheckResult {
  is_member: boolean;
  provider_id?: string;
  provider_name?: string;
  plan_name?: string;
  discount_percent?: string;
  current_period_end?: string;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export type SessionStatus = "open" | "closed" | "cancelled";
export type ContactMethod = "whatsapp" | "line" | "sms" | "email";

export interface AcademySession {
  id: number;
  title: string;
  topic: string;
  age_group: string;
  start_time: string;        // ISO 8601
  end_time: string | null;
  location_name: string;
  location_address: string;
  price_twd: number;
  price_variants: PriceVariant[] | null;
  max_seats: number;
  available_spots: number;
  is_full: boolean;
  status: SessionStatus;
  booking_open: boolean;
  is_active: boolean;
  coach: Coach | null;
  provider?: Provider | null;
}

export interface BookingReport {
  id: number;
  session_title: string;
  session_start: string;
  location_name: string;
  private_access_notes: string;
  parent_name: string;
  student_name: string;
  status: string;
  xp_awarded: number;
  coins_awarded: number;
  created_at: string;
}

// ── Legacy compat ─────────────────────────────────────────────────────────────
export interface Session {
  id: number;
  title: string;
  topic: string | null;
  start_time: string;
  end_time: string | null;
  location_name: string | null;
  location_address: string | null;
  max_seats: number;
  price_twd: number | null;
  booking_open: boolean;
  status: SessionStatus;
}

export interface Booking {
  id: string;
  session_id: number;
  parent_name: string;
  parent_phone: string;
  student_name: string;
  student_age: number;
  contact_method: ContactMethod;
  contact_value: string;
  artecks_account_id: string | null;
  payment_last5: string | null;
  status: string;
  attended: boolean;
  rewards_credited: boolean;
  applied_discount_amount?: number;
  is_member?: boolean;
  created_at: string;
}

export interface LessonReport {
  id: string;
  booking_id: string;
  skill_tags: string[] | null;
  coach_notes: string | null;
  generated_summary: string | null;
  xp_awarded: number | null;
  coins_awarded: number | null;
  created_at: string;
}
