// ─── Artecks Academy — Reward Credit API ─────────────────────────────────────
// Dispatches post-session XP / Coin credits to the Artecks central service.
// Called server-side only (ARTECKS_CORE_API_URL is a private env var).

const ARTECKS_CORE_API_URL = process.env.ARTECKS_CORE_API_URL;
const ARTECKS_INTERNAL_TOKEN = process.env.ARTECKS_INTERNAL_TOKEN;

if (!ARTECKS_CORE_API_URL) {
  console.warn(
    "[artecks] ARTECKS_CORE_API_URL not set — reward credits will be no-ops."
  );
}

export interface RewardCreditPayload {
  /** Phone or email identifier on the Artecks platform */
  artecks_account_id: string;
  xp: number;
  coins: number;
  /** Human-readable reason shown in the player's reward history */
  reason: string;
  /** Source booking ID for idempotency */
  source_booking_id: string;
}

export interface RewardCreditResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
}

/**
 * POST /api/v1/rewards/credit
 *
 * Idempotent — the Artecks core service deduplicates on `source_booking_id`.
 * Returns { success: true, transaction_id } on success or { success: false, error } on failure.
 */
export async function creditRewards(
  payload: RewardCreditPayload
): Promise<RewardCreditResult> {
  if (!ARTECKS_CORE_API_URL || !ARTECKS_INTERNAL_TOKEN) {
    console.error("[artecks] Missing API URL or token — skipping reward credit.");
    return { success: false, error: "Artecks API not configured." };
  }

  try {
    const res = await fetch(
      `${ARTECKS_CORE_API_URL}/api/v1/rewards/credit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ARTECKS_INTERNAL_TOKEN}`,
        },
        body: JSON.stringify(payload),
        // Server Actions / Route Handlers run Node.js fetch — no timeout by default.
        // Add AbortSignal for production safety.
        signal: AbortSignal.timeout(8_000),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown");
      console.error(`[artecks] Credit API error ${res.status}: ${text}`);
      return { success: false, error: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as { transaction_id?: string };
    return { success: true, transaction_id: data.transaction_id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[artecks] creditRewards fetch failed:", message);
    return { success: false, error: message };
  }
}
