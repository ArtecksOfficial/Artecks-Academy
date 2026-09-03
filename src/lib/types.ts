// ─── Convenience types re-exported from Database ─────────────────────────────
import type { Database } from "./database.types";

export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type LessonReport = Database["public"]["Tables"]["lesson_reports"]["Row"];
export type ContactMethod = Database["public"]["Tables"]["bookings"]["Row"]["contact_method"];
