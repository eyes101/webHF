// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';
import './HomePage.css';

const CATEGORY_CONFIG = {
  logistics: { color: '#2563EB', bg: '#EFF6FF', strip: '#2563EB', icon: '🚚', label: 'Logistics' },
  'special-duties': { color: '#16A34A', bg: '#F0FDF4', strip: '#16A34A', icon: '🛡️', label: 'Special Duties' },
  property: { color: '#F2A024', bg: '#FFFBEB', strip: '#F2A024', icon: '🏢', label: 'Property Dev' },
  electrical: { color: '#D97706', bg: '#FEF3C7', strip: '#D97706', icon: '⚡', label: 'Electrical' },
  maintenance: { color: '#0F1B4C', bg: '#F1F5F9', strip: '#0F1B4C', icon: '🔧', label: 'Maintenance' },
};

function getCategoryConfig(category) {
  const key = (category || '').toLowerCase().replace(/\s+/g, '-');
  return (
    CATEGORY_CONFIG[key] ||
    CATEGORY_CONFIG[Object.keys(CATEGORY_CONFIG).find((k) => key.includes(k))] || {
      color: '#F2A024', bg: '#FFFBEB', strip: '#F2A024', icon: '📦', label: category || 'Service'
    }
  );
}

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.services.list().catch(() => ({ services: [] })),
      api.artisans.list().catch(() => ({ artisans: [] })),
    ])
      .then(([servicesRes, artisansRes]) => {
        setServices(servicesRes.services?.slice(0, 6) || []);
        setArtisans(artisansRes.artisans?.slice(0, 4) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/orders/${trackingNumber.trim()}`);
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="home">

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg-blob hero-bg-blob-1" />
        <div className="hero-bg-blob hero-bg-blob-2" />

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot">
                <span className="hero-badge-ping" />
              </span>
              Nigeria's Premier Operations Network
            </div>

            <h1 className="hero-title">
              Operations, Logistics &amp;<br />
              <span className="hero-title-accent">Property Care</span> Built to Move.
            </h1>

            <p className="hero-desc">
              From nationwide cargo logistics and special duties to vetted artisans and property maintenance. Halfcon delivers excellence with unmatched reliability.
            </p>

            <div className="hero-ctas">
              <Link to="/services" className="cta-primary">
                Book a Service
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link to="/artisans" className="cta-secondary">Find Verified Artisans</Link>
            </div>

            {/* Quick Tracking Widget */}
            <form onSubmit={handleTrackSubmit} className="hero-track-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--steel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Enter Order ID to track (e.g. ord_12345)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="hero-track-input"
              />
              <button type="submit" className="hero-track-btn">
                Track Order
              </button>
            </form>

            <div className="hero-trust">
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                36 States Covered
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                24/7 Operations Hub
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                100% Vetted Personnel
              </div>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-img-ring hero-img-ring-1" />
            <div className="hero-img-ring hero-img-ring-2" />
            
            <div className="hero-stats-card">
              <div className="hero-stat-box">
                <div className="hero-stat-num">2,500+</div>
                <div className="hero-stat-label">Daily Deliveries</div>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-box">
                <div className="hero-stat-num">99.4%</div>
                <div className="hero-stat-label">On-Time Completion</div>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-box">
                <div className="hero-stat-num">500+</div>
                <div className="hero-stat-label">Verified Artisans</div>
              </div>
            </div>

            <div className="hero-float-badge">
              <div className="hero-float-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div>
                <div className="hero-float-label">Active Deployments</div>
                <div className="hero-float-num">Lagos &middot; Abuja &middot; PH</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED SERVICES ===== */}
      <section className="services-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-eyebrow">Complete Capabilities</div>
            <h2 className="section-title">Everything You Need, In One Place</h2>
            <p className="section-desc">From express haulage to property care and corporate logistics. Select a service to get started immediately.</p>
          </div>

          {loading ? (
            <div className="services-loading">
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              Loading services catalogue...
            </div>
          ) : (
            <div className="services-grid">
              {services.map((s, i) => {
                const cfg = getCategoryConfig(s.category);
                return (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    className="service-card"
                    style={{ '--strip-color': cfg.strip }}
                  >
                    <div className="service-card-strip" />
                    <div className="service-card-header">
                      <div className="service-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
                        <span style={{ fontSize: '24px' }}>{cfg.icon}</span>
                      </div>
                      <span className="service-card-tag" style={{ background: cfg.bg, color: cfg.color }}>
                        {s.category || 'Standard'}
                      </span>
                    </div>

                    <h3 className="service-card-title">{s.name}</h3>
                    <p className="service-card-desc">{s.description}</p>
                    
                    <div className="service-card-footer">
                      <div className="service-card-price">
                        {formatNaira(s.price_cents)}
                        <span className="service-card-unit"> / {s.unit}</span>
                      </div>
                      <span className="service-card-cta" style={{ color: cfg.color }}>
                        Book Now →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/services" className="btn btn-lg btn-solid">
              View All Services ({services.length}+)
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE HALFCON ===== */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-eyebrow">The Halfcon Standard</div>
            <h2 className="section-title">Built for Speed, Trust &amp; Reliability</h2>
            <p className="section-desc">Why thousands of businesses and homeowners rely on Halfcon across Nigeria.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h3 className="feature-title">Rapid Nationwide Dispatch</h3>
              <p className="feature-desc">Our distributed fleet and regional dispatchers ensure your cargo and special requests are mobilized instantly.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="feature-title">100% Vetted Artisans</h3>
              <p className="feature-desc">Every technician, plumber, electrician, and contractor undergoes thorough background verification and skill testing.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 className="feature-title">Real-Time Tracking</h3>
              <p className="feature-desc">Track every milestone of your order with transparent status updates and instant messaging with our support staff.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: '#F1F5F9', color: '#0F1B4C' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <h3 className="feature-title">Secure Naira Payments</h3>
              <p className="feature-desc">Seamless online checkout via Paystack, instant automated receipts, and guaranteed order escrow protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VERIFIED ARTISANS PREVIEW ===== */}
      {artisans.length > 0 && (
        <section className="artisans-preview-section">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-eyebrow">Verified Tradespeople</div>
              <h2 className="section-title">Hire Top-Rated Nigerian Artisans</h2>
              <p className="section-desc">Need trusted hands for maintenance, electrical, plumbing, or building projects? Book directly with one click.</p>
            </div>

            <div className="artisans-grid">
              {artisans.map((a) => (
                <div key={a.id} className="artisan-card">
                  <div className="artisan-card-header">
                    <div className="artisan-avatar">
                      {a.name.charAt(0)}
                    </div>
                    <div>
                      <div className="artisan-name">{a.name}</div>
                      <div className="artisan-trade-badge">{a.trade}</div>
                    </div>
                  </div>

                  <div className="artisan-services-list">
                    {(a.services_offered || []).slice(0, 3).map((serv, idx) => (
                      <span key={idx} className="artisan-service-pill">
                        {serv}
                      </span>
                    ))}
                  </div>

                  <a
                    href={whatsappLink(`Hi Halfcon, I'd like to book ${a.name} (${a.trade}) for a job.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="artisan-book-btn"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
                    Book via WhatsApp
                  </a>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <Link to="/artisans" className="btn btn-ghost" style={{ fontWeight: 700, color: 'var(--rust)' }}>
                View Complete Artisan Directory →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-section">
        <div className="section-inner how-inner">
          <div className="how-steps-col">
            <div className="section-eyebrow">Step-By-Step</div>
            <h2 className="section-title">How Halfcon Operates</h2>
            <p className="section-desc" style={{ marginBottom: '40px' }}>
              We've streamlined our operational workflow to ensure seamless bookings, active tracking, and guaranteed satisfaction.
            </p>

            <div className="steps">
              {[
                { n: '1', title: 'Choose Service or Artisan', desc: 'Browse our catalog or select from our directory of verified artisans. Configure requirements with instant quotes.' },
                { n: '2', title: 'Instant Assignment & Dispatch', desc: 'Our regional logistics team or vetted specialists are mobilized immediately to execute the job.' },
                { n: '3', title: 'Real-Time Tracking & Completion', desc: 'Monitor your task in real-time with direct updates, customer messaging, and verified job sign-off.' },
              ].map((step) => (
                <div key={step.n} className="step">
                  <div className="step-num">{step.n}</div>
                  <div className="step-body">
                    <div className="step-title">{step.title}</div>
                    <div className="step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="how-cta-col">
            <div className="cta-panel">
              <div className="cta-panel-glow" />
              <h3 className="cta-panel-title">Ready to Move With Nigeria's Best?</h3>
              <p className="cta-panel-desc">
                Join thousands of enterprises, property managers, and individuals who trust Halfcon daily.
              </p>
              <Link to="/register" className="cta-panel-btn-solid">Get Started Today</Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="cta-panel-btn-outline">
                Chat with an Operations Advisor
              </a>
              <div className="cta-panel-footer">
                <div className="cta-panel-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Lagos, Abuja, PH, Kano
                </div>
                <div className="cta-panel-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  24/7 Operations Hub
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
