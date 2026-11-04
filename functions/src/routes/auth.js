// src/routes/auth.js
//
// Sign-in itself happens entirely on the frontend via the Supabase Auth SDK —
// there's no register/login/logout route here. The only thing this backend
// needs to do is confirm who's calling (requireAuth already does that,
// including creating the profiles row on first request) and hand back
// their profile.
import { requireAuth } from '../middleware/requireAuth.js';

export function registerAuthRoutes(app) {
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });
}
