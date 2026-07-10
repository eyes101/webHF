// payments.js
//
// IMPORTANT — READ ME:
// This module implements the FULL payment *flow* (create payment intent,
// confirm payment, webhook handler, order status sync) using a provider-agnostic
// pattern that matches how Stripe, Paystack, and Flutterwave all work:
//   1. Client asks backend to create a "payment intent" for an order
//   2. Backend calls provider API, gets back a client secret / checkout URL
//   3. Customer pays on the provider's hosted page or embedded widget
//   4. Provider calls our webhook to confirm payment server-side (the ONLY
//      trustworthy confirmation — never trust a client-side "success" redirect alone)
//   5. We mark the order paid and unlock staff fulfillment
//
// Because this project was built in a sandbox with no live provider keys,
// PAYMENT_PROVIDER defaults to 'manual' — a stand-in that lets you fully
// test the order → checkout → paid → staff fulfillment pipeline end-to-end
// without any external account. Swap in real keys and flip PAYMENT_PROVIDER
// to go live — see README "Connecting a real payment provider".
import { db } from '../config/db.js';
import { newId } from '../middleware/auth-crypto.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import crypto from 'node:crypto';

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'manual';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

export function registerPaymentRoutes(app) {
  // POST /api/orders/:id/checkout — customer starts payment for their order
  app.post('/api/orders/:id/checkout', requireAuth, async (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!['pending', 'awaiting_payment'].includes(order.status)) {
      return res.status(400).json({ error: `Order is already ${order.status}` });
    }

    const paymentId = newId();

    if (PAYMENT_PROVIDER === 'manual') {
      // TEST MODE: simulate a provider checkout session synchronously.
      db.prepare(`INSERT INTO payments (id, order_id, provider, provider_ref, amount_cents, currency, status)
                  VALUES (?, ?, 'manual', ?, ?, ?, 'initiated')`)
        .run(paymentId, order.id, `manual_${paymentId.slice(0, 8)}`, order.total_cents, order.currency);
      db.prepare("UPDATE orders SET status = 'awaiting_payment', updated_at = datetime('now') WHERE id = ?")
        .run(order.id);

      return res.json({
        mode: 'manual_test',
        message: 'Test-mode checkout created. Call POST /api/payments/:id/simulate-success to complete it (or wire up a real provider — see README).',
        payment_id: paymentId,
        amount_cents: order.total_cents,
        currency: order.currency,
      });
    }

    if (PAYMENT_PROVIDER === 'paystack') {
      if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: 'PAYMENT_PROVIDER=paystack but PAYSTACK_SECRET_KEY is not set on the server' });
      }
      const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.id);
      const reference = `halfcon_${paymentId}`;

      let paystackRes;
      try {
        paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: order.total_cents, // Paystack also uses the smallest currency unit (kobo for NGN) — matches our storage exactly
            currency: order.currency,
            reference,
            callback_url: `${FRONTEND_URL}/orders/${order.id}?paid=1`,
            metadata: { order_id: order.id, payment_id: paymentId },
          }),
        });
      } catch (err) {
        return res.status(502).json({ error: `Could not reach Paystack: ${err.message}` });
      }

      const paystackData = await paystackRes.json();
      if (!paystackRes.ok || !paystackData.status) {
        return res.status(502).json({ error: `Paystack error: ${paystackData.message || 'unknown error'}` });
      }

      db.prepare(`INSERT INTO payments (id, order_id, provider, provider_ref, amount_cents, currency, status)
                  VALUES (?, ?, 'paystack', ?, ?, ?, 'initiated')`)
        .run(paymentId, order.id, reference, order.total_cents, order.currency);
      db.prepare("UPDATE orders SET status = 'awaiting_payment', updated_at = datetime('now') WHERE id = ?")
        .run(order.id);

      return res.json({
        mode: 'paystack',
        payment_id: paymentId,
        checkout_url: paystackData.data.authorization_url,
        amount_cents: order.total_cents,
        currency: order.currency,
      });
    }

    return res.status(400).json({ error: `Unknown PAYMENT_PROVIDER: ${PAYMENT_PROVIDER}` });
  });

  // POST /api/payments/:id/simulate-success — TEST MODE ONLY, mimics a webhook firing
  app.post('/api/payments/:id/simulate-success', requireAuth, (req, res) => {
    if (PAYMENT_PROVIDER !== 'manual') {
      return res.status(400).json({ error: 'Only available when PAYMENT_PROVIDER=manual (test mode)' });
    }
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    markPaymentSucceeded(payment.id, payment.order_id);
    res.json({ ok: true, order: db.prepare('SELECT * FROM orders WHERE id = ?').get(payment.order_id) });
  });

  // POST /api/webhooks/payment — real provider webhook target (Paystack)
  // Intentionally NOT behind requireAuth — Paystack calls this server-to-server.
  // We verify the x-paystack-signature header (HMAC-SHA512 of the raw request
  // body, keyed with the secret key) before trusting anything in the payload —
  // this is the ONLY server-to-server confirmation that can't be faked by a
  // customer manipulating their browser after a client-side "success" redirect.
  app.post('/api/webhooks/payment', (req, res) => {
    if (PAYMENT_PROVIDER !== 'paystack') {
      return res.status(501).json({
        error: 'Webhook receiver scaffolded but no provider connected (PAYMENT_PROVIDER=manual). ' +
               'Set PAYMENT_PROVIDER=paystack and PAYSTACK_SECRET_KEY to go live.',
      });
    }
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'PAYSTACK_SECRET_KEY is not set on the server' });
    }

    const signature = req.headers['x-paystack-signature'];
    const expectedSignature = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest('hex');

    if (!signature || signature !== expectedSignature) {
      // Do not process — this could be a forged request.
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const payment = db.prepare('SELECT * FROM payments WHERE provider_ref = ?').get(reference);
      if (payment && payment.status !== 'succeeded') {
        markPaymentSucceeded(payment.id, payment.order_id);
      }
    }

    // Paystack expects a 200 response to acknowledge receipt, regardless of
    // event type — returning anything else causes it to keep retrying.
    res.status(200).json({ received: true });
  });

  // GET /api/admin/payments — staff view of all payments
  app.get('/api/admin/payments', requireAuth, requireRole('staff', 'admin'), (req, res) => {
    const rows = db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
    res.json({ payments: rows });
  });
}

function markPaymentSucceeded(paymentId, orderId) {
  db.prepare("UPDATE payments SET status = 'succeeded' WHERE id = ?").run(paymentId);
  db.prepare("UPDATE orders SET status = 'paid', updated_at = datetime('now') WHERE id = ?").run(orderId);
}
