// src/routes/payments.js
// Same provider-agnostic flow as before — see original backend/src/routes/payments.js
// for the full design rationale. Ported to Firestore; webhook signature
// verification unchanged (Cloud Functions gives us req.rawBody automatically,
// which is exactly what HMAC verification needs).
import { db, admin } from '../firestore.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import crypto from 'node:crypto';

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'manual';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export function registerPaymentRoutes(app) {
  // POST /api/orders/:id/checkout — customer starts payment for their order
  app.post('/api/orders/:id/checkout', requireAuth, async (req, res) => {
    const orderRef = db.collection('orders').doc(req.params.id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.status(404).json({ error: 'Order not found' });
    const order = orderSnap.data();
    if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!['pending', 'awaiting_payment'].includes(order.status)) {
      return res.status(400).json({ error: `Order is already ${order.status}` });
    }

    const paymentRef = db.collection('payments').doc();

    if (PAYMENT_PROVIDER === 'manual') {
      await paymentRef.set({
        order_id: orderRef.id, provider: 'manual', provider_ref: `manual_${paymentRef.id.slice(0, 8)}`,
        amount_cents: order.total_cents, currency: order.currency, status: 'initiated',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      await orderRef.update({ status: 'awaiting_payment', updated_at: admin.firestore.FieldValue.serverTimestamp() });

      return res.json({
        mode: 'manual_test',
        message: 'Test-mode checkout created. Call POST /api/payments/:id/simulate-success to complete it.',
        payment_id: paymentRef.id,
        amount_cents: order.total_cents,
        currency: order.currency,
      });
    }

    if (PAYMENT_PROVIDER === 'paystack') {
      if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: 'PAYMENT_PROVIDER=paystack but PAYSTACK_SECRET_KEY is not set' });
      }
      const reference = `halfcon_${paymentRef.id}`;
      let paystackRes;
      try {
        paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: req.user.email,
            amount: order.total_cents,
            currency: order.currency,
            reference,
            callback_url: `${FRONTEND_URL}/orders/${orderRef.id}?paid=1`,
            metadata: { order_id: orderRef.id, payment_id: paymentRef.id },
          }),
        });
      } catch (err) {
        return res.status(502).json({ error: `Could not reach Paystack: ${err.message}` });
      }

      const paystackData = await paystackRes.json();
      if (!paystackRes.ok || !paystackData.status) {
        return res.status(502).json({ error: `Paystack error: ${paystackData.message || 'unknown error'}` });
      }

      await paymentRef.set({
        order_id: orderRef.id, provider: 'paystack', provider_ref: reference,
        amount_cents: order.total_cents, currency: order.currency, status: 'initiated',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      await orderRef.update({ status: 'awaiting_payment', updated_at: admin.firestore.FieldValue.serverTimestamp() });

      return res.json({
        mode: 'paystack', payment_id: paymentRef.id, checkout_url: paystackData.data.authorization_url,
        amount_cents: order.total_cents, currency: order.currency,
      });
    }

    return res.status(400).json({ error: `Unknown PAYMENT_PROVIDER: ${PAYMENT_PROVIDER}` });
  });

  // POST /api/payments/:id/simulate-success — TEST MODE ONLY
  app.post('/api/payments/:id/simulate-success', requireAuth, async (req, res) => {
    if (PAYMENT_PROVIDER !== 'manual') {
      return res.status(400).json({ error: 'Only available when PAYMENT_PROVIDER=manual (test mode)' });
    }
    const paymentRef = db.collection('payments').doc(req.params.id);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) return res.status(404).json({ error: 'Payment not found' });

    await markPaymentSucceeded(paymentRef.id, paymentSnap.data().order_id);
    const orderSnap = await db.collection('orders').doc(paymentSnap.data().order_id).get();
    res.json({ ok: true, order: { id: orderSnap.id, ...orderSnap.data() } });
  });

  // POST /api/webhooks/payment — real provider webhook target (Paystack)
  // NOT behind requireAuth — Paystack calls this server-to-server. We verify
  // the x-paystack-signature header (HMAC-SHA512 of the raw body) before
  // trusting anything in the payload.
  app.post('/api/webhooks/payment', async (req, res) => {
    if (PAYMENT_PROVIDER !== 'paystack') {
      return res.status(501).json({ error: 'No provider connected (PAYMENT_PROVIDER=manual).' });
    }
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'PAYSTACK_SECRET_KEY is not set' });
    }

    const signature = req.headers['x-paystack-signature'];
    const expectedSignature = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(req.rawBody).digest('hex');
    if (!signature || signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const snap = await db.collection('payments').where('provider_ref', '==', reference).limit(1).get();
      if (!snap.empty && snap.docs[0].data().status !== 'succeeded') {
        await markPaymentSucceeded(snap.docs[0].id, snap.docs[0].data().order_id);
      }
    }
    res.status(200).json({ received: true });
  });

  // GET /api/admin/payments — staff view of all payments
  app.get('/api/admin/payments', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const snap = await db.collection('payments').orderBy('created_at', 'desc').get();
    res.json({ payments: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  });

  async function markPaymentSucceeded(paymentId, orderId) {
    await db.collection('payments').doc(paymentId).update({ status: 'succeeded' });
    await db.collection('orders').doc(orderId).update({ status: 'paid', updated_at: admin.firestore.FieldValue.serverTimestamp() });
  }
}
