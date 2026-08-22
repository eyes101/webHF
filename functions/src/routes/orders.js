// src/routes/orders.js
import { db, admin } from '../firestore.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const VALID_STATUSES = ['pending', 'awaiting_payment', 'paid', 'in_progress', 'completed', 'cancelled'];

export function registerOrderRoutes(app) {
  // POST /api/orders — customer creates an order (cart of service / product line items)
  app.post('/api/orders', requireAuth, async (req, res) => {
    const { items, notes, address, scheduled_for } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array of items' });
    }

    // Validate services & products and compute total
    let totalCents = 0;
    const resolvedItems = [];
    for (const item of items) {
      let unitPriceCents = 0;
      let serviceName = item.name || 'Service / Product';
      let serviceCategory = item.category || 'General';

      if (item.service_id) {
        const serviceSnap = await db.collection('services').doc(item.service_id).get();
        if (serviceSnap.exists && serviceSnap.data().active) {
          const service = serviceSnap.data();
          unitPriceCents = service.price_cents;
          serviceName = service.name;
          serviceCategory = service.category;
        } else if (item.price_cents && item.price_cents > 0) {
          // Marketplace product, cost estimator quote, or custom escrow contract
          unitPriceCents = parseInt(item.price_cents, 10);
        } else {
          return res.status(400).json({ error: `Service or product item ${item.service_id} could not be resolved.` });
        }
      } else if (item.price_cents && item.price_cents > 0) {
        unitPriceCents = parseInt(item.price_cents, 10);
      } else {
        return res.status(400).json({ error: 'Invalid order line item.' });
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const subtotal = unitPriceCents * quantity;
      totalCents += subtotal;
      resolvedItems.push({
        service_id: item.service_id || 'custom-item',
        service_name: serviceName,
        service_category: serviceCategory,
        quantity,
        unit_price_cents: unitPriceCents,
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
