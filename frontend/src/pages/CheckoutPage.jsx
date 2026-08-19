// pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  const startPayment = async (createdOrderId) => {
    try {
      const checkoutRes = await api.payments.checkout(createdOrderId);
      if (checkoutRes.mode === 'paystack') {
        setRedirecting(true);
        window.location.href = checkoutRes.checkout_url;
        return;
      }
      setPaymentId(checkoutRes.payment_id);
    } catch (err) {
      setPayError('Order created, but payment initialization failed: ' + err.message);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      navigate('/services');
      return;
    }

    setLoading(true);
    setPayError('');
    let createdOrderId = null;

    try {
      const res = await api.orders.create(
        items.map((i) => ({ service_id: i.id, quantity: i.quantity })),
        notes,
        address,
        scheduledFor
      );
      createdOrderId = res.order.id;
      setOrderId(res.order.id);
      setOrderTotal(total);
      clear();
    } catch (err) {
      setPayError('Failed to create order: ' + err.message);
      setLoading(false);
      return;
    }

    await startPayment(createdOrderId);
    setLoading(false);
  };

  const handlePayNow = async () => {
    setPaying(true);
    setPayError('');
    try {
      await api.payments.simulateSuccess(paymentId);
      setPaid(true);
    } catch (err) {
      setPayError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (redirecting) {
    return (
      <div className="wrap" style={{ padding: '96px 24px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 24px', width: '48px', height: '48px' }} />
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '36px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Redirecting to Paystack...
        </h1>
        <p style={{ color: 'var(--steel)' }}>Connecting you securely to our payment gateway.</p>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="wrap" style={{ padding: '72px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: paid ? 'var(--green-dim)' : 'var(--rust-light)',
            color: paid ? 'var(--green)' : 'var(--rust)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          {paid ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          )}
        </div>

        <h1
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: '40px',
            fontWeight: 900,
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          {paid ? 'Payment Confirmed!' : 'Order Placed Successfully'}
        </h1>

        <div className="card" style={{ marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--steel)', fontWeight: 600 }}>Order Reference</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--ink)' }}>
              #{orderId.slice(0, 10)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '14px', color: 'var(--steel)' }}>Amount Payable</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
              {formatNaira(orderTotal)}
            </span>
          </div>
        </div>

        {!paid && (
          <div style={{ marginBottom: '28px' }}>
            <p style={{ color: 'var(--steel)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              This environment is running in test payment mode. Click the button below to simulate successful payment confirmation.
            </p>
            {payError && <div className="error" style={{ marginBottom: '16px' }}>{payError}</div>}
            
            <button
              type="button"
              className="btn btn-solid btn-lg"
              onClick={handlePayNow}
              disabled={paying}
              style={{ width: '100%', marginBottom: '12px' }}
            >
              {paying ? 'Processing Payment...' : `Simulate Paystack Payment (${formatNaira(orderTotal)})`}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            Track Order &amp; Message Staff →
          </button>
          <Link to="/services" className="btn btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px' }}>
      <h1
        style={{
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontSize: '42px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          marginBottom: '8px',
        }}
      >
        Checkout &amp; Service Dispatch
      </h1>
      <p style={{ color: 'var(--steel)', marginBottom: '36px' }}>
        Please enter the execution location and dispatch instructions.
      </p>

      {payError && <div className="error" style={{ marginBottom: '24px' }}>{payError}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Form */}
        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: 'var(--ink)' }}>
              1. Location &amp; Destination Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Execution / Delivery Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input"
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                  required
                  style={{ minHeight: '90px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Preferred Execution Date / Time (Optional)
                </label>
                <input
                  type="text"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="input"
                  placeholder="e.g. Today by 3:00 PM, or Tomorrow morning"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: 'var(--ink)' }}>
              2. Special Instructions &amp; Contact
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Special Instructions / Cargo Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  placeholder="e.g. Fragile materials, gate access code, recipient phone number..."
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ fontSize: '13px', color: 'var(--steel)' }}>
                Order will be registered under <strong>{user?.name}</strong> ({user?.email}).
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-solid btn-lg"
            disabled={loading || items.length === 0}
            style={{ width: '100%' }}
          >
            {loading ? <span className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }} /> : null}
            {loading ? 'Creating Order & Starting Payment...' : `Place Order & Pay — ${formatNaira(total)}`}
          </button>
        </form>

        {/* Right Column: Order Review */}
        <div className="card" style={{ position: 'sticky', top: '100px', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: 'var(--ink)' }}>
            Order Review
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '20px' }}>
            {items.map((item) => (
              <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--steel)', marginLeft: '6px' }}>× {item.quantity}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                  {formatNaira((item.price_cents || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Total Payable</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '28px', fontWeight: 900, color: 'var(--ink)' }}>
              {formatNaira(total)}
            </span>
          </div>

          <div style={{ background: 'var(--paper-dim)', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: '13px', color: 'var(--steel)', lineHeight: 1.5 }}>
            🔒 Payments are encrypted and secured via Paystack. You will receive an instant invoice upon payment confirmation.
          </div>
        </div>
      </div>
    </div>
  );
}
