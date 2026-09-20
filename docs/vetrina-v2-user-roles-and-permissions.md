# Vetrina V2 — User Roles and Permissions

This document defines the role model for Vetrina V2, covering who can do what across every functional domain. It is the authoritative reference for auth middleware, UI permission gates, and API access control.

---

## Role Definitions

Vetrina V2 supports six roles. Roles are scoped to a Shop — a user always belongs to exactly one shop and has one role within it.

| Role | Who it represents | Access level |
|---|---|---|
| OWNER | The merchant / business owner | Full access, billing, shop config |
| ADMIN | Agency, integrator, or trusted operator | Full access except billing and shop deletion |
| EDITOR | Content/marketing staff | Product authoring and media; no publishing |
| SALES_OPERATOR | In-store or commercial staff | Publishing toggles, placement, orders; no authoring config |
| B2B_MANAGER | Dedicated B2B commercial manager | Full B2B catalog access; limited product visibility |
| APPROVER | Multi-user approval gatekeeper | Review and approve/reject pending publications |

---

## Permission Matrix

### Legend

- **✓** — full access (read + write + delete)
- **R** — read only
- **W** — write (create + edit), no delete
- **—** — no access

### Product Authoring

| Action | OWNER | ADMIN | EDITOR | SALES_OPERATOR | B2B_MANAGER | APPROVER |
|---|---|---|---|---|---|---|
| Create product | ✓ | ✓ | ✓ | — | — | R |
| Edit product fields | ✓ | ✓ | ✓ | — | — | R |
| Upload product media | ✓ | ✓ | ✓ | — | — | R |
| Set product badges / highlights | ✓ | ✓ | ✓ | — | — | R |
| Archive / delete product | ✓ | ✓ | — | — | — | — |
| Duplicate product | ✓ | ✓ | ✓ | — | — | — |
| Assign brand / category | ✓ | ✓ | ✓ | — | — | — |
| View all products | ✓ | ✓ | ✓ | R | R | R |

### Publication and Placement

| Action | OWNER | ADMIN | EDITOR | SALES_OPERATOR | B2B_MANAGER | APPROVER |
|---|---|---|---|---|---|---|
| Publish to storefront | ✓ | ✓ | — | ✓ | — | — |
| Unpublish from storefront | ✓ | ✓ | — | ✓ | — | — |
| Schedule publish / unpublish | ✓ | ✓ | — | ✓ | — | — |
| Manage placement toggles (hero, carousel, grid) | ✓ | ✓ | — | ✓ | — | — |
| Manage audience rules | ✓ | ✓ | — | — | — | — |
| View publication intent status | ✓ | ✓ | R | R | R | R |
| Approve pending publication (APPROVER flow) | ✓ | ✓ | — | — | — | ✓ |
| Reject pending publication | ✓ | ✓ | — | — | — | ✓ |

### Collections

| Action | OWNER | ADMIN | EDITOR | SALES_OPERATOR | B2B_MANAGER | APPROVER |
|---|---|---|---|---|---|---|
| Create / edit collection | ✓ | ✓ | ✓ | W | — | R |
| Add / remove products from collection | ✓ | ✓ | ✓ | ✓ | — | R |
| Reorder products in collection | ✓ | ✓ | ✓ | ✓ | — | R |
| Publish collection | ✓ | ✓ | — | ✓ | — | — |
| Delete collection | ✓ | ✓ | — | — | — | — |

### Site Composer

| Action | OWNER | ADMIN | EDITOR | SALES_OPERATOR | B2B_MANAGER | APPROVER |
|---|---|---|---|---|---|---|
| Create page | ✓ | ✓ | — | — | — | — |
| Edit page (add / remove / reorder sections) | ✓ | ✓ | ✓ | — | — | R |
| Edit section config / bindings | ✓ | ✓ | ✓ | — | — | R |
| Enable / disable section | ✓ | ✓ | ✓ | ✓ | — | R |
| Publish page version | ✓ | ✓ | — | — | — | — |
| Request preview | ✓ | ✓ | ✓ | R | — | R |
| Roll back page version | ✓ | ✓ | — | — | — | — |
| Delete page | ✓ | ✓ | — | — | — | — |

