// src/routes/auth.js
//
// Sign-in itself happens entirely on the frontend via the Firebase Auth SDK
// now — there's no register/login/logout route here anymore. The only thing
// this backend needs to do is confirm who's calling (requireAuth already
// does that, including creating the Firestore profile doc on first request)
// and hand back their profile.
import { requireAuth } from '../middleware/requireAuth.js';

export function registerAuthRoutes(app) {
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });
}
