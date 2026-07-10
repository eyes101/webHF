// db.js — SQLite connection + schema bootstrap
// Uses Node's built-in node:sqlite (no external dependency required).
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'halfcon.db');
export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// ---------- SCHEMA ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,                    -- NULL for OAuth-only accounts (Google/Facebook/TikTok)
  password_salt TEXT,                    -- NULL for OAuth-only accounts
  auth_provider TEXT NOT NULL DEFAULT 'password', -- 'password' | 'google' | 'facebook' | 'tiktok'
  provider_id   TEXT,                    -- the provider's unique user id (e.g. Google's 'sub'), NULL for password accounts
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'staff' | 'admin'
  phone         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL,          -- Special Duties | Home Development | Office Development | Innovation & Relocation | Logistics Service
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,       -- store money as integer cents to avoid float issues
  currency    TEXT NOT NULL DEFAULT 'NGN',
  unit        TEXT NOT NULL DEFAULT 'flat', -- flat | hourly | per_sqm | per_km etc
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | awaiting_payment | paid | in_progress | completed | cancelled
  total_cents   INTEGER NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'NGN',
  notes         TEXT,
  address       TEXT,
  scheduled_for TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id  TEXT NOT NULL REFERENCES services(id),
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  subtotal_cents   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id),
  provider        TEXT NOT NULL DEFAULT 'manual', -- 'stripe' | 'paystack' | 'flutterwave' | 'manual'
  provider_ref     TEXT,                          -- external transaction/session id
  amount_cents    INTEGER NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  status          TEXT NOT NULL DEFAULT 'initiated', -- initiated | succeeded | failed | refunded
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  order_id    TEXT REFERENCES orders(id),
  user_id     TEXT NOT NULL REFERENCES users(id),
  sender_role TEXT NOT NULL, -- 'customer' | 'staff'
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

// ---------- LIGHTWEIGHT MIGRATION ----------
// If this database was created before the OAuth columns existed (auth_provider,
// provider_id, avatar_url) and before password_hash/password_salt became
// nullable, add what's missing. SQLite's CREATE TABLE IF NOT EXISTS above
// does nothing for an already-existing table, so this covers upgrades from
// an earlier version of the schema without losing existing data.
const userColumns = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
if (!userColumns.includes('auth_provider')) {
  db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'password'");
}
if (!userColumns.includes('provider_id')) {
  db.exec("ALTER TABLE users ADD COLUMN provider_id TEXT");
}
if (!userColumns.includes('avatar_url')) {
  db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT");
}
// Note: SQLite can't easily drop a NOT NULL constraint on existing columns
// without a full table rebuild. Since password_hash/password_salt being
// NOT NULL only matters for brand-new INSERTs (existing password-based rows
// are unaffected), and OAuth signups use a different code path that's aware
// of this, we leave the original constraint in place rather than risk a
// risky in-place migration on a live database.

export default db;
