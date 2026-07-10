import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.orders.list()
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1 style={{ marginBottom: '30px' }}>Your orders</h1>
      {orders.length === 0 ? (
        <div>No orders yet</div>
      ) : (
        orders.map((o) => (
          <div
            key={o.id}
            style={{ padding: '16px', border: '1px solid #D8D3C6', marginBottom: '12px', cursor: 'pointer' }}
            onClick={() => navigate(`/orders/${o.id}`)}
          >
            <div style={{ fontWeight: 600 }}>Order #{o.id.slice(0, 8)}</div>
            <div style={{ fontSize: '13px', color: '#5C6B73' }}>Status: {o.status}</div>
            <div>{formatNaira(o.total_cents)}</div>
          </div>
        ))
      )}
    </div>
  );
}
