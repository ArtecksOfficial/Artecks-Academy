// ─── Who runs the Academy, and whether the policy pages are live ──────────────
// The policy pages (/privacy, /terms, /refund) and every link to them stay hidden
// until LEGAL_PUBLISHED is true. Fill in the operator details and the effective
// date, read the three policies in content.ts, then flip the switch.

export const LEGAL_PUBLISHED = false;

export const OPERATOR = {
  brand: "Artecks Academy",
  /** Registered business or personal name that parents contract with. */
  legalName: "",
  /** 統一編號, if the business has one. */
  taxId: "",
  /** Registered or correspondence address. */
  address: "",
  /** Customer-service email parents can write to. */
  email: "",
  /** LINE Official Account ID. */
  line: "@843yqhoa",
  /** Date these policies take effect, e.g. "2026-12-01". */
  effectiveDate: "",
};
