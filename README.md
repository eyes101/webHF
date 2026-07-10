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
├── frontend/    ← React + Vite app (real, runnable project)
└── preview/     ← Single static HTML file — open directly, no install needed
```

---

## ⚡ Quickest way to see it: `preview/index.html`

Open `preview/index.html` directly in any browser (just double-click it, or
drag it into a browser tab). No install, no server. This shows the homepage
design with your real logo and NGN pricing so you can review the visual
direction immediately. It's static — buttons don't actually do anything yet
— the real interactive app is in `frontend/`.

---

## Running the real app (frontend + backend)

**Why this matters:** this project was built inside a sandboxed environment
that could not reach the npm package registry (the proxy blocked it — see
"A note on how the backend was built" below). That means **I could not run
`npm install` or start the dev servers myself to hand you a live preview
link.** Everything has been written and logic-tested via the backend's own
test script, but you'll need to do the first `npm install` yourself on a
machine with normal internet access. It's a standard, well-trodden setup —
should take a few minutes.

### 1. Backend

```bash
cd backend
npm run seed     # creates the database, services catalog, and admin login
npm start        # starts the API on http://localhost:4000
```

No `npm install` is actually required for the backend — it intentionally
uses **zero external dependencies**, only Node.js built-ins. You do need
**Node.js 22.5+** (for the built-in `node:sqlite` module). Check with `node -v`.

This creates a default admin login:
- Email: `admin@halfcon.it.com`
- Password: `ChangeThisPassword123!`

**Change this password immediately** — either log in and add a "change
password" endpoint (not yet built — see Roadmap below), or edit it directly
via the seed script before first run.

### 2. Frontend

```bash
cd frontend
npm install      # standard React/Vite deps — needs real npm access
npm run dev      # starts on http://localhost:5173
```

The frontend dev server proxies `/api/*` requests to the backend on port
4000 automatically (configured in `vite.config.js`), so just run both side
by side and visit `http://localhost:5173`.

### 3. Try the full flow

1. Visit `http://localhost:5173`, click **Register**, create a customer account
2. Browse **Services**, add something to cart, go to **Checkout**, place the order
3. The order is created with status `pending`. There's no "Pay now" button wired
   into the UI yet (see Roadmap) — you can trigger it via the API directly:
   ```bash
   curl -X POST http://localhost:4000/api/orders/<order_id>/checkout -b cookies.txt
   curl -X POST http://localhost:4000/api/payments/<payment_id>/simulate-success -b cookies.txt
   ```
4. Log out, log back in as `admin@halfcon.it.com`, visit `/staff` to see the
   order, change its status, manage the services catalog, and view all
   customers and payments.

---

## A note on how the backend was built (zero dependencies)

The sandbox this project was built in could not reach `registry.npmjs.org`
(network policy blocked it) — not even to install `express`. So instead of
stalling, the entire backend was written using **only Node.js's built-in
modules**:

- **`node:http`** — a small custom router (`src/mini-express.js`) mimics the
  Express API (`app.get`, `app.post`, route params, JSON body parsing,
  cookies) closely enough that the route files read almost identically to
  real Express code.
- **`node:sqlite`** (built into Node 22+) instead of `better-sqlite3`.
- **`node:crypto`** (`scrypt` + `timingSafeEqual`) for password hashing
  instead of `bcrypt`/`bcryptjs`.
- Custom session tokens (random bytes, stored server-side with expiry)
  instead of `jsonwebtoken`.

**This was a deliberate choice to keep the project runnable everywhere**,
including environments with restricted npm access — not a permanent
limitation. If you have normal internet access, you can swap in real
Express, bcrypt, and jsonwebtoken with minimal code changes (the route
files already read like standard Express code). It also means **this
backend runs with zero `npm install` required** — just Node.js itself.

---

## Switching to real Express (optional)

If you want to swap `mini-express.js` for the real `express` package later:

```bash
npm install express cookie-parser
```

Then in `server.js`, replace:
```js
import { createApp } from './mini-express.js';
const app = createApp();
```
with:
```js
import express from 'express';
import cookieParser from 'cookie-parser';
const app = express();
app.use(express.json());
app.use(cookieParser());
```
The route files (`routes/*.js`) need no changes — they only use
`app.get/post/put/patch/delete`, `req.body`, `req.params`, `req.cookies`,
`req.headers`, `res.json`, `res.status`, `res.cookie` — all standard Express
APIs that `mini-express.js` already mirrors.

---

## Google Sign-In ("Continue with Google")

Backend verifies Google's signed ID tokens itself using only Node's
built-in `crypto` (same zero-dependency approach as the rest of the
backend) — no `google-auth-library` package needed.

**Required environment variable on the backend (Railway):**

| Name | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | Your OAuth Client ID from Google Cloud Console, e.g. `xxxxx.apps.googleusercontent.com` |

**Required Google Cloud Console setup** (console.cloud.google.com →
APIs & Services → Credentials → your OAuth client):
- **Authorized JavaScript origins:** `https://www.halfcon.site`
- **Authorized redirect URIs:** not actually used by this flow (Google
  Identity Services returns the token directly to the frontend via
  JavaScript, no redirect) — but Google's console may still want one filled
  in; `https://api.halfcon.site/api/auth/google/callback` is fine as a
  placeholder.

**Frontend:** the Client ID is in `frontend/src/config/contacts.js`
(`GOOGLE_CLIENT_ID` export) — it's safe to be public/visible in the bundled
JS, unlike the backend's secret-free verification approach. Google's
"Sign In" script is loaded via `<script>` tag in `index.html`.

**⚠️ Database migration note:** adding Google sign-in changed the `users`
table — `password_hash`/`password_salt` are now nullable (OAuth accounts
don't have a password), and three new columns were added
(`auth_provider`, `provider_id`, `avatar_url`). The code auto-adds the new
columns to an existing database on startup (see the migration block in
`backend/src/config/db.js`), but **SQLite cannot drop the original
NOT NULL constraint on an existing table without a full rebuild.** Since
this project's Railway database is new and has only test data so far, the
simplest path is: delete `backend/data/halfcon.db` on the Railway volume
(or just trigger a fresh deploy with an empty volume) and re-run
`npm run seed`. Don't do this on a database with real customer orders
without backing it up first.

## Connecting a real payment provider

Right now `PAYMENT_PROVIDER=manual` (the default) runs a **test-mode**
checkout: it creates a payment record and lets you mark it "paid" via
`POST /api/payments/:id/simulate-success` — there's no real money movement.

To go live with **Paystack** or **Flutterwave** (both support NGN natively,
and are the standard choice for Nigerian businesses — more so than Stripe,
which has limited NGN support), open `backend/src/routes/payments.js`. It
already contains a commented-out Stripe integration block as a structural
example; the same shape applies to Paystack/Flutterwave:

1. Sign up for a provider account, get API keys
2. `npm install` their SDK (or call their REST API directly with `fetch`)
3. In `POST /api/orders/:id/checkout`, call their "initialize transaction" API,
   store the returned reference in the `payments` table, return the
   checkout URL to the frontend
4. In `POST /api/webhooks/payment`, verify the provider's signature header
   and call `markPaymentSucceeded()` when payment is confirmed
5. Set `PAYMENT_PROVIDER=paystack` (or `flutterwave`) as an environment variable

**Never trust a client-side "payment successful" redirect alone** — always
confirm via the provider's webhook before marking an order paid. The webhook
is the only server-to-server confirmation that can't be faked by a customer
manipulating their browser.

---

## API reference (backend)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | Health check |
| POST | `/api/auth/register` | none | Create a customer account |
| POST | `/api/auth/login` | none | Log in |
| POST | `/api/auth/logout` | session | Log out |
| GET | `/api/auth/me` | session | Current user |
| GET | `/api/services` | none | Public service catalog (optional `?category=`) |
| GET | `/api/services/:slug` | none | Single service |
| GET | `/api/admin/services` | staff/admin | All services incl. inactive |
| POST | `/api/admin/services` | staff/admin | Create a service |
| PUT | `/api/admin/services/:id` | staff/admin | Update a service |
| DELETE | `/api/admin/services/:id` | staff/admin | Deactivate a service |
| POST | `/api/orders` | session | Create an order from cart items |
| GET | `/api/orders` | session | List orders (own, or all if staff) |
| GET | `/api/orders/:id` | session | Get one order |
| PATCH | `/api/orders/:id/status` | staff/admin | Update order status |
| POST | `/api/orders/:id/checkout` | session | Start payment for an order |
| POST | `/api/payments/:id/simulate-success` | session | Test-mode: mark payment paid |
| POST | `/api/webhooks/payment` | none (provider) | Real provider webhook target |
| GET | `/api/admin/payments` | staff/admin | All payments |
| GET | `/api/orders/:id/messages` | session | Order message thread |
| POST | `/api/orders/:id/messages` | session | Send a message on an order |
| GET | `/api/admin/users` | staff/admin | List all customers |

All prices are stored as integer **kobo** (NGN cents) in `price_cents` /
`total_cents` / `amount_cents` fields, to avoid floating-point rounding
errors — the same pattern used for USD cents in most payment systems. The
frontend's `formatNaira()` helper (`frontend/src/utils/currency.js`)
converts these back to a `₦12,345.00`-style display string.

---

## Database schema

SQLite file at `backend/data/halfcon.db` (auto-created on first run).
Tables: `users`, `services`, `orders`, `order_items`, `payments`,
`messages`, `sessions`. Full schema in `backend/src/config/db.js`.

---

## Design direction

The visual identity uses your real Halfcon logo (navy `#0F1B4C`, amber
`#F2A024`, blue `#2D8FD4`, red-orange `#EF4F2C`) on white, with an
**"Operations Manifest"** as the homepage's signature section — services
are presented as a dispatch/ledger-style table rather than generic cards,
tying the visual language directly to the logistics/duties nature of the
business. Headlines use Big Shoulders Display (condensed, industrial);
body text uses Inter; data/prices use JetBrains Mono.

---

## CI / GitHub Actions secrets

The workflow in `.github/workflows/ci.yml` follows the rule: **no credentials in the repo — ever**. All secrets live under **GitHub repo → Settings → Secrets and variables → Actions → Repository secrets**.

### Required secrets checklist

| Secret name | Where to get it | Why it's needed |
|---|---|---|
| `VITE_API_URL` | Your backend's public URL, e.g. `https://halfcon-production.up.railway.app` | Vite bakes this in at **build time** via `import.meta.env.VITE_API_URL`. Without it, the deployed frontend falls back to relative `/api` paths (fine for local dev, wrong for a hosted frontend talking to a separate backend). |

### Secrets handled elsewhere (not in this workflow)

| Secret | Where it lives | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Railway env vars (backend) | Also hardcoded in `frontend/src/config/contacts.js` — Google OAuth client IDs are public by design and safe to ship in bundled JS. |
| `GITHUB_TOKEN` | Auto-injected by Actions | Never add manually. |
| GitHub Pages deploy token | None needed | The `deploy` job uses OIDC (`id-token: write`) — no long-lived deploy key required. |

### How the workflow uses secrets

```yaml
- name: Build frontend
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
  run: npm run build
```

The secret is passed as an environment variable scoped to a single step. It is never printed, echoed, or stored in an artifact.

### Adding a new secret in future

1. Go to **GitHub repo → Settings → Secrets and variables → Actions → Repository secrets → New repository secret**.
2. Add the value there.
3. Reference it in the workflow as `${{ secrets.YOUR_SECRET_NAME }}` — never paste the value directly into the YAML.
4. Add a row to the table above so the next person knows it's required.

---

## Roadmap / things not yet built

This covers the full request (browse, order, pay, staff manage) end to
end, but a few production essentials are intentionally left as next steps:

- [ ] "Pay now" button in the checkout UI (currently the test-mode payment
      confirmation is only reachable via direct API call — see step 3 above)
- [ ] Password reset / change-password flow
- [ ] Email notifications (order confirmation, status updates)
- [ ] Image uploads for services (currently text-only catalog)
- [ ] Pagination for orders/services lists (fine at current scale, will
      matter once you have hundreds of orders)
- [ ] Real payment provider wiring (Paystack/Flutterwave — see above)
- [ ] Production deployment config (this runs locally; deploying needs a
      host like Railway, Render, or a VPS, plus pointing halfcon.it.com's
      DNS at it)
