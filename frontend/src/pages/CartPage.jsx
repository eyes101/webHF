// pages/CartPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="wrap" style={{ padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--rust-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--rust)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '40px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>
          Your Cart is Empty
        </h1>
        <p style={{ color: 'var(--steel)', marginBottom: '32px', maxWidth: '420px', margin: '0 auto 32px' }}>
          Explore our services catalog to schedule nationwide logistics, haulage, or property maintenance.
        </p>
        <Link to="/services" className="btn btn-solid btn-lg">
          Browse Services Catalog
        </Link>
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
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>
      <p style={{ color: 'var(--steel)', marginBottom: '36px' }}>
        Review your requested services before proceeding to secure checkout.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--rust)', marginBottom: '4px' }}>
                  {item.category || 'Service'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--ink)', marginBottom: '4px' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--steel)' }}>
                  {formatNaira(item.price_cents)} per {item.unit || 'unit'}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  -
                </button>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, width: '28px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  +
                </button>
              </div>

              {/* Line Price & Remove */}
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '17px', color: 'var(--ink)', marginBottom: '6px' }}>
                  {formatNaira((item.price_cents || 0) * item.quantity)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.cartItemId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--red)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '12px' }}>
            <Link to="/services" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rust)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Add More Services
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="card" style={{ position: 'sticky', top: '100px', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: 'var(--ink)' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--steel)' }}>
              <span>Services Subtotal</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--ink)' }}>
                {formatNaira(total)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--steel)' }}>
              <span>Escrow &amp; Insurance Protection</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Free</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Total (NGN)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '28px', fontWeight: 900, color: 'var(--ink)' }}>
              {formatNaira(total)}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-solid btn-lg"
            onClick={() => navigate('/checkout')}
            style={{ width: '100%' }}
          >
            Proceed to Checkout →
          </button>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: 'var(--steel)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Guaranteed Secure Checkout with Paystack</span>
          </div>
        </div>
      </div>
    </div>
  );
}
