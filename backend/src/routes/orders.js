// orders.js
import { db } from '../config/db.js';
import { newId } from '../middleware/auth-crypto.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const VALID_STATUSES = ['pending', 'awaiting_payment', 'paid', 'in_progress', 'completed', 'cancelled'];

export function registerOrderRoutes(app) {
  // POST /api/orders — customer creates an order (cart of service line items)
  // body: { items: [{ service_id, quantity }], notes?, address?, scheduled_for? }
  app.post('/api/orders', requireAuth, (req, res) => {
    const { items, notes, address, scheduled_for } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array of { service_id, quantity }' });
    }

    // Validate services & compute total server-side (never trust client-sent prices)
    let totalCents = 0;
    const resolvedItems = [];
    for (const item of items) {
      const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(item.service_id);
      if (!service) {
        return res.status(400).json({ error: `Service ${item.service_id} not found or inactive` });
      }
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const subtotal = service.price_cents * quantity;
      totalCents += subtotal;
      resolvedItems.push({ service, quantity, subtotal });
    }

    const orderId = newId();
    db.prepare(`INSERT INTO orders (id, user_id, status, total_cents, currency, notes, address, scheduled_for)
                VALUES (?, ?, 'pending', ?, 'NGN', ?, ?, ?)`)
      .run(orderId, req.user.id, totalCents, notes || null, address || null, scheduled_for || null);

    for (const ri of resolvedItems) {
      db.prepare(`INSERT INTO order_items (id, order_id, service_id, quantity, unit_price_cents, subtotal_cents)
                  VALUES (?, ?, ?, ?, ?, ?)`)
        .run(newId(), orderId, ri.service.id, ri.quantity, ri.service.price_cents, ri.subtotal);
    }

    const order = getFullOrder(orderId);
    res.status(201).json({ order });
  });

  // GET /api/orders — customer: their own orders. staff/admin: all orders (optionally ?status=)
  // Pagination: ?page= (1-indexed, default 1) & ?limit= (default 20, max 100).
  // Response includes { orders, page, limit, total, total_pages } — total_pages
  // lets the frontend know when to stop showing "next page".
  app.get('/api/orders', requireAuth, (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    let countRow, rows;
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      if (req.query.status) {
        countRow = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get(req.query.status);
        rows = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
          .all(req.query.status, limit, offset);
      } else {
        countRow = db.prepare('SELECT COUNT(*) as count FROM orders').get();
        rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
      }
    } else {
      countRow = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(req.user.id);
      rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
        .all(req.user.id, limit, offset);
    }

    const total = countRow.count;
    res.json({
      orders: rows.map(o => getFullOrder(o.id)),
      page,
      limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    });
  });

  // GET /api/orders/:id
  app.get('/api/orders/:id', requireAuth, (req, res) => {
    const order = getFullOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ order });
  });

  // PATCH /api/orders/:id/status — staff only
  app.patch('/api/orders/:id/status', requireAuth, requireRole('staff', 'admin'), (req, res) => {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Order not found' });
    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
    res.json({ order: getFullOrder(req.params.id) });
  });

  function getFullOrder(orderId) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) return null;
    const items = db.prepare(`SELECT oi.*, s.name as service_name, s.category as service_category
                               FROM order_items oi JOIN services s ON s.id = oi.service_id
                               WHERE oi.order_id = ?`).all(orderId);
    const payments = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC').all(orderId);
    return { ...order, items, payments };
  }
}
