import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
const BASE = `${BACKEND}/api/academy`;

/**
 * POST /api/rewards/credit
 * Marks a booking as attended in Django and credits XP + gems
 * to the student's Artecks wallet if they have an account ID.
 *
 * Body: { booking_id: string; xp_awarded?: number; coins_awarded?: number }
 */
export async function POST(req: NextRequest) {
  let body: { booking_id?: string; xp_awarded?: number; coins_awarded?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { booking_id, xp_awarded = 100, coins_awarded = 30 } = body;
  if (!booking_id) {
    return NextResponse.json({ error: "booking_id is required" }, { status: 400 });
  }

  // 1. Mark attendance in Django
  const attendRes = await fetch(`${BASE}/bookings/${booking_id}/attend/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!attendRes.ok) {
    const err = await attendRes.text();
    return NextResponse.json(
      { error: `Attendance failed: ${err}` },
      { status: attendRes.status }
    );
  }

  const attendData = await attendRes.json();
  const accountId: string | null = attendData.artecks_account_id ?? null;

  // 2. Credit wallet rewards if the student has an Artecks account
  let rewardsCredited = false;
  if (accountId) {
    try {
      const walletRes = await fetch(`${BACKEND}/api/wallet/credit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          xp: xp_awarded,
          gems: coins_awarded,
          source: "academy_attendance",
          booking_id,
        }),
        cache: "no-store",
      });
      rewardsCredited = walletRes.ok;
    } catch {
      // Non-fatal — attendance is recorded even if wallet credit fails
    }
  }

  return NextResponse.json({
    success: true,
    attended: true,
    rewards_credited: rewardsCredited,
    artecks_account_id: accountId,
  });
}
