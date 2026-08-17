# Halfcon

Full-stack company website — services catalog, orders, payments, staff dashboard.
Currency: NGN.

## Architecture (as of this commit)

- **`frontend/`** — React + Vite. Sign-in via Firebase Auth (Google, Facebook, email/password).
- **`functions/`** — Cloud Functions (Express app). All `/api/*` routes. Uses `firebase-admin` to verify ID tokens and talk to Firestore.
- **Firestore** — `users`, `services`, `artisans`, `orders` (with embedded `items`), `payments`, and `orders/{id}/messages` subcollections.
- **`firebase.json` / `firestore.rules` / `firestore.indexes.json`** — project config. Firestore rules deny all direct client access — only the Cloud Function (Admin SDK) touches the database, so the frontend never talks to Firestore directly.

This replaces an earlier version that ran a custom Node/SQLite backend on Railway with a Vercel-hosted frontend. That setup is retired — everything now runs on Firebase (Hosting + Functions + Firestore + Auth) as a single deployable unit.

## Setup

1. **Firebase project**: already configured for project `tigertrigger-c1e0a` (see `frontend/src/config/firebase.js` and `.firebaserc`). Requires the **Blaze (pay-as-you-go)** plan — Cloud Functions don't run on the free Spark plan.
2. **Enable sign-in providers**: Firebase console → Authentication → Sign-in method → enable Google and Facebook (Facebook needs an App ID/Secret from developers.facebook.com).
3. **Authorized domain**: Authentication → Settings → Authorized domains → add your production domain.
4. **Admin account**: Authentication → Users → Add user → use the exact email you want to have the `admin` role. On that user's first sign-in through the site, `functions/src/middleware/requireAuth.js` matches a pre-seeded Firestore `users` doc by email (if one exists) and attaches the role — see that file for the exact matching logic.
5. **Env vars for Cloud Functions** (`firebase functions:config:set` or `.env` in `functions/`, per current Firebase CLI conventions):
   - `PAYMENT_PROVIDER` — `manual` (test mode, default) or `paystack`
   - `PAYSTACK_SECRET_KEY` — required if using `paystack`
   - `FRONTEND_URL` — used to build Paystack's post-payment redirect
   - `CORS_ORIGIN` — comma-separated allowed origins (defaults to `https://www.halfcon.site,https://halfcon.site`)
6. **Seed sample data** (services + artisans + the admin-role placeholder): the live Firestore starts empty — run `node scripts/seed-firestore.mjs` after your first deploy and after authenticating (`gcloud auth application-default login`). Safe to re-run; it skips anything already there by name.

## Deploy

```bash
npm install -g firebase-tools   # if not already installed
firebase login
firebase deploy                 # deploys hosting + functions + firestore rules/indexes
```

## Local development

```bash
cd frontend && npm install && npm run dev   # http://localhost:5173
cd functions && npm install                  # then use the Firebase emulator suite to run functions locally
```

## API reference

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | Health check |
| GET | `/api/auth/me` | required | Current user's profile |
| GET | `/api/services` | none | Public catalog (optional `?category=`) |
| GET | `/api/services/:slug` | none | Single service |
| GET/POST/PUT/DELETE | `/api/admin/services...` | staff/admin | Catalog management |
| GET | `/api/artisans` | none | Public artisan list (optional `?trade=`) |
| GET/POST/PUT/DELETE | `/api/admin/artisans...` | staff/admin | Artisan management |
| POST | `/api/orders` | required | Create an order from cart items |
| GET | `/api/orders` | required | List orders (own, or all if staff). Supports `?page=`, `?limit=`, `?status=` |
| GET | `/api/orders/:id` | required | Get one order |
| PATCH | `/api/orders/:id/status` | staff/admin | Update order status |
| POST | `/api/orders/:id/checkout` | required | Start payment for an order |
| POST | `/api/payments/:id/simulate-success` | required | Test-mode: mark payment paid |
| POST | `/api/webhooks/payment` | none (provider) | Paystack webhook target |
| GET | `/api/admin/payments` | staff/admin | All payments |
| GET/POST | `/api/orders/:id/messages` | required | Order message thread |
| GET | `/api/admin/users` | staff/admin | List all customers |

All prices are stored as integer **kobo** (NGN cents).
