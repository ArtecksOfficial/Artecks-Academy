// Auto-generated shape matching supabase/migrations/20260903000000_initial_schema.sql
// Regenerate with: npx supabase gen types typescript --linked > src/lib/database.types.ts

export type ContactMethod = "whatsapp" | "line" | "sms" | "email";
export type SessionStatus = "open" | "full" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type BookingStatus = "confirmed" | "cancelled" | "attended";

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          topic: string | null;
          age_group: string | null;
          location_name: string | null;
          location_address: string | null;
          private_access_notes: string | null;
          start_time: string;
          end_time: string | null;
          price_twd: number | null;
          capacity: number | null;
          max_seats: number;
          booking_open: boolean;
          status: SessionStatus;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          topic?: string | null;
          age_group?: string | null;
          location_name?: string | null;
          location_address?: string | null;
          private_access_notes?: string | null;
          start_time: string;
          end_time?: string | null;
          price_twd?: number | null;
          capacity?: number | null;
          max_seats?: number;
          booking_open?: boolean;
          status?: SessionStatus;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          parent_name: string;
          parent_phone: string | null;
          student_name: string;
          student_age: number | null;
          contact_method: ContactMethod;
          contact_value: string;
          artecks_account_id: string | null;
          artecks_identifier: string | null;
          payment_status: PaymentStatus | null;
          payment_last5: string | null;
          attended: boolean;
          rewards_credited: boolean;
          status: BookingStatus;
        };
        Insert: {
          id?: string;
          created_at?: string;
          session_id: string;
          parent_name: string;
          parent_phone?: string | null;
          student_name: string;
          student_age?: number | null;
          contact_method: ContactMethod;
          contact_value: string;
          artecks_account_id?: string | null;
          artecks_identifier?: string | null;
          payment_status?: PaymentStatus | null;
          payment_last5?: string | null;
          attended?: boolean;
          rewards_credited?: boolean;
          status?: BookingStatus;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_reports: {
        Row: {
          id: string;
          created_at: string;
          booking_id: string;
          skill_tags: string[] | null;
          coach_notes: string | null;
          generated_summary: string | null;
          xp_awarded: number | null;
          coins_awarded: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          booking_id: string;
          skill_tags?: string[] | null;
          coach_notes?: string | null;
          generated_summary?: string | null;
          xp_awarded?: number | null;
          coins_awarded?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_reports"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "lesson_reports_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      book_session_atomic: {
        Args: {
          p_session_id: string;
          p_parent_name: string;
          p_parent_phone: string;
          p_student_name: string;
          p_student_age: number;
          p_contact_method: ContactMethod;
          p_contact_value: string;
          p_artecks_account_id?: string | null;
          p_payment_last5?: string | null;
          p_artecks_identifier?: string | null;
        };
        Returns: {
          success: boolean;
          booking_id?: string;
          private_access_notes?: string;
          error?: string;
        };
      };
    };
    Enums: Record<string, never>;
  };
}
