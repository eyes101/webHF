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

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.orders.create(
        items.map((i) => ({ service_id: i.id, quantity: i.quantity })),
        notes,
        address
      );
      setOrderId(res.order.id);
      clear();
    } catch (err) {
      alert('Error creating order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="wrap" style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>✓</div>
        <h1 style={{ marginBottom: '20px' }}>Order created!</h1>
        <button className="btn btn-solid" onClick={() => navigate(`/orders/${orderId}`)}>
          View order
        </button>
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
