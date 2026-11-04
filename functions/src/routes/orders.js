// src/routes/orders.js
import { supabase, newId, nowIso } from '../db.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const VALID_STATUSES = ['pending', 'awaiting_payment', 'paid', 'in_progress', 'completed', 'cancelled'];

// Promo codes are validated here, on the server — the totals stored on the
// order (and charged at payment) always use these values, never the client's.
const PROMO_CODES = { HALFCON20: 20 };

async function attachPayments(order) {
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false });
  return { ...order, payments: data || [] };
}

export function registerOrderRoutes(app) {
  // POST /api/orders — customer creates an order (cart of service / product line items)
  app.post('/api/orders', requireAuth, async (req, res) => {
    const { items, notes, address, scheduled_for, promo_code } = req.body;
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
        const { data: service } = await supabase
          .from('services')
          .select('*')
          .eq('id', item.service_id)
          .eq('active', true)
          .maybeSingle();
        if (service) {
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

    // Apply promo code (server-validated)
    const subtotalCents = totalCents;
    let discountCents = 0;
    let appliedPromo = null;
    if (promo_code) {
      const normalized = String(promo_code).trim().toUpperCase();
      const percent = PROMO_CODES[normalized];
      if (!percent) {
        return res.status(400).json({ error: 'Invalid promo code' });
      }
      appliedPromo = normalized;
      discountCents = Math.round((subtotalCents * percent) / 100);
    }

    const order = {
      id: newId(),
      user_id: req.user.id,
      status: 'pending',
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      promo_code: appliedPromo,
      total_cents: subtotalCents - discountCents,
      currency: 'NGN',
      notes: notes || null,
      address: address || null,
      scheduled_for: scheduled_for || null,
      items: resolvedItems,
    };
    const { data: created, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    if (error) return res.status(500).json({ error: 'Could not create order' });
    res.status(201).json({ order: { ...created, payments: [] } });
  });

  // GET /api/orders — customer: their own orders. staff/admin: all orders (optionally ?status=)
  // Pagination: ?page= (1-indexed, default 1) & ?limit= (default 20, max 100).
  app.get('/api/orders', requireAuth, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    let query = supabase.from('orders').select('*', { count: 'exact' });
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      if (req.query.status) query = query.eq('status', req.query.status);
    } else {
      query = query.eq('user_id', req.user.id);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return res.status(500).json({ error: 'Could not load orders' });

    const total = count || 0;
    const orders = await Promise.all((data || []).map(attachPayments));
    res.json({ orders, page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) });
  });

  // GET /api/orders/track/:id — PUBLIC guest tracking.
  // Order IDs are unguessable UUIDs; the response deliberately contains
  // only status, dates, and item names — no customer details, address,
  // notes, totals, or payment information.
  app.get('/api/orders/track/:id', async (req, res) => {
    const { data: order } = await supabase
      .from('orders')
      .select('id, status, created_at, updated_at, items')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({
      tracking: {
        id: order.id,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: (order.items || []).map((i) => ({
          service_name: i.service_name,
          quantity: i.quantity,
        })),
      },
    });
  });

  // GET /api/orders/:id
  app.get('/api/orders/:id', requireAuth, async (req, res) => {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ order: await attachPayments(order) });
  });

  // PATCH /api/orders/:id/status — staff only
  app.patch('/api/orders/:id/status', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const { data: existing } = await supabase
      .from('orders').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Order not found' });
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status, updated_at: nowIso() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: 'Could not update order' });
    res.json({ order: await attachPayments(updated) });
  });
}
