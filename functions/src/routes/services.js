// src/routes/services.js
import { db, admin } from '../firestore.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function registerServiceRoutes(app) {
  // GET /api/services — public catalog (active only), optional ?category=
  app.get('/api/services', async (req, res) => {
    let query = db.collection('services').where('active', '==', true);
    if (req.query.category) query = query.where('category', '==', req.query.category);
    const snap = await query.get();
    const services = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    res.json({ services });
  });

  // GET /api/services/:slug — public single service
  app.get('/api/services/:slug', async (req, res) => {
    const snap = await db.collection('services').where('slug', '==', req.params.slug).where('active', '==', true).limit(1).get();
    if (snap.empty) return res.status(404).json({ error: 'Service not found' });
    const doc = snap.docs[0];
    res.json({ service: { id: doc.id, ...doc.data() } });
  });

  // ---- STAFF / ADMIN MANAGEMENT ----

  // GET /api/admin/services — includes inactive, staff only
  app.get('/api/admin/services', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const snap = await db.collection('services').get();
    const services = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    res.json({ services });
  });

  // POST /api/admin/services — create
  app.post('/api/admin/services', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { category, name, description, price_cents, currency, unit } = req.body;
    if (!category || !name || !description || price_cents == null) {
      return res.status(400).json({ error: 'category, name, description and price_cents are required' });
    }
    const ref = db.collection('services').doc();
    const slug = `${slugify(name)}-${ref.id.slice(0, 6)}`;
    const service = {
      category, name, slug, description,
      price_cents, currency: currency || 'NGN', unit: unit || 'flat',
      active: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(service);
    res.status(201).json({ service: { id: ref.id, ...service } });
  });

  // PUT /api/admin/services/:id — update
  app.put('/api/admin/services/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const ref = db.collection('services').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'Service not found' });
    const fields = ['category', 'name', 'description', 'price_cents', 'currency', 'unit', 'active'];
    const updates = {};
    for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });
    await ref.update(updates);
    const updated = await ref.get();
    res.json({ service: { id: updated.id, ...updated.data() } });
  });

  // DELETE /api/admin/services/:id — soft delete (deactivate)
  app.delete('/api/admin/services/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const ref = db.collection('services').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'Service not found' });
    await ref.update({ active: false });
    res.json({ ok: true });
  });
}
