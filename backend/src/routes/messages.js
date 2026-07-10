// messages.js
import { db } from '../config/db.js';
import { newId } from '../middleware/auth-crypto.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

export function registerMessageRoutes(app) {
  // GET /api/orders/:id/messages
  app.get('/api/orders/:id/messages', requireAuth, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const rows = db.prepare('SELECT * FROM messages WHERE order_id = ? ORDER BY created_at ASC').all(req.params.id);
    res.json({ messages: rows });
  });

  // POST /api/orders/:id/messages  { body }
  app.post('/api/orders/:id/messages', requireAuth, (req, res) => {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Message body is required' });
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const senderRole = (req.user.role === 'staff' || req.user.role === 'admin') ? 'staff' : 'customer';
    const id = newId();
    db.prepare(`INSERT INTO messages (id, order_id, user_id, sender_role, body) VALUES (?, ?, ?, ?, ?)`)
      .run(id, req.params.id, req.user.id, senderRole, body.trim());
    res.status(201).json({ message: db.prepare('SELECT * FROM messages WHERE id = ?').get(id) });
  });

  // GET /api/admin/users — staff: list customers
  app.get('/api/admin/users', requireAuth, requireRole('staff', 'admin'), (req, res) => {
    const rows = db.prepare('SELECT id, name, email, role, phone, auth_provider, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ users: rows });
  });
}
