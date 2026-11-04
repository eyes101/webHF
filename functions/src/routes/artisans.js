// src/routes/artisans.js
//
// Artisans are the tradespeople Halfcon can dispatch for house-care and
// property work (electricians, plumbers, etc.) — distinct from `services`
// (which are the priced offerings customers order). Public visitors can
// browse who's available and what they do; only staff can add/edit/remove
// entries.
import { supabase, newId } from '../db.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const byTradeThenName = (a, b) =>
  a.trade.localeCompare(b.trade) || a.name.localeCompare(b.name);

export function registerArtisanRoutes(app) {
  // GET /api/artisans — public list (active only), optional ?trade=
  app.get('/api/artisans', async (req, res) => {
    let query = supabase.from('artisans').select('*').eq('active', true);
    if (req.query.trade) query = query.eq('trade', req.query.trade);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'Could not load artisans' });
    res.json({ artisans: (data || []).sort(byTradeThenName) });
  });

  // ---- STAFF / ADMIN MANAGEMENT ----

  // GET /api/admin/artisans — includes inactive
  app.get('/api/admin/artisans', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data, error } = await supabase.from('artisans').select('*');
    if (error) return res.status(500).json({ error: 'Could not load artisans' });
    res.json({ artisans: (data || []).sort(byTradeThenName) });
  });

  // POST /api/admin/artisans — create
  app.post('/api/admin/artisans', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { name, trade, services_offered, phone, bio } = req.body;
    if (!name || !trade || !Array.isArray(services_offered) || services_offered.length === 0) {
      return res.status(400).json({ error: 'name, trade, and a non-empty services_offered array are required' });
    }
    const artisan = {
      id: newId(),
      name, trade, services_offered,
      phone: phone || null, bio: bio || null,
      active: true,
    };
    const { data, error } = await supabase.from('artisans').insert(artisan).select().single();
    if (error) return res.status(500).json({ error: 'Could not create artisan' });
    res.status(201).json({ artisan: data });
  });

  // PUT /api/admin/artisans/:id — update
  app.put('/api/admin/artisans/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data: existing } = await supabase
      .from('artisans').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Artisan not found' });
    const fields = ['name', 'trade', 'services_offered', 'phone', 'bio', 'active'];
    const updates = {};
    for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const { data, error } = await supabase
      .from('artisans').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: 'Could not update artisan' });
    res.json({ artisan: data });
  });

  // DELETE /api/admin/artisans/:id — soft delete (deactivate)
  app.delete('/api/admin/artisans/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data: existing } = await supabase
      .from('artisans').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Artisan not found' });
    const { error } = await supabase
      .from('artisans').update({ active: false }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Could not update artisan' });
    res.json({ ok: true });
  });
}
