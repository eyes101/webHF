// pages/ServiceDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.services.get(slug)
      .then((res) => setService(res.service))
      .catch((err) => console.error('Failed to load service:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (service) {
      addItem(service, quantity);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    }
  };

  const handleBookNow = () => {
    if (service) {
      addItem(service, quantity);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--steel)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        Loading service details...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '36px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Service Not Found
        </h1>
        <p style={{ color: 'var(--steel)', marginBottom: '24px' }}>
          The requested service could not be located in our catalog.
        </p>
        <Link to="/services" className="btn btn-solid">
          Explore All Services
        </Link>
      </div>
    );
  }

  const totalPrice = (service.price_cents || 0) * quantity;

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--steel)', marginBottom: '32px' }}>
        <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        <span>/</span>
        <Link to="/services" style={{ color: 'inherit' }}>Services</Link>
        <span>/</span>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{service.name}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'start' }}>
        {/* Left Column: Details */}
        <div>
          <div
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--rust)',
              background: 'var(--rust-light)',
              border: '1px solid var(--rust-dim)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '16px',
            }}
          >
            {service.category || 'Operations'}
          </div>

          <h1
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: '44px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              color: 'var(--ink)',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}
          >
            {service.name}
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--steel)', lineHeight: 1.7, marginBottom: '36px' }}>
            {service.description}
          </p>

          <div className="card" style={{ marginBottom: '32px', background: 'var(--paper-dim)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--ink)' }}>
              Service Inclusions &amp; Standards
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Vetted & certified operational specialists assigned directly.',
                'Real-time milestone tracking and customer messaging thread.',
                'Escrow payment protection with automated official receipts.',
                'Direct hotline support and rapid nationwide escalation.',
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--ink)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Booking Card */}
        <div className="card" style={{ position: 'sticky', top: '100px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: 'var(--steel)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Pricing Rate
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>
              {formatNaira(service.price_cents)}
              <span style={{ fontSize: '14px', color: 'var(--steel)', fontWeight: 500 }}> / {service.unit}</span>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Quantity ({service.unit}s)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: '40px', height: '40px', fontSize: '18px', padding: 0 }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="input"
                style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', height: '40px' }}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setQuantity((q) => q + 1)}
                style={{ width: '40px', height: '40px', fontSize: '18px', padding: 0 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Subtotal Calculation */}
          <div style={{ background: 'var(--paper-dim)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--steel)' }}>Estimated Total</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
              {formatNaira(totalPrice)}
            </span>
          </div>

          {addedNotice && (
            <div className="success" style={{ marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Added to cart! <Link to="/cart" style={{ fontWeight: 700, textDecoration: 'underline' }}>View Cart →</Link></span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-solid btn-lg"
              onClick={handleAddToCart}
              style={{ width: '100%' }}
            >
              + Add to Request List
            </button>
            <button
              type="button"
              className="btn btn-dark btn-lg"
              onClick={handleBookNow}
              style={{ width: '100%' }}
            >
              ⚡ Request Service Now
            </button>
            <a
              href={whatsappLink(`Hi Halfcon, I would like to request service: ${service.name} (${formatNaira(service.price_cents)} / ${service.unit}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ width: '100%', fontSize: '13px', color: 'var(--green)' }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
              Request on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
