// src/middleware/requireAuth.js
//
// Every request carries `Authorization: Bearer <supabase-access-token>`. We
// verify it with Supabase Auth and attach the caller's profile to req.user.
// The user's `role` (customer/staff/admin) lives in the `profiles` table.
// If this is the very first time we've seen this user, we create their
// profile — honouring any pre-seeded role in `role_reservations` (matched
// by email, e.g. an admin account reserved before they first signed in).
import { supabase } from '../db.js';

async function loadOrCreateProfile(authUser) {
  const email = (authUser.email || '').toLowerCase();
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  if (existing) return existing;

  let role = 'customer';
  if (email) {
    const { data: reservation } = await supabase
      .from('role_reservations')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (reservation) role = reservation.role;
  }

  const meta = authUser.user_metadata || {};
  const profile = {
    id: authUser.id,
    name: meta.full_name || meta.name || (email ? email.split('@')[0] : 'Customer'),
    email,
    phone: authUser.phone || meta.phone || null,
    avatar_url: meta.avatar_url || meta.picture || null,
    role,
    email_verified: Boolean(authUser.email_confirmed_at),
  };
  const { data: created, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  if (error) {
    // Lost a race with a parallel first request — re-read the row.
    const { data: reread } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    if (reread) return reread;
    throw error;
  }
  return created;
}

function toReqUser(profile, authUser) {
  return {
    id: authUser.id,
    name: profile.name,
    email: profile.email,
    role: profile.role || 'customer',
    email_verified: Boolean(authUser.email_confirmed_at || profile.email_verified),
  };
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated', code: 'auth/not-authenticated' });
  }

  let authUser;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw error || new Error('no user');
    authUser = data.user;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session', code: 'auth/invalid-session' });
  }

  if (!authUser.email) {
    return res.status(401).json({ error: 'Account has no email address associated', code: 'auth/no-email' });
  }

  try {
    const profile = await loadOrCreateProfile(authUser);
    req.user = toReqUser(profile, authUser);
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Could not load user profile' });
  }
}

export function requireVerifiedEmail(req, res, next) {
  if (!req.user || !req.user.email_verified) {
    return res.status(403).json({
      error: 'Please verify your email address to proceed',
      code: 'auth/unverified-email',
    });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', code: 'auth/forbidden' });
    }
    next();
  };
}

// For public routes that behave slightly differently if caller is logged in
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profile) req.user = toReqUser(profile, data.user);
    }
  } catch {
    // Invalid token on optional-auth route — proceed unauthenticated
  }
  next();
}