### Media Library

| Action | OWNER | ADMIN | EDITOR | SALES_OPERATOR | B2B_MANAGER | APPROVER |
|---|---|---|---|---|---|---|
| Upload media | ✓ | ✓ | ✓ | — | — | — |
| Edit media metadata (alt text, focal point, tags) | ✓ | ✓ | ✓ | — | — | — |
| Replace asset | ✓ | ✓ | ✓ | — | — | — |
| Delete media | ✓ | ✓ | — | — | — | — |
| Browse media library | ✓ | ✓ | ✓ | R | R | R |

### B2B Catalog

| Action | OWNER | ADMIN | EDITOR | SALES_OPERATOR | B2B_MANAGER | APPROVER |
|---|---|---|---|---|---|---|
| Create B2B catalog | ✓ | ✓ | — | — | ✓ | — |
| Edit catalog (name, description, cover) | ✓ | ✓ | — | — | ✓ | — |
| Add / remove products from catalog | ✓ | ✓ | — | — | ✓ | — |
| Reorder products in catalog | ✓ | ✓ | — | — | ✓ | — |
| Set catalog visibility / audience rule | ✓ | ✓ | — | — | ✓ | — |
| Activate / deactivate catalog | ✓ | ✓ | — | — | ✓ | — |
| Delete catalog | ✓ | ✓ | — | — | — | — |

### Shop Configuration

| Action | OWNER | ADMIN | EDITOR | SALES_OPERATOR | B2B_MANAGER | APPROVER |
|---|---|---|---|---|---|---|
| Edit shop name, description, branding | ✓ | ✓ | — | — | — | — |
| Configure publication targets | ✓ | ✓ | — | — | — | — |
| Manage user accounts and roles | ✓ | — | — | — | — | — |
| View audit / publish history | ✓ | ✓ | R | R | R | R |
| Manage operating mode (BASE / FULL) | ✓ | — | — | — | — | — |
| Delete shop | ✓ | — | — | — | — | — |

---

## Role Hierarchy and Inheritance

Roles do not inherit from each other by default. Each role is explicitly defined. However, the following rule applies:

> **OWNER ⊇ ADMIN ⊇ (EDITOR ∪ SALES_OPERATOR ∪ B2B_MANAGER)**

This means OWNER has all ADMIN capabilities, and ADMIN has all capabilities of the three specialized operator roles combined. APPROVER is orthogonal — it has narrow approval rights that no other role grants except OWNER/ADMIN.

---

## Role Assignment Rules

- Each shop must have exactly one OWNER. The OWNER is the user who created the shop.
- OWNER is assigned automatically at shop creation and cannot be removed.
- OWNER can transfer ownership to another user (this changes their own role to ADMIN).
- A user cannot have multiple roles in the same shop.
- A user belongs to exactly one shop (multi-shop access is a future premium feature).

---

## Approval Workflow (APPROVER Role)

The APPROVER role activates when a shop enables "approval mode" in configuration. When enabled:

1. EDITOR and SALES_OPERATOR submit publications as `PENDING_APPROVAL` instead of immediately publishing.
2. APPROVER (and OWNER/ADMIN) can review pending publications and approve or reject them.
3. Approved publications proceed to `PUBLISHED`. Rejected ones revert to `DRAFT` with a rejection note.
4. OWNER and ADMIN always bypass the approval gate.

When "approval mode" is disabled (default), all roles publish directly without the approval step.

---

## Permission Enforcement

- **API layer:** Every V2 API route checks `session.user.role` against the required permission for the operation. Unauthorized requests return 403.
- **UI layer:** Action buttons, tabs, and form sections are conditionally rendered based on role. UI gates are supplementary — they never replace API enforcement.
- **Audit layer:** All publish, unpublish, and destructive actions are recorded in `PublishEvent` regardless of role.

---

## Future Role Extensions (not in MVP)

- **VIEWER** — read-only access to dashboard (agency client monitoring)
- **MULTI_SHOP** — a user account spanning multiple shops under one agency umbrella
- **API_KEY** — machine identity for external integrations, scoped to specific permission groups
