import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
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
        // Real provider: hand off to Paystack's hosted checkout page.
        // The order stays "awaiting_payment" until Paystack's webhook
        // confirms the charge server-to-server — never trust this redirect
        // alone as proof of payment.
        setRedirecting(true);
        window.location.href = checkoutRes.checkout_url;
        return;
      }
      // Test mode: payment is confirmed inline via the Pay now button below.
      setPaymentId(checkoutRes.payment_id);
    } catch (err) {
      setPayError('Order created, but starting payment failed: ' + err.message);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    let createdOrderId = null;
    try {
      const res = await api.orders.create(
        items.map((i) => ({ service_id: i.id, quantity: i.quantity })),
        notes,
        address
      );
      createdOrderId = res.order.id;
      setOrderId(res.order.id);
      setOrderTotal(total); // capture before clear() zeroes the cart
      clear();
    } catch (err) {
      alert('Error creating order: ' + err.message);
      setLoading(false);
      return;
    }

    // Order exists at this point — a failure below only affects starting
    // the payment session, so it must not be reported as an order error.
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
      setPayError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleRetryStartPayment = async () => {
    setPaying(true);
    setPayError('');
    await startPayment(orderId);
    setPaying(false);
  };

  if (redirecting) {
    return (
      <div className="wrap" style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>↗</div>
        <h1 style={{ marginBottom: '10px' }}>Redirecting to payment...</h1>
        <p style={{ color: '#555' }}>Taking you to our secure payment provider.</p>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="wrap" style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>{paid ? '✓' : '🧾'}</div>
        <h1 style={{ marginBottom: '10px' }}>
          {paid ? 'Payment received!' : 'Order created!'}
        </h1>
        {!paid && (
          <>
            <p style={{ marginBottom: '30px', color: '#555' }}>
              Total due: <strong>{formatNaira(orderTotal)}</strong>
              <br />
              This is running in test-mode payments — clicking "Pay now" simulates
              a successful payment (no real card details needed).
            </p>
            {payError && (
              <p style={{ color: '#c0392b', marginBottom: '16px' }}>{payError}</p>
            )}
            {paymentId ? (
              <button
                className="btn btn-solid"
                onClick={handlePayNow}
                disabled={paying}
                style={{ opacity: paying ? 0.5 : 1, marginRight: '12px' }}
              >
                {paying ? 'Processing payment...' : `Pay now — ${formatNaira(orderTotal)}`}
              </button>
            ) : (
              <button
                className="btn btn-solid"
                onClick={handleRetryStartPayment}
                disabled={paying}
                style={{ opacity: paying ? 0.5 : 1, marginRight: '12px' }}
              >
                {paying ? 'Starting payment...' : 'Retry: start payment'}
              </button>
            )}
          </>
        )}
        <div style={{ marginTop: paid ? 0 : '20px' }}>
          <button className="btn btn-solid" onClick={() => navigate(`/orders/${orderId}`)}>
            View order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '30px' }}>Checkout</h1>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input"
          placeholder="Job address"
          style={{ minHeight: '80px' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
          placeholder="Special instructions"
          style={{ minHeight: '80px' }}
        />
      </div>
      <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '30px' }}>
        Total: {formatNaira(total)}
      </div>
      <button
        className="btn btn-solid"
        onClick={handleCheckout}
        disabled={loading}
        style={{ opacity: loading ? 0.5 : 1 }}
      >
        {loading ? 'Creating order...' : 'Place order'}
      </button>
    </div>
  );
}
