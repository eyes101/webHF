// src/routes/messages.js
import { db, admin } from '../firestore.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

export function registerMessageRoutes(app) {
  // GET /api/orders/:id/messages
  app.get('/api/orders/:id/messages', requireAuth, async (req, res) => {
    const orderSnap = await db.collection('orders').doc(req.params.id).get();
    if (!orderSnap.exists) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'customer' && orderSnap.data().user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const snap = await db.collection('orders').doc(req.params.id).collection('messages').orderBy('created_at', 'asc').get();
    res.json({ messages: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  });

  // POST /api/orders/:id/messages  { body }
  app.post('/api/orders/:id/messages', requireAuth, async (req, res) => {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Message body is required' });
    const orderSnap = await db.collection('orders').doc(req.params.id).get();
    if (!orderSnap.exists) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'customer' && orderSnap.data().user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const senderRole = (req.user.role === 'staff' || req.user.role === 'admin') ? 'staff' : 'customer';
    const ref = db.collection('orders').doc(req.params.id).collection('messages').doc();
    const message = {
      user_id: req.user.id, sender_role: senderRole, body: body.trim(),
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(message);
    res.status(201).json({ message: { id: ref.id, ...message } });
  });

  // GET /api/admin/users — staff & admin: list all users
  app.get('/api/admin/users', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const snap = await db.collection('users').orderBy('created_at', 'desc').get();
    const users = snap.docs.map((d) => {
      const { name, email, role, phone, created_at } = d.data();
      return { id: d.id, name, email, role: role || 'customer', phone: phone || null, created_at };
    });
    res.json({ users });
  });

  // PATCH /api/admin/users/:id/role — admin/staff: update a user's role
  app.patch('/api/admin/users/:id/role', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
    const { role } = req.body;
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be customer, staff, or admin.' });
    }
    const userRef = db.collection('users').doc(req.params.id);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'User not found' });

    await userRef.update({ role, updated_at: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ message: 'User role updated successfully', role });
  });

  // POST /api/admin/users/invite — pre-authorize a staff/admin email
  app.post('/api/admin/users/invite', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
    const { email, name, role } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
    const targetRole = ['staff', 'admin'].includes(role) ? role : 'staff';
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();
    if (!existing.empty) {
      await existing.docs[0].ref.update({ role: targetRole });
      return res.json({ message: `Existing user ${normalizedEmail} promoted to ${targetRole}.` });
    }

    const ref = db.collection('users').doc();
    await ref.set({
      name: name?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: targetRole,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: `Pre-authorized ${normalizedEmail} as ${targetRole}. When they register/login, they will automatically have full ${targetRole} access.` });
  });
}
