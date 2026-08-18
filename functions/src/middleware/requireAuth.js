// src/middleware/requireAuth.js
//
// Every request carries `Authorization: Bearer <firebase-id-token>`. We
// verify it with firebase-admin (which checks the signature, expiry, and
// project match). The user's `role` (customer/staff/admin) lives in
// Firestore, so we look it up and attach it to req.user. If this is the
// very first time we've seen this uid, we auto-create their profile doc.
import { admin, db } from '../firestore.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!idToken) {
    return res.status(401).json({ error: 'Not authenticated', code: 'auth/not-authenticated' });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session', code: 'auth/invalid-session' });
  }

  if (!decoded.email) {
    return res.status(401).json({ error: 'Account has no email address associated', code: 'auth/no-email' });
  }

  const userRef = db.collection('users').doc(decoded.uid);
  let userSnap = await userRef.get();

  if (!userSnap.exists) {
    // First time seeing this uid — check for a pre-seeded row matching this
    // email (e.g. an admin account reserved before they first signed in).
    const byEmail = await db.collection('users').where('email', '==', decoded.email.toLowerCase()).limit(1).get();
    if (!byEmail.empty) {
      const existing = byEmail.docs[0];
      await userRef.set({ ...existing.data(), uid: decoded.uid }, { merge: true });
      if (existing.id !== decoded.uid) await existing.ref.delete();
      userSnap = await userRef.get();
    } else {
      await userRef.set({
        uid: decoded.uid,
        name: decoded.name || decoded.email.split('@')[0],
        email: decoded.email.toLowerCase(),
        phone: decoded.phone_number || null,
        avatar_url: decoded.picture || null,
        role: 'customer',
        email_verified: Boolean(decoded.email_verified),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      userSnap = await userRef.get();
    }
  } else {
    // Sync email_verified status if updated
    if (decoded.email_verified && !userSnap.data()?.email_verified) {
      await userRef.update({ email_verified: true }).catch(() => {});
    }
  }

  const data = userSnap.data() || {};
  req.user = {
    id: decoded.uid,
    name: data.name || decoded.name || decoded.email.split('@')[0],
    email: data.email || decoded.email,
    role: data.role || 'customer',
    email_verified: Boolean(decoded.email_verified),
  };
  next();
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
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!idToken) return next();
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userSnap = await db.collection('users').doc(decoded.uid).get();
    if (userSnap.exists) {
      const data = userSnap.data() || {};
      req.user = {
        id: decoded.uid,
        name: data.name || decoded.name || decoded.email.split('@')[0],
        email: data.email || decoded.email,
        role: data.role || 'customer',
        email_verified: Boolean(decoded.email_verified),
      };
    }
  } catch {
    // Invalid token on optional-auth route — proceed unauthenticated
  }
  next();
}
