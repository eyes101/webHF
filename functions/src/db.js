// src/db.js — shared Supabase client (service role) used by every route.
// Replaces the old firestore.js from the Firebase stack (Migration M2).
// The service-role key bypasses Row-Level Security, so this client must
// only ever run server-side. Never expose SUPABASE_SERVICE_ROLE_KEY to
// the frontend.
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Firestore auto-generated 20-char doc ids; Postgres rows here use UUIDs.
export function newId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}
