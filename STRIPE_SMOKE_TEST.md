# Next.js Frontend — Stripe Test Mode Smoke-Test Checklist

Use this checklist when verifying the full booking + membership payment round-trip
in **Stripe Test Mode** against the live Railway staging environment.

---

## Prerequisites

1. Stripe Dashboard → toggle **Test Mode** ON
2. `STRIPE_SECRET_KEY` in Railway = `sk_test_…`
3. `NEXT_PUBLIC_BASE_URL` in Railway Academy = `https://academy.artecks.com`
4. Stripe webhook endpoint registered at `https://artecks-production.up.railway.app/api/academy/stripe/webhook/`
   with events: `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_succeeded`, `invoice.payment_failed`
5. At least one Provider + Plan seeded with a **test Stripe Price ID** (`price_test_…`)

---

## A — One-Time Booking Payment (Existing Flow)

| # | Step | Expected |
|---|------|----------|
| A1 | Open `academy.artecks.com` | Marketplace loads; session calendar is visible |
| A2 | Select a date, pick a slot, fill in booking form with **no** Artecks Account ID | "Confirm Booking" submits; success screen shows |
| A3 | Note displayed price — it should equal the session's `price_twd` with **no** crossed-out original | No discount shown for non-member |
| A4 | Click **Pay Now** | Redirects to Stripe Checkout (test mode banner visible) |
| A5 | Use test card `4242 4242 4242 4242`, any future expiry, any CVC | Stripe accepts payment |
| A6 | Stripe redirects to `/payment/result?booking_id=<id>&success=true` | Green "Payment Confirmed!" card shown |
| A7 | Click **View My Booking Details** | Report page loads with correct booking ID |

---

## B — Member Booking Discount Flow

| # | Step | Expected |
|---|------|----------|
| B1 | Manually create a `ProviderSubscription` in Django admin with `status=active`, `current_period_end` 30 days out, and `customer_phone=0912345678` | Row visible in admin |
| B2 | Book a session; enter phone `0912 345 678` (with spaces) in the parent phone field and the matching Account ID `ACT-TEST` | Membership badge ("✓ Artecks Member") appears in the info panel |
| B3 | Confirm the session type chip shows **crossed-out standard price** and the member price | `NT$1200` with `NT$1500` struck through (for 20% plan) |
| B4 | Submit booking | Success screen shows green "Member discount applied — NT$300 off" banner |
| B5 | Click **Pay Now** → Stripe Checkout | Stripe line item amount = `finalPrice` (e.g. NT$1,200), **not** the base price |
| B6 | Complete with test card | `/payment/result?booking_id=<id>&success=true` loads |

---

## C — Subscription Checkout & Confirmation Flow

| # | Step | Expected |
|---|------|----------|
| C1 | (Future: from MemberBanner "Subscribe" button) POST `/api/subscribe` with `plan_id`, `success_url=/payment/result?subscription=true`, `cancel_url=/` | Django returns `checkout_url` pointing to Stripe Checkout |
| C2 | Follow `checkout_url` | Stripe Checkout shows the recurring plan price |
| C3 | Complete with test card | Stripe fires `checkout.session.completed` + `customer.subscription.created` webhooks |
| C4 | Django webhook handler creates `ProviderSubscription` row with `status=active` | Verify in Django admin |
| C5 | Stripe redirects to `/payment/result?subscription=true&session_id=cs_test_…` | **Crown card** shown: "You're a Member!" with green "Membership Active" banner |
| C6 | Click **Book a Session** | Returns to marketplace |
| C7 | Book same session again with same phone/account | Member discount now applied automatically — no manual subscription creation needed |

---

## D — Cancellation & Grace Period

| # | Step | Expected |
|---|------|----------|
| D1 | In Stripe Dashboard, cancel the test subscription (cancel at period end) | Subscription status stays `active` in Stripe; our DB not yet updated |
| D2 | Book a session with the same phone before period end | Discount still applied (grace period active) |
| D3 | Simulate `customer.subscription.deleted` webhook via Stripe CLI: `stripe trigger customer.subscription.deleted` | Django sets `status=cancelled` in DB |
| D4 | Book same session again | **No discount** — full price shown |

---

## E — Webhook Idempotency (Manual)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to https://artecks-production.up.railway.app/api/academy/stripe/webhook/

# In a second terminal — trigger the same event twice
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.updated

# Expected: Django logs show two webhook receipts, DB has exactly ONE ProviderSubscription row
```

---

## F — Membership State Refresh After Subscription

After completing a subscription checkout (step C5), the parent returns to the
marketplace. Because `checkMembership` is called on each booking form load
(debounced on account ID / phone input), the **very next booking attempt**
immediately reflects the active membership without any page reload.

To verify:
1. Complete subscription flow (C1–C6)
2. Without reloading the page, select a new session slot
3. Enter the same phone/account ID in the booking form
4. Observe: membership badge appears and prices update to member rates ✓

---

## Stripe Test Cards Reference

| Scenario | Card Number |
|----------|-------------|
| Successful payment | `4242 4242 4242 4242` |
| Requires 3D Secure | `4000 0025 0000 3155` |
| Payment declined | `4000 0000 0000 9995` |
| Insufficient funds | `4000 0000 0000 9995` |

All test cards: expiry = any future date, CVC = any 3 digits, ZIP = any 5 digits.
