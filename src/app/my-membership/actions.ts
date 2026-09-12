"use server";

export interface MembershipLookupResult {
  is_member: boolean;
  provider_name?: string;
  plan_name?: string;
  discount_percent?: number | string;
  current_period_end?: string;
  error?: string;
}

export async function lookupMembershipByPhone(
  phone: string,
  providerSlug: string = "issac"
): Promise<MembershipLookupResult> {
  const BACKEND = process.env.ARTECKS_CORE_API_URL ?? "http://localhost:8000";
  try {
    const params = new URLSearchParams({
      provider_slug: providerSlug,
      phone: phone.trim(),
    });
    const res = await fetch(
      `${BACKEND}/api/academy/memberships/check/?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      if (res.status === 404) return { is_member: false, error: "Provider not found." };
      if (res.status === 400) return { is_member: false };
      return { is_member: false, error: "Server error. Please try again." };
    }
    return res.json();
  } catch {
    return { is_member: false, error: "Connection error. Please try again." };
  }
}
