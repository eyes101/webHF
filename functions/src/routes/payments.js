// src/routes/payments.js
// Provider-agnostic payment flow: `manual` test mode or Paystack.
// Webhook signature verification is unchanged (HMAC-SHA512 of the raw body);
// the server entry points capture req.rawBody for us.
import { supabase, newId, nowIso } from '../db.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import crypto from 'node:crypto';

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'manual';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function getOrder(id) {
  const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  return data;
}

async function markPaymentSucceeded(paymentId, orderId) {
  await supabase.from('payments').update({ status: 'succeeded' }).eq('id', paymentId);
  await supabase.from('orders').update({ status: 'paid', updated_at: nowIso() }).eq('id', orderId);
}

export function registerPaymentRoutes(app) {
  // POST /api/orders/:id/checkout — customer starts payment for their order
  app.post('/api/orders/:id/checkout', requireAuth, async (req, res) => {
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!['pending', 'awaiting_payment'].includes(order.status)) {
      return res.status(400).json({ error: `Order is already ${order.status}` });
    }

    const paymentId = newId();

    if (PAYMENT_PROVIDER === 'manual') {
      const { error } = await supabase.from('payments').insert({
        id: paymentId,
        order_id: order.id, provider: 'manual', provider_ref: `manual_${paymentId.slice(0, 8)}`,
        amount_cents: order.total_cents, currency: order.currency, status: 'initiated',
      });
      if (error) return res.status(500).json({ error: 'Could not create payment' });
      await supabase.from('orders')
        .update({ status: 'awaiting_payment', updated_at: nowIso() })
        .eq('id', order.id);

      return res.json({
        mode: 'manual_test',
        message: 'Test-mode checkout created. Call POST /api/payments/:id/simulate-success to complete it.',
        payment_id: paymentId,
        amount_cents: order.total_cents,
        currency: order.currency,
      });
    }

    if (PAYMENT_PROVIDER === 'paystack') {
      if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: 'PAYMENT_PROVIDER=paystack but PAYSTACK_SECRET_KEY is not set' });
      }
      const reference = `halfcon_${paymentId}`;
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

      const { error } = await supabase.from('payments').insert({
        id: paymentId,
        order_id: order.id, provider: 'paystack', provider_ref: reference,
        amount_cents: order.total_cents, currency: order.currency, status: 'initiated',
      });
      if (error) return res.status(500).json({ error: 'Could not create payment' });
      await supabase.from('orders')
        .update({ status: 'awaiting_payment', updated_at: nowIso() })
        .eq('id', order.id);

      return res.json({
        mode: 'paystack', payment_id: paymentId, checkout_url: paystackData.data.authorization_url,
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
    const { data: payment } = await supabase
      .from('payments').select('*').eq('id', req.params.id).maybeSingle();
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await markPaymentSucceeded(payment.id, payment.order_id);
    const order = await getOrder(payment.order_id);
    res.json({ ok: true, order });
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
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const expectedSignature = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
    if (!signature || signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const { data } = await supabase
        .from('payments').select('*').eq('provider_ref', reference).limit(1);
      const payment = data && data[0];
      if (payment && payment.status !== 'succeeded') {
        await markPaymentSucceeded(payment.id, payment.order_id);
      }
    }
    res.status(200).json({ received: true });
  });

  // GET /api/payments/verify/:reference — verifies a Paystack transaction directly
  app.get('/api/payments/verify/:reference', requireAuth, async (req, res) => {
    const { reference } = req.params;
    if (PAYMENT_PROVIDER !== 'paystack' || !PAYSTACK_SECRET_KEY) {
      return res.status(400).json({ error: 'Paystack is not configured on this server.' });
    }

    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.status) {
        return res.status(400).json({ error: verifyData.message || 'Verification failed' });
      }

      if (verifyData.data.status === 'success') {
        const { data } = await supabase
          .from('payments').select('*').eq('provider_ref', reference).limit(1);
        const payment = data && data[0];
        if (payment) {
          await markPaymentSucceeded(payment.id, payment.order_id);
          const order = await getOrder(payment.order_id);
          return res.json({ ok: true, status: 'succeeded', order });
        }
      }

      res.json({ ok: true, status: verifyData.data.status });
    } catch (err) {
      res.status(502).json({ error: `Verification error: ${err.message}` });
    }
  });

  // GET /api/admin/payments — staff view of all payments
  app.get('/api/admin/payments', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
    const { data, error } = await supabase
      .from('payments').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Could not load payments' });
    res.json({ payments: data || [] });
  });
}
