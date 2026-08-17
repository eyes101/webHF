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

  // GET /api/admin/users — staff: list customers
  app.get('/api/admin/users', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const snap = await db.collection('users').orderBy('created_at', 'desc').get();
    const users = snap.docs.map((d) => {
      const { name, email, role, phone, created_at } = d.data();
      return { id: d.id, name, email, role, phone: phone || null, created_at };
    });
    res.json({ users });
  });
}
