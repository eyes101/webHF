// auth.js
import { db } from '../config/db.js';
import { hashPassword, verifyPassword, newId, newSessionToken } from '../middleware/auth-crypto.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { verifyGoogleIdToken } from '../middleware/google-auth.js';

const SESSION_DAYS = 7;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createSessionCookie(res, userId) {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  res.cookie('halfcon_session', token, { httpOnly: true, maxAge: SESSION_DAYS * 86400000, sameSite: 'None', secure: true });
  return token;
}

export function registerAuthRoutes(app) {
  // POST /api/auth/register  { name, email, password, phone? }
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const { hash, salt } = hashPassword(password);
    const id = newId();
    db.prepare(`INSERT INTO users (id, name, email, password_hash, password_salt, auth_provider, role, phone)
                VALUES (?, ?, ?, ?, ?, 'password', 'customer', ?)`)
      .run(id, name, email.toLowerCase(), hash, salt, phone || null);

    const token = createSessionCookie(res, id);
    res.status(201).json({ user: { id, name, email: email.toLowerCase(), role: 'customer' }, token });
  });

  // POST /api/auth/login  { email, password }
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.auth_provider !== 'password' || !user.password_hash) {
      return res.status(401).json({
        error: `This account was created with ${user.auth_provider}. Please use "Continue with ${user.auth_provider}" to log in instead.`,
      });
    }
    if (!verifyPassword(password, user.password_salt, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createSessionCookie(res, user.id);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  });

  // POST /api/auth/google  { id_token }
  // Verifies a Google "Sign in with Google" ID token, then either logs the
  // matching existing user in, or creates a new account from their Google
  // profile (no password — auth_provider='google').
  app.post('/api/auth/google', async (req, res) => {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ error: 'id_token is required' });
    }
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google sign-in is not configured on the server (missing GOOGLE_CLIENT_ID)' });
    }

    let payload;
    try {
      payload = await verifyGoogleIdToken(id_token, GOOGLE_CLIENT_ID);
    } catch (err) {
      return res.status(401).json({ error: `Google sign-in failed: ${err.message}` });
    }

    if (!payload.email || !payload.email_verified) {
      return res.status(401).json({ error: 'Google account email is not verified' });
    }

    const email = payload.email.toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
      // Existing account — if it was originally password-based, we still let
      // them sign in with Google (same email = same person), but we don't
      // overwrite their existing provider on record.
    } else {
      const id = newId();
      db.prepare(`INSERT INTO users (id, name, email, auth_provider, provider_id, avatar_url, role)
                  VALUES (?, ?, ?, 'google', ?, ?, 'customer')`)
        .run(id, payload.name || email.split('@')[0], email, payload.sub, payload.picture || null);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    const token = createSessionCookie(res, user.id);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
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

  // POST /api/auth/change-password  { current_password, new_password }
  // For logged-in users on password-based accounts. Google-auth accounts
  // have no password to change (they sign in via Google), so this route
  // rejects those with a clear message rather than silently no-op'ing.
  app.post('/api/auth/change-password', requireAuth, (req, res) => {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.auth_provider !== 'password' || !user.password_hash) {
      return res.status(400).json({
        error: `This account signs in with ${user.auth_provider} and has no password to change.`,
      });
    }
    if (!verifyPassword(current_password, user.password_salt, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { hash, salt } = hashPassword(new_password);
    db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, user.id);

    // Invalidate every other session for this account so a stolen session
    // token doesn't survive a password change — standard security practice.
    const currentToken = req.cookies.halfcon_session || (req.headers.authorization || '').replace('Bearer ', '');
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(user.id, currentToken);

    res.json({ ok: true, message: 'Password changed successfully' });
  });
}
