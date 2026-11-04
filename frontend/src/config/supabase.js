// supabase.js — Supabase client SDK setup for sign-in (Google, Facebook,
// email/password). The backend never sees passwords — it only verifies the
// access token Supabase hands us after a successful sign-in (see
// functions/src/middleware/requireAuth.js).
//
// The URL and anon key are public identifiers (safe to ship to browsers);
// data access is controlled by the API and Row-Level Security, not by
// hiding these values. Set them in the deployment environment:
//   VITE_SUPABASE_URL       e.g. https://<project-ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY  the project's anon/public key
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — sign-in will not work.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key');
