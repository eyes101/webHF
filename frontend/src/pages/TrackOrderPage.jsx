// pages/TrackOrderPage.jsx — Guest Order Tracking with progress timeline
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACTS, whatsappLink } from '../config/contacts';
import { api } from '../api/client';
import './TrackOrderPage.css';

const STAGES = [
  { key: 'placed', label: 'Order Placed', desc: 'We have received your order' },
  { key: 'payment', label: 'Payment Confirmed', desc: 'Your payment has been received' },
  { key: 'progress', label: 'In Progress', desc: 'Our team is working on your order' },
  { key: 'done', label: 'Completed', desc: 'Your order is complete' },
];

// Map the order's real status to a timeline stage
function stageForStatus(status) {
  switch (status) {
    case 'pending':
    case 'awaiting_payment':
      return 0;
    case 'paid':
      return 1;
    case 'in_progress':
      return 2;
    case 'completed':
      return 3;
    default:
      return 0;
  }
}

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.orders.track(id);
      setResult(res.tracking);
    } catch (err) {
      setError(err.message || 'We could not find that order. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const stage = result ? stageForStatus(result.status) : 0;
  const cancelled = result && result.status === 'cancelled';

  return (
    <div className="track-page">
      <div className="track-hero">
        <div className="wrap">
          <div className="shop-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Track Order</strong>
          </div>
          <h1 className="track-title">Track Your Order</h1>
          <p className="track-subtitle">Enter your Order ID to see where your order has reached — no account or sign-in needed.</p>
        </div>
      </div>

      <div className="wrap track-container">
        <div className="track-card">
          <h2 className="track-card-title">Enter Your Order ID</h2>
          <p className="track-card-desc">Your Order ID is shown on your checkout confirmation and in your Orders page (for example <code>ord_178829…</code>). Paste it exactly as given.</p>

          <form onSubmit={handleTrack} className="track-form">
            <div className="track-input-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                required
                placeholder="Enter Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="track-input"
                aria-label="Order ID"
              />
            </div>
            <button type="submit" className="btn-track-submit" disabled={loading}>
              {loading ? 'Checking…' : 'Track Order Status →'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '20px', background: '#FDF0EC', border: '1px solid #F3C4B3', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', lineHeight: 1.55 }}>
              <strong>We couldn't find that order.</strong>
              <div style={{ color: 'var(--steel)', margin: '4px 0 10px' }}>{error}</div>
              <a
                href={whatsappLink(`Hi Halfcon, I need help tracking my order. The ID I have is: ${orderId.trim()}`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 700, color: 'var(--green)' }}
              >
                💬 Ask us on WhatsApp — we'll look it up for you
              </a>
            </div>
          )}

          {result && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <strong style={{ fontSize: '15px' }}>Order {result.id}</strong>
                {result.created_at && (
                  <span style={{ fontSize: '12px', color: 'var(--steel)' }}>Placed: {formatWhen(result.created_at)}</span>
                )}
              </div>

              {result.items && result.items.length > 0 && (
                <ul style={{ fontSize: '13px', color: 'var(--steel)', margin: '0 0 18px', paddingLeft: '18px', lineHeight: 1.6 }}>
                  {result.items.map((item, i) => (
                    <li key={i}>{item.service_name} × {item.quantity}</li>
                  ))}
                </ul>
              )}

              {cancelled ? (
                <div style={{ background: '#FDF0EC', border: '1px solid #F3C4B3', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', lineHeight: 1.55 }}>
                  <strong>This order was cancelled.</strong>
                  <div style={{ color: 'var(--steel)', marginTop: '4px' }}>
                    If you didn't cancel it, or you're expecting a refund, please contact us on WhatsApp ({CONTACTS.whatsappDisplay}) and quote your Order ID.
                  </div>
                </div>
              ) : (
                <>
                  {/* Progress timeline */}
                  <div style={{ display: 'flex', gap: '0', margin: '10px 0 6px' }}>
                    {STAGES.map((s, idx) => {
                      const done = idx < stage || result.status === 'completed';
                      const current = idx === stage && result.status !== 'completed';
                      return (
                        <div key={s.key} style={{ flex: 1, textAlign: 'center', position: 'relative', padding: '0 4px' }}>
                          {idx > 0 && (
                            <div style={{ position: 'absolute', top: '17px', right: '50%', width: '100%', height: '3px', background: done || current ? 'var(--green)' : 'var(--line)', zIndex: 0 }} />
                          )}
                          <div
                            style={{
                              width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 8px', position: 'relative', zIndex: 1,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px',
                              background: done ? 'var(--green)' : current ? '#fff' : 'var(--paper-dim)',
                              color: done ? '#fff' : current ? 'var(--green)' : 'var(--steel)',
                              border: current ? '3px solid var(--green)' : '3px solid transparent',
                            }}
                          >
                            {done ? '✓' : idx + 1}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: current || done ? 'var(--ink)' : 'var(--steel)' }}>{s.label}</div>
                          <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '2px' }}>{current ? s.desc : ''}</div>
                        </div>
                      );
                    })}
                  </div>

                  {result.status === 'awaiting_payment' && (
                    <p style={{ fontSize: '13px', color: 'var(--steel)', textAlign: 'center', marginTop: '10px' }}>
                      We're still waiting for payment on this order. If you've already paid, please allow a few minutes and check again.
                    </p>
                  )}
                  {result.updated_at && (
                    <p style={{ fontSize: '12px', color: 'var(--steel)', textAlign: 'center', marginTop: '8px' }}>
                      Last updated: {formatWhen(result.updated_at)}
                    </p>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px', fontSize: '13px' }}>
                <Link to={`/orders/${result.id}`} style={{ fontWeight: 700 }}>View full order details (sign in) →</Link>
                <a
                  href={whatsappLink(`Hi Halfcon, I have a question about my order ${result.id}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 700, color: 'var(--green)' }}
                >
                  💬 Ask about this order on WhatsApp
                </a>
              </div>
            </div>
          )}

          <div className="track-help-row">
            <span>Need assistance locating your tracking code?</span>
            <a href={whatsappLink('Hi Halfcon, I need help tracking my order')} target="_blank" rel="noopener noreferrer">
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
