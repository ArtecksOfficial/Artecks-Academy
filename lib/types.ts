// ─── Artecks Academy — Shared Types ──────────────────────────────────────────
// Re-exports from the Supabase-generated database types file.
// Import individual types from here; import Database from database.types directly.

export type { Database } from "../src/lib/database.types";
export type { ContactMethod, SessionStatus, BookingStatus, PaymentStatus } from "../src/lib/database.types";

// Convenience row-type aliases
import type { Database } from "../src/lib/database.types";

export type Session      = Database["public"]["Tables"]["sessions"]["Row"];
export type Booking      = Database["public"]["Tables"]["bookings"]["Row"];
export type LessonReport = Database["public"]["Tables"]["lesson_reports"]["Row"];

export interface BookSessionResult {
  success: boolean;
  booking_id?: string;
  private_access_notes?: string;
  error?: string;
}

export interface BookingWithReport extends Booking {
  lesson_reports: LessonReport | null;
  sessions: Pick<Session, "title" | "topic" | "start_time" | "end_time" | "location_name"> | null;
}
