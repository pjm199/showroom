# Orders & notifications — strategy

**Goal:** Be clear about how orders work today and what happens (or doesn’t) when the merchant changes status, especially **Cancel**. Plan the right strategy before adding notifications.

---

## 1. Order flow (current, correct)

| Step | Who | Action | Status |
|------|-----|--------|--------|
| 1 | Customer | Places reservation on storefront | **PENDING** |
| 2 | Merchant | Sees order in Dashboard → Orders | PENDING |
| 3 | Merchant | Clicks **Accept** if the order is OK and items are available | **ACCEPTED** |
| 4 | Merchant | Clicks **Complete** when packed / ready for pickup | **COMPLETED** |
| — | Merchant | Or clicks **Cancel** if the order cannot be fulfilled | **CANCELLED** |

So: **Pending = just received → Accept = confirmed available → Complete = packed/ready.** Cancel = order is cancelled.

---

## 2. What happens today when you Cancel (or Accept / Complete)

**Today the client does not receive any automatic notification.**

- When you **Accept**, **Complete**, or **Cancel**, only the status in the database changes.
- There is no email, no SMS, no in-app message to the customer.
- The customer only saw “Reservation received” right after submitting; they have no way to know about status changes unless you tell them (e.g. by phone or WhatsApp using the number they gave).

So: **if you cancel an order, the customer is not notified by the app.** You should contact them yourself (phone/WhatsApp) so they don’t show up for pickup.

---

## 3. Strategy

### Now (1.0, no change)

- **No automatic notifications.** Rely on the merchant to inform the customer when:
  - Order is accepted / ready for pickup, or
  - Order is cancelled (important so the customer doesn’t come).
- Optional: add a short note in the Dashboard Orders UI, e.g. “When you cancel, contact the customer (e.g. by phone) to inform them.”

### Later (2.0 or next phase)

- **Optional notifications** when status changes:
  - **Accepted** → e.g. “Your order has been accepted by [Shop]. Pickup: [time].”
  - **Completed** → e.g. “Your order is ready for pickup.”
  - **Cancelled** → e.g. “Your order at [Shop] has been cancelled. Please contact the shop if you have questions.”
- **Channels:** We store **customer phone** (no email yet). Options:
  - **SMS** (e.g. Twilio) — fits the current data and mobile-first use case.
  - **Email** — would require adding an optional email field at checkout and an email provider (e.g. Resend).
  - **Both** — best for reach, more setup and cost.
- **Who triggers:** Notifications would be sent from the backend when the merchant (or an API) sets status to ACCEPTED, COMPLETED, or CANCELLED.

---

## 4. Summary

| Question | Answer |
|----------|--------|
| Flow: Pending → Accept → Complete? | Yes. Accept = “we have it”, Complete = “packed / ready”. |
| If I cancel, does the client get a notification? | **No.** Not today. You should inform them yourself. |
| Should we add notifications? | Recommended for 2.0: at least **Cancel** (and optionally Accept/Complete) via SMS or email. |
| What do we need to add later? | A notification step when status changes (e.g. in PATCH `/api/shops/me/orders/[id]`) + SMS and/or email provider. |

No code changes are required for 1.0; this doc is the strategy reference. When you want to implement notifications, we can add a small “Notify customer?” note in the Orders UI and then the actual SMS/email integration.
