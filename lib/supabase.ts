// ─── Artecks Academy — Supabase Client ───────────────────────────────────────
// Imports Database from the Supabase-generated types file.
// Server-only clients. Never import from "use client" components.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/database.types";

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Anon-key client — respects RLS. Use for public reads.
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client — bypasses RLS. Use in Server Actions that need
 * to read or write any row (coach cockpit, reward crediting).
 */
export function createAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseAdminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Browser-side singleton for Client Components.
 */
let _browserClient: ReturnType<typeof createClient<Database>> | null = null;
export function createBrowserClient() {
  if (!_browserClient) {
    _browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
}
