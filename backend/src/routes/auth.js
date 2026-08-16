// auth.js
//
// All sign-in (Google, Facebook, email/password) now happens on the FRONTEND
// via the Firebase Auth SDK. This backend no longer stores passwords or
// verifies them — it only verifies the Firebase ID token the frontend hands
// it after a successful Firebase sign-in, then issues our own session cookie
// (used for everything else in the app: orders, staff routes, etc. — we
// don't switch the whole app to Firebase tokens, just the identity check).
import { db } from '../config/db.js';
import { newId, newSessionToken } from '../middleware/auth-crypto.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { verifyFirebaseIdToken } from '../middleware/firebase-auth.js';

const SESSION_DAYS = 7;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

function createSessionCookie(res, userId) {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  res.cookie('halfcon_session', token, { httpOnly: true, maxAge: SESSION_DAYS * 86400000, sameSite: 'None', secure: true });
  return token;
}

export function registerAuthRoutes(app) {
  // POST /api/auth/firebase-session  { id_token }
  //
  // Called after ANY successful Firebase sign-in on the frontend — Google,
  // Facebook, or email/password. Verifies the token really came from our
  // Firebase project, then finds or creates the matching local user record.
  //
  // Matching logic: look up by firebase_uid first (returning user), then by
  // email (e.g. they previously had a password-only account with this same
  // email, or signed in via Google before and are now trying Facebook with
  // the same email) — this preserves their existing role (customer/staff/
  // admin) rather than creating a duplicate account. Only if neither matches
  // do we create a brand new customer account.
  app.post('/api/auth/firebase-session', async (req, res) => {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ error: 'id_token is required' });
    }
    if (!FIREBASE_PROJECT_ID) {
      return res.status(500).json({ error: 'Firebase sign-in is not configured on the server (missing FIREBASE_PROJECT_ID)' });
    }

    let payload;
    try {
      payload = await verifyFirebaseIdToken(id_token, FIREBASE_PROJECT_ID);
    } catch (err) {
      return res.status(401).json({ error: `Sign-in verification failed: ${err.message}` });
    }

    if (!payload.email || !payload.email_verified) {
      // Email/password sign-ups go through Firebase's own verification flow;
      // Google/Facebook accounts are pre-verified by those providers. Either
      // way, we require a verified email before trusting it as this app's
      // account identity.
      return res.status(401).json({ error: 'Email is not verified yet. Please verify your email and try again.' });
    }

    const firebaseUid = payload.user_id || payload.sub;
    const email = payload.email.toLowerCase();
    const provider = payload.firebase?.sign_in_provider || 'password';

    let user = db.prepare('SELECT * FROM users WHERE provider_id = ? AND auth_provider = ?').get(firebaseUid, 'firebase');
    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    if (user) {
      // Backfill provider_id if this is the first time we're seeing this
      // Firebase UID for an existing (e.g. pre-migration) account.
      if (user.auth_provider !== 'firebase' || user.provider_id !== firebaseUid) {
        db.prepare("UPDATE users SET auth_provider = 'firebase', provider_id = ? WHERE id = ?").run(firebaseUid, user.id);
      }
    } else {
      const id = newId();
      db.prepare(`INSERT INTO users (id, name, email, auth_provider, provider_id, avatar_url, role)
                  VALUES (?, ?, ?, 'firebase', ?, ?, 'customer')`)
        .run(id, payload.name || email.split('@')[0], email, firebaseUid, payload.picture || null);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    const token = createSessionCookie(res, user.id);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, auth_provider: 'firebase' },
      token,
      sign_in_provider: provider,
    });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', requireAuth, (req, res) => {
    const token = req.cookies.halfcon_session || (req.headers.authorization || '').replace('Bearer ', '');
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    res.clearCookie('halfcon_session');
    res.json({ ok: true });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });
}
