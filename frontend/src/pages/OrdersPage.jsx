// pages/OrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

const PAGE_SIZE = 10;

function getStatusBadge(status) {
  switch (status) {
    case 'completed':
      return <span className="badge badge-green">✓ Completed</span>;
    case 'in_progress':
      return <span className="badge badge-blue">⚡ In Progress</span>;
    case 'paid':
      return <span className="badge badge-green">Paid</span>;
    case 'awaiting_payment':
      return <span className="badge badge-amber">Awaiting Payment</span>;
    case 'cancelled':
      return <span className="badge badge-red">Cancelled</span>;
    default:
      return <span className="badge badge-gray">{status || 'Pending'}</span>;
  }
}

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
        setOrders(res.orders || []);
        setTotalPages(res.total_pages || 1);
      })
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', flexWrap: 'wrap', gap: '16px' }}>
        <h1
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: '42px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          My Orders &amp; Dispatches
        </h1>
        <Link to="/services" className="btn btn-sm btn-solid">
          + Book New Service
        </Link>
      </div>
      <p style={{ color: 'var(--steel)', marginBottom: '36px' }}>
        Track your live operations, review past orders, and communicate directly with Halfcon support.
      </p>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--steel)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--paper-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--steel)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Orders Found</h2>
          <p style={{ color: 'var(--steel)', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
            You haven't placed any service or logistics requests yet.
          </p>
          <Link to="/services" className="btn btn-solid">
            Browse Services Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((o) => (
            <div
              key={o.id}
              className="card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                padding: '24px',
              }}
              onClick={() => navigate(`/orders/${o.id}`)}
            >
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '16px', color: 'var(--ink)' }}>
                    #{o.id.slice(0, 10)}
                  </span>
                  {getStatusBadge(o.status)}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--steel)', marginBottom: '4px' }}>
                  {o.items ? `${o.items.length} ${o.items.length === 1 ? 'service item' : 'service items'}` : 'Service order'}
                  {o.address ? ` · ${o.address.slice(0, 45)}${o.address.length > 45 ? '...' : ''}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--steel)', fontWeight: 600 }}>
                    Total Amount
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '18px', color: 'var(--ink)' }}>
                    {formatNaira(o.total_cents)}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ fontWeight: 700, color: 'var(--rust)' }}
                >
                  Track →
                </button>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '28px', justifyContent: 'center' }}>
              <button
                className="btn btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '13px', color: 'var(--steel)', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
