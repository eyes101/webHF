// src/middleware/requireAuth.js
//
// Every request carries `Authorization: Bearer <firebase-id-token>`. We
// verify it with firebase-admin (which checks the signature, expiry, and
// project match for us — no manual JWT work needed here, unlike the earlier
// zero-dependency backend). The person's `role` (customer/staff/admin) isn't
// in the Firebase token — it lives in Firestore, so we look it up and attach
// it to req.user. If this is the very first time we've seen this uid, we
// create their profile doc here (find-or-create by email, so an admin row
// pre-seeded by email keeps its role).
import { admin, db } from '../firestore.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!idToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  if (!decoded.email || !decoded.email_verified) {
    return res.status(401).json({ error: 'Email is not verified yet' });
  }

  const userRef = db.collection('users').doc(decoded.uid);
  let userSnap = await userRef.get();

  if (!userSnap.exists) {
    // First time seeing this uid — check for a pre-seeded row matching this
    // email (e.g. the admin account reserved before they ever signed in).
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
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      userSnap = await userRef.get();
    }
  }

  const data = userSnap.data();
  req.user = { id: decoded.uid, name: data.name, email: data.email, role: data.role };
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// For public routes that behave slightly differently if the caller happens
// to be logged in (none currently need this, kept for parity/future use).
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!idToken) return next();
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userSnap = await db.collection('users').doc(decoded.uid).get();
    if (userSnap.exists) {
      const data = userSnap.data();
      req.user = { id: decoded.uid, name: data.name, email: data.email, role: data.role };
    }
  } catch {
    // Invalid token on an optional-auth route — just proceed unauthenticated.
  }
  next();
}
