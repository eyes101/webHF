import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.orders.list(undefined, page, PAGE_SIZE)
      .then((res) => {
        setOrders(res.orders);
        setTotalPages(res.total_pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1 style={{ marginBottom: '30px' }}>Your orders</h1>
      {orders.length === 0 ? (
        <div>No orders yet</div>
      ) : (
        <>
          {orders.map((o) => (
            <div
              key={o.id}
              style={{ padding: '16px', border: '1px solid #D8D3C6', marginBottom: '12px', cursor: 'pointer' }}
              onClick={() => navigate(`/orders/${o.id}`)}
            >
              <div style={{ fontWeight: 600 }}>Order #{o.id.slice(0, 8)}</div>
              <div style={{ fontSize: '13px', color: '#5C6B73' }}>Status: {o.status}</div>
              <div>{formatNaira(o.total_cents)}</div>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px', justifyContent: 'center' }}>
              <button
                className="btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '14px', color: '#5C6B73' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ opacity: page >= totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
