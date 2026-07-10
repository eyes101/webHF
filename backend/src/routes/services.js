// services.js
import { db } from '../config/db.js';
import { newId } from '../middleware/auth-crypto.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/requireAuth.js';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function registerServiceRoutes(app) {
  // GET /api/services  — public catalog (active only), optional ?category=
  app.get('/api/services', optionalAuth, (req, res) => {
    const { category } = req.query;
    let rows;
    if (category) {
      rows = db.prepare('SELECT * FROM services WHERE active = 1 AND category = ? ORDER BY category, name').all(category);
    } else {
      rows = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY category, name').all();
    }
    res.json({ services: rows });
  });

  // GET /api/services/:slug — public single service
  app.get('/api/services/:slug', (req, res) => {
    const row = db.prepare('SELECT * FROM services WHERE slug = ? AND active = 1').get(req.params.slug);
    if (!row) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: row });
  });

  // ---- STAFF / ADMIN MANAGEMENT ----

  // GET /api/admin/services — includes inactive, staff only
  app.get('/api/admin/services', requireAuth, requireRole('staff', 'admin'), (req, res) => {
    const rows = db.prepare('SELECT * FROM services ORDER BY category, name').all();
    res.json({ services: rows });
  });

  // POST /api/admin/services — create
  app.post('/api/admin/services', requireAuth, requireRole('staff', 'admin'), (req, res) => {
    const { category, name, description, price_cents, currency, unit } = req.body;
    if (!category || !name || !description || price_cents == null) {
      return res.status(400).json({ error: 'category, name, description and price_cents are required' });
    }
    const id = newId();
    const slug = slugify(name) + '-' + id.slice(0, 6);
    db.prepare(`INSERT INTO services (id, category, name, slug, description, price_cents, currency, unit)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, category, name, slug, description, price_cents, currency || 'NGN', unit || 'flat');
    res.status(201).json({ service: db.prepare('SELECT * FROM services WHERE id = ?').get(id) });
  });

  // PUT /api/admin/services/:id — update
  app.put('/api/admin/services/:id', requireAuth, requireRole('staff', 'admin'), (req, res) => {
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Service not found' });
    const fields = ['category', 'name', 'description', 'price_cents', 'currency', 'unit', 'active'];
    const updates = [];
    const values = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    db.prepare(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    res.json({ service: db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id) });
  });

  // DELETE /api/admin/services/:id — soft delete (deactivate)
  app.delete('/api/admin/services/:id', requireAuth, requireRole('staff', 'admin'), (req, res) => {
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Service not found' });
    db.prepare('UPDATE services SET active = 0 WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });
}
