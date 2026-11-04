// src/routes/services.js
import { supabase, newId } from '../db.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const byCategoryThenName = (a, b) =>
  a.category.localeCompare(b.category) || a.name.localeCompare(b.name);

export function registerServiceRoutes(app) {
  // GET /api/services — public catalog (active only), optional ?category=
  app.get('/api/services', async (req, res) => {
    let query = supabase.from('services').select('*').eq('active', true);
    if (req.query.category) query = query.eq('category', req.query.category);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'Could not load services' });
    res.json({ services: (data || []).sort(byCategoryThenName) });
  });

  // GET /api/services/:slug — public single service
  app.get('/api/services/:slug', async (req, res) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('active', true)
      .limit(1);
    if (error) return res.status(500).json({ error: 'Could not load service' });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: data[0] });
  });

  // ---- STAFF / ADMIN MANAGEMENT ----

  // GET /api/admin/services — includes inactive, staff only
  app.get('/api/admin/services', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data, error } = await supabase.from('services').select('*');
    if (error) return res.status(500).json({ error: 'Could not load services' });
    res.json({ services: (data || []).sort(byCategoryThenName) });
  });

  // POST /api/admin/services — create
  app.post('/api/admin/services', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { category, name, description, price_cents, currency, unit } = req.body;
    if (!category || !name || !description || price_cents == null) {
      return res.status(400).json({ error: 'category, name, description and price_cents are required' });
    }
    const id = newId();
    const service = {
      id,
      category, name,
      slug: `${slugify(name)}-${id.slice(0, 6)}`,
      description,
      price_cents, currency: currency || 'NGN', unit: unit || 'flat',
      active: true,
    };
    const { data, error } = await supabase.from('services').insert(service).select().single();
    if (error) return res.status(500).json({ error: 'Could not create service' });
    res.status(201).json({ service: data });
  });

  // PUT /api/admin/services/:id — update
  app.put('/api/admin/services/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data: existing } = await supabase
      .from('services').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Service not found' });
    const fields = ['category', 'name', 'description', 'price_cents', 'currency', 'unit', 'active'];
    const updates = {};
    for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('services').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: 'Could not update service' });
    res.json({ service: data });
  });

  // DELETE /api/admin/services/:id — soft delete (deactivate)
  app.delete('/api/admin/services/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data: existing } = await supabase
      .from('services').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Service not found' });
    const { error } = await supabase
      .from('services').update({ active: false }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Could not update service' });
    res.json({ ok: true });
  });
}
