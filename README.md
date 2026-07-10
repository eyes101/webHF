# Halfcon — Full-Stack Company Website

A complete company website for **Halfcon** (halfcon.it.com), covering five
service lines: Special Duties, Home Development, Office Development,
Innovation & Relocation, and Logistics Service. Customers can browse
services, place orders, and pay online; staff can manage orders, the
service catalog, and customer messages from a dashboard.

Currency: **NGN (Nigerian Naira)**.

```
halfcon/
├── backend/     ← Node.js API (zero external dependencies)
├── frontend/    ← React + Vite app
└── scripts/     ← Replit post-merge hook
```

---

## Status: verified working end-to-end (July 2026)

Unlike the original build, this version has been **actually run and tested**
— backend and frontend both start, and the full flow (register → browse
services → order → checkout → pay → staff fulfillment) was exercised
directly against the running API.

**One environment note if you set this up somewhere other than Replit:**
`frontend/package-lock.json` may contain dependency URLs pointing at
Replit's internal package proxy (`package-firewall.replit.local`), which
only resolves inside Replit. If `npm install` fails with `ENOTFOUND` errors
for that host, delete `package-lock.json` and `node_modules`, then run
`npm install` again — npm will re-resolve everything from the public
registry.

---

## Running it

### 1. Backend

```bash
cd backend
npm run seed     # creates the database, services catalog, and admin login
npm start        # starts the API on http://localhost:3000
```

Requires **Node.js 22.5+** (for the built-in `node:sqlite` module). No
`npm install` needed — the backend uses zero external dependencies, only
Node.js built-ins (see "Zero-dependency backend" below).

