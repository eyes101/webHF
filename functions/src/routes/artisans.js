// src/routes/artisans.js
//
// Artisans are the tradespeople Halfcon can dispatch for house-care and
// property work (electricians, plumbers, etc.) — distinct from `services`
// (which are the priced offerings customers order). Public visitors can
// browse who's available and what they do; only staff can add/edit/remove
// entries.
import { db, admin } from '../firestore.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

export function registerArtisanRoutes(app) {
  // GET /api/artisans — public list (active only), optional ?trade=
  app.get('/api/artisans', async (req, res) => {
    let query = db.collection('artisans').where('active', '==', true);
    if (req.query.trade) query = query.where('trade', '==', req.query.trade);
    const snap = await query.get();
    const artisans = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.trade.localeCompare(b.trade) || a.name.localeCompare(b.name));
    res.json({ artisans });
  });

  // ---- STAFF / ADMIN MANAGEMENT ----

  // GET /api/admin/artisans — includes inactive
  app.get('/api/admin/artisans', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const snap = await db.collection('artisans').get();
    const artisans = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.trade.localeCompare(b.trade) || a.name.localeCompare(b.name));
    res.json({ artisans });
  });

  // POST /api/admin/artisans — create
  app.post('/api/admin/artisans', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { name, trade, services_offered, phone, bio } = req.body;
    if (!name || !trade || !Array.isArray(services_offered) || services_offered.length === 0) {
      return res.status(400).json({ error: 'name, trade, and a non-empty services_offered array are required' });
    }
    const ref = db.collection('artisans').doc();
    const artisan = {
      name, trade, services_offered,
      phone: phone || null, bio: bio || null,
      active: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(artisan);
    res.status(201).json({ artisan: { id: ref.id, ...artisan } });
  });

  // PUT /api/admin/artisans/:id — update
  app.put('/api/admin/artisans/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const ref = db.collection('artisans').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'Artisan not found' });
    const fields = ['name', 'trade', 'services_offered', 'phone', 'bio', 'active'];
    const updates = {};
    for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });
    await ref.update(updates);
    const updated = await ref.get();
    res.json({ artisan: { id: updated.id, ...updated.data() } });
  });

  // DELETE /api/admin/artisans/:id — soft delete (deactivate)
  app.delete('/api/admin/artisans/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const ref = db.collection('artisans').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'Artisan not found' });
    await ref.update({ active: false });
    res.json({ ok: true });
  });
}
