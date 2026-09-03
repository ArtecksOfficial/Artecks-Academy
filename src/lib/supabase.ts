// ─── Supabase Client Factory ──────────────────────────────────────────────────
// All callers in this project are server-side (Server Components + Server
// Actions), so we use the service-role key here — it bypasses RLS, which is
// correct because access control lives in the server functions themselves.
// Never import this file from a "use client" component.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

/**
 * Returns a typed Supabase client for server-side use.
 * Call once per request — do not cache across requests.
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
