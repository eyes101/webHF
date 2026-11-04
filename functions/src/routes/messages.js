// src/routes/messages.js
import { supabase, newId } from '../db.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

async function getOrder(id) {
  const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  return data;
}

function canAccessOrder(req, order) {
  return !(req.user.role === 'customer' && order.user_id !== req.user.id);
}

export function registerMessageRoutes(app) {
  // GET /api/orders/:id/messages
  app.get('/api/orders/:id/messages', requireAuth, async (req, res) => {
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!canAccessOrder(req, order)) return res.status(403).json({ error: 'Forbidden' });
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', req.params.id)
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: 'Could not load messages' });
    const messages = (data || []).map((m) => ({ ...m, user_id: m.sender_id }));
    res.json({ messages });
  });

  // POST /api/orders/:id/messages  { body }
  app.post('/api/orders/:id/messages', requireAuth, async (req, res) => {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Message body is required' });
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!canAccessOrder(req, order)) return res.status(403).json({ error: 'Forbidden' });
    const senderRole = (req.user.role === 'staff' || req.user.role === 'admin') ? 'staff' : 'customer';
    const message = {
      id: newId(),
      order_id: req.params.id,
      sender_id: req.user.id,
      sender_role: senderRole,
      body: body.trim(),
    };
    const { data, error } = await supabase
      .from('order_messages').insert(message).select().single();
    if (error) return res.status(500).json({ error: 'Could not send message' });
    res.status(201).json({ message: { ...data, user_id: data.sender_id } });
  });

  // GET /api/admin/users — staff & admin: list all users
  app.get('/api/admin/users', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, phone, created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Could not load users' });
    const users = (data || []).map((u) => ({ ...u, role: u.role || 'customer', phone: u.phone || null }));
    res.json({ users });
  });

  // PATCH /api/admin/users/:id/role — admin/staff: update a user's role
  app.patch('/api/admin/users/:id/role', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
    const { role } = req.body;
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be customer, staff, or admin.' });
    }
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const { error } = await supabase.from('profiles').update({ role }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Could not update role' });
    res.json({ message: 'User role updated successfully', role });
  });

  // POST /api/admin/users/invite — pre-authorize a staff/admin email
  app.post('/api/admin/users/invite', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
    const { email, name, role } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
    const targetRole = ['staff', 'admin'].includes(role) ? role : 'staff';
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from('profiles').select('id').eq('email', normalizedEmail).limit(1);
    if (existing && existing.length > 0) {
      await supabase.from('profiles').update({ role: targetRole }).eq('id', existing[0].id);
      return res.json({ message: `Existing user ${normalizedEmail} promoted to ${targetRole}.` });
    }

    const { error } = await supabase.from('role_reservations').upsert({
      email: normalizedEmail,
      name: name?.trim() || normalizedEmail.split('@')[0],
      role: targetRole,
    });
    if (error) return res.status(500).json({ error: 'Could not save invitation' });

    res.status(201).json({ message: `Pre-authorized ${normalizedEmail} as ${targetRole}. When they register/login, they will automatically have full ${targetRole} access.` });
  });
}
