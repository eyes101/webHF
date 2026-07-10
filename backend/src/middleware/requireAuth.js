// requireAuth.js
import { db } from '../config/db.js';

export function getSession(token) {
  if (!token) return null;
  const row = db.prepare(`SELECT s.*, u.id as user_id, u.name, u.email, u.role, u.auth_provider
                           FROM sessions s JOIN users u ON u.id = s.user_id
                           WHERE s.token = ? AND s.expires_at > datetime('now')`).get(token);
  return row || null;
}

export function requireAuth(req, res, next) {
  const token = req.cookies.halfcon_session || (req.headers.authorization || '').replace('Bearer ', '');
  const session = getSession(token);
  if (!session) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  req.user = {
    id: session.user_id,
    name: session.name,
    email: session.email,
    role: session.role,
    auth_provider: session.auth_provider,
  };
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden — insufficient permissions' });
      return;
    }
    next();
  };
}

// Optional auth: attaches req.user if a valid session exists, but does not block the request
export function optionalAuth(req, res, next) {
  const token = req.cookies.halfcon_session || (req.headers.authorization || '').replace('Bearer ', '');
  const session = getSession(token);
  if (session) {
    req.user = {
      id: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role,
      auth_provider: session.auth_provider,
    };
  }
  next();
}
