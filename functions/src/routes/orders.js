// src/routes/orders.js
//
// Order items are embedded directly in the order document (an array field)
// rather than a separate collection — Firestore doesn't do SQL-style joins,
// and items are always created and read together with their order, so
// embedding is the natural fit here (unlike payments, which staff need to
// browse independently across all orders — those stay a top-level collection).
import { db, admin } from '../firestore.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const VALID_STATUSES = ['pending', 'awaiting_payment', 'paid', 'in_progress', 'completed', 'cancelled'];

export function registerOrderRoutes(app) {
  // POST /api/orders — customer creates an order (cart of service line items)
  app.post('/api/orders', requireAuth, async (req, res) => {
    const { items, notes, address, scheduled_for } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array of { service_id, quantity }' });
    }

    // Validate services & compute total server-side (never trust client-sent prices)
    let totalCents = 0;
    const resolvedItems = [];
    for (const item of items) {
      const serviceSnap = await db.collection('services').doc(item.service_id).get();
      if (!serviceSnap.exists || !serviceSnap.data().active) {
        return res.status(400).json({ error: `Service ${item.service_id} not found or inactive` });
      }
      const service = serviceSnap.data();
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const subtotal = service.price_cents * quantity;
      totalCents += subtotal;
      resolvedItems.push({
        service_id: item.service_id,
        service_name: service.name,
        service_category: service.category,
        quantity,
        unit_price_cents: service.price_cents,
        subtotal_cents: subtotal,
      });
    }

    const ref = db.collection('orders').doc();
    const order = {
      user_id: req.user.id,
      status: 'pending',
      total_cents: totalCents,
      currency: 'NGN',
      notes: notes || null,
      address: address || null,
      scheduled_for: scheduled_for || null,
      items: resolvedItems,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(order);
    res.status(201).json({ order: { id: ref.id, ...order, payments: [] } });
  });

  // GET /api/orders — customer: their own orders. staff/admin: all orders (optionally ?status=)
  // Pagination: ?page= (1-indexed, default 1) & ?limit= (default 20, max 100).
  app.get('/api/orders', requireAuth, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    let query = db.collection('orders');
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      if (req.query.status) query = query.where('status', '==', req.query.status);
    } else {
      query = query.where('user_id', '==', req.user.id);
    }

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    const pageSnap = await query.orderBy('created_at', 'desc').offset(offset).limit(limit).get();
    const orders = await Promise.all(pageSnap.docs.map((d) => attachPayments(d.id, d.data())));

    res.json({ orders, page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) });
  });

  // GET /api/orders/:id
  app.get('/api/orders/:id', requireAuth, async (req, res) => {
    const snap = await db.collection('orders').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Order not found' });
    const data = snap.data();
    if (req.user.role === 'customer' && data.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ order: await attachPayments(snap.id, data) });
  });

  // PATCH /api/orders/:id/status — staff only
  app.patch('/api/orders/:id/status', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const ref = db.collection('orders').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'Order not found' });
    await ref.update({ status, updated_at: admin.firestore.FieldValue.serverTimestamp() });
    const updated = await ref.get();
    res.json({ order: await attachPayments(updated.id, updated.data()) });
  });

  async function attachPayments(orderId, orderData) {
    const paySnap = await db.collection('payments').where('order_id', '==', orderId).orderBy('created_at', 'desc').get();
    const payments = paySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { id: orderId, ...orderData, payments };
  }
}
