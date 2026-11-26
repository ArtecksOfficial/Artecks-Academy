// Shape of GET /api/academy/coaches/<slug>/ (a coach's public page).
import type { Coach } from "./types";

export interface CoachPageData {
  coach: Omit<Coach, "line_id">;
  book_subject: string | null;
  price_twd: number | null;
  open_times: { area: string; days: { date: string; times: string[] }[] }[];
  open_days: number;
}