Default admin login (change this immediately via Settings once logged in):
- Email: `admin@halfcon.it.com`
- Password: `ChangeThisPassword123!`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5000
```

Vite's dev proxy forwards `/api/*` to the backend on port 3000
(`vite.config.js`), so run both side by side and visit
`http://localhost:5000`.

### 3. Try the full flow

1. Visit the site, click **Register**, create a customer account
2. Browse **Services**, add something to cart, go to **Checkout**, click
   **Place order**
3. Click **Pay now** — this is wired end-to-end in test mode (see
   "Payments" below), no manual API calls needed anymore
4. Log out, log back in as `admin@halfcon.it.com`, visit `/staff` to see
   the order, change its status, manage the service catalog, and view all
   customers and payments (now paginated)

---

## What's implemented

- **Storefront**: browse services by category, service detail pages, cart
- **Accounts**: email/password registration & login, Google Sign-In,
  session cookies
- **Change password**: logged-in users can change their password from
  **Settings** (`/settings`) — requires the current password, invalidates
  all other active sessions on change. This is how you should change the
  default admin password.
- **Orders**: create from cart, view order history (paginated, 10 per
  page), order detail with message thread
- **Payments — "Pay now" button**: checkout now opens a payment session
  automatically and shows a **Pay now** button. In test mode
  (`PAYMENT_PROVIDER=manual`, the default) this simulates a successful
  charge with no real card details. In live mode
  (`PAYMENT_PROVIDER=paystack`) it redirects to Paystack's hosted checkout
  page instead — see "Connecting a real payment provider" below.
- **Staff dashboard** (`/staff`): orders (with status filter + pagination,
  20 per page), service catalog CRUD, payments list, customer list
- **Pagination**: `GET /api/orders` now accepts `?page=` and `?limit=`
  (default 20, max 100) and returns `{ orders, page, limit, total,
  total_pages }`. Both the customer orders page and staff dashboard use
  this.

---

## Zero-dependency backend

The backend is written using **only Node.js's built-in modules** — no
Express, no bcrypt, no jsonwebtoken:

- **`node:http`** — a small custom router (`src/mini-express.js`) mimics
  the Express API (`app.get`, `app.post`, route params, JSON body parsing,
  cookies) closely enough that route files read almost identically to real
  Express code.
- **`node:sqlite`** (built into Node 22+) instead of `better-sqlite3`.
- **`node:crypto`** (`scrypt` + `timingSafeEqual`) for password hashing
  instead of `bcrypt`.
- Custom session tokens (random bytes, stored server-side with expiry)
  instead of `jsonwebtoken`.

This means the backend runs with **zero `npm install` required** — just
Node.js itself. If you want to swap in real Express later, see the comment
block at the top of `src/mini-express.js`; the route files need no changes.

---

## Connecting a real payment provider (Paystack)

`PAYMENT_PROVIDER` defaults to `manual` (test mode — no real money moves,
"Pay now" simulates success instantly). To go live with **Paystack**:

1. Get your secret key from the Paystack dashboard
2. Set these environment variables on your backend host:
   - `PAYMENT_PROVIDER=paystack`
   - `PAYSTACK_SECRET_KEY=sk_live_...` (or `sk_test_...` for Paystack's own
     test mode)
   - `FRONTEND_URL=https://your-frontend-domain.com` (used to build the
     post-payment redirect URL)
3. In Paystack's dashboard, set your webhook URL to
   `https://your-backend-domain.com/api/webhooks/payment`

**How it works once configured:** `POST /api/orders/:id/checkout` calls
Paystack's `/transaction/initialize` REST API directly (via `fetch`, no SDK
needed — consistent with the zero-dependency approach) and returns a
`checkout_url`. The frontend redirects the customer there. Paystack posts
back to `/api/webhooks/payment` when the charge succeeds; the backend
verifies the `x-paystack-signature` header (HMAC-SHA512 of the raw request
body, keyed with your secret key) before marking the order paid.

**This integration has been implemented and code-reviewed but not
exercised against Paystack's live API** — the sandbox this was built in
doesn't have network access to `api.paystack.co`. Test it against
Paystack's test-mode keys (`sk_test_...`) before going live with real
keys, and use their dashboard to manually resend a test webhook event to
confirm signature verification passes.

**Never trust the client-side redirect alone** — the code already follows
this: `checkout` only creates an `awaiting_payment` order, and only the
webhook (with a verified signature) flips it to `paid`.

---

## Google Sign-In ("Continue with Google")

Backend verifies Google's signed ID tokens itself using only Node's
built-in `crypto` — no `google-auth-library` package needed.

**Required environment variable on the backend:**

| Name | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | Your OAuth Client ID from Google Cloud Console |

**Frontend:** the Client ID is in `frontend/src/config/contacts.js`. Google's
"Sign In" script is loaded via `<script>` tag in `index.html`.

---

## API reference (backend)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | Health check |
| POST | `/api/auth/register` | none | Create a customer account |
| POST | `/api/auth/login` | none | Log in |
| POST | `/api/auth/logout` | session | Log out |
| GET | `/api/auth/me` | session | Current user |
| POST | `/api/auth/change-password` | session | Change password (password accounts only) |
| POST | `/api/auth/google` | none | Sign in / register with Google |
| GET | `/api/services` | none | Public service catalog (optional `?category=`) |
| GET | `/api/services/:slug` | none | Single service |
| GET | `/api/admin/services` | staff/admin | All services incl. inactive |
| POST | `/api/admin/services` | staff/admin | Create a service |
| PUT | `/api/admin/services/:id` | staff/admin | Update a service |
| DELETE | `/api/admin/services/:id` | staff/admin | Deactivate a service |
| POST | `/api/orders` | session | Create an order from cart items |
| GET | `/api/orders` | session | List orders (own, or all if staff). Supports `?page=`, `?limit=`, `?status=` |
| GET | `/api/orders/:id` | session | Get one order |
| PATCH | `/api/orders/:id/status` | staff/admin | Update order status |
| POST | `/api/orders/:id/checkout` | session | Start payment for an order |
| POST | `/api/payments/:id/simulate-success` | session | Test-mode: mark payment paid |
| POST | `/api/webhooks/payment` | none (provider) | Real provider webhook target (Paystack) |
| GET | `/api/admin/payments` | staff/admin | All payments |
| GET | `/api/orders/:id/messages` | session | Order message thread |
| POST | `/api/orders/:id/messages` | session | Send a message on an order |
| GET | `/api/admin/users` | staff/admin | List all customers |

All prices are stored as integer **kobo** (NGN cents) to avoid
floating-point rounding errors. The frontend's `formatNaira()` helper
converts these back to a `₦12,345.00`-style display string.

---

## Database schema

SQLite file at `backend/data/halfcon.db` (auto-created on first run).
Tables: `users`, `services`, `orders`, `order_items`, `payments`,
`messages`, `sessions`. Full schema in `backend/src/config/db.js`.

---

## Design direction

The visual identity uses your Halfcon logo (navy `#0F1B4C`, amber
`#F2A024`, blue `#2D8FD4`, red-orange `#EF4F2C`) on white. Headlines use
Big Shoulders Display (condensed, industrial); body text uses Inter;
data/prices use JetBrains Mono.

---

## Remaining roadmap items (not yet built)

- [ ] Email notifications (order confirmation, status updates) — needs an
      email provider (e.g. Resend, SendGrid, or SMTP)
- [ ] Image uploads for services (currently text-only catalog) — needs
      object storage (e.g. S3, Cloudflare R2) since this backend has no
      built-in file upload handling yet
- [ ] Pagination for services/payments/customers lists in the staff
      dashboard (orders is done; the others are lower priority at current
      scale but follow the same pattern if needed)
- [ ] Live Paystack test against real API keys (implemented, but only
      code-reviewed — see "Connecting a real payment provider" above)
- [ ] Production deployment config — this runs on Replit already (see
      `.replit`); if moving elsewhere, needs `halfcon.it.com`'s DNS pointed
      at the new host
