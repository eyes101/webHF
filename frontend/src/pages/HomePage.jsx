// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';
import './HomePage.css';

const CATEGORY_CONFIG = {
  logistics: { color: '#3b82f6', bg: '#eff6ff', strip: '#3b82f6', icon: '🚚' },
  'special-duties': { color: '#16a34a', bg: '#f0fdf4', strip: '#16a34a', icon: '🛡️' },
  property: { color: '#f97316', bg: '#fff7ed', strip: '#f97316', icon: '🏢' },
};

function getCategoryConfig(category) {
  const key = (category || '').toLowerCase().replace(/\s+/g, '-');
  return (
    CATEGORY_CONFIG[key] ||
    CATEGORY_CONFIG[Object.keys(CATEGORY_CONFIG).find((k) => key.includes(k))] || {
      color: '#16a34a', bg: '#f0fdf4', strip: '#16a34a', icon: '📦',
    }
  );
}

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.services.list()
      .then((res) => {
        const unique = {};
        res.services.forEach((s) => {
          if (!unique[s.category]) unique[s.category] = s;
        });
        setServices(Object.values(unique).slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-bg-blob hero-bg-blob-1" />
        <div className="hero-bg-blob hero-bg-blob-2" />

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot">
                <span className="hero-badge-ping" />
              </span>
              Nigeria's Most Reliable Logistics
            </div>

            <h1 className="hero-title">
              Seamless <span className="hero-title-accent">delivery</span> &amp;<br />
              premium services.
            </h1>

            <p className="hero-desc">
              From express nationwide logistics to property development and special duties.
              We connect Nigeria with speed and trust.
            </p>

            <div className="hero-ctas">
              <Link to="/services" className="cta-primary">
                Request Service
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link to="/services" className="cta-secondary">Track Package</Link>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Nationwide
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                24/7 Support
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Secure
              </div>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-img-ring hero-img-ring-1" />
            <div className="hero-img-ring hero-img-ring-2" />
            <img
              src="/hero.png"
              alt="Halfcon delivery and logistics"
              className="hero-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="hero-float-badge">
              <div className="hero-float-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div>
                <div className="hero-float-label">Deliveries Today</div>
                <div className="hero-float-num">2,450+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="services-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Everything you need, in one place</h2>
            <p className="section-desc">Comprehensive solutions for individuals and businesses across Nigeria. Select a service to get started.</p>
          </div>

          {loading ? (
            <div className="services-loading">Loading services…</div>
          ) : (
            <div className="services-grid">
              {services.map((s, i) => {
                const cfg = getCategoryConfig(s.category);
                const isCenter = i === 1;
                return (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    className={`service-card${isCenter ? ' service-card-featured' : ''}`}
                    style={{ '--strip-color': cfg.strip, '--icon-color': cfg.color, '--icon-bg': cfg.bg }}
                  >
                    {isCenter && <div className="service-card-popular">Popular</div>}
                    <div className="service-card-strip" />
                    <div className="service-card-icon">
                      <span style={{ fontSize: '26px' }}>{cfg.icon}</span>
                    </div>
                    <h3 className="service-card-title">{s.name}</h3>
                    <p className="service-card-desc">{s.description}</p>
                    <div className="service-card-price">{formatNaira(s.price_cents)}<span className="service-card-unit"> {s.unit}</span></div>
                    <div className="service-card-cta" style={{ color: cfg.color }}>
                      Explore →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-section">
        <div className="section-inner how-inner">
          <div className="how-steps-col">
            <h2 className="section-title">How Halfcon works</h2>
            <p className="section-desc" style={{ marginBottom: '48px' }}>
              We've streamlined our process to ensure your packages and service requests are handled with maximum efficiency and care.
            </p>

            <div className="steps">
              {[
                { n: '1', title: 'Book a Service', desc: 'Enter your details, select your required service (logistics, duties, or property), and get an instant quote.' },
                { n: '2', title: 'We Process & Assign', desc: 'Our system instantly assigns the nearest qualified agent or vehicle to handle your specific request securely.' },
                { n: '3', title: 'Track & Complete', desc: 'Monitor progress in real-time. Receive notifications upon successful delivery or project completion.' },
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
              <h3 className="cta-panel-title">Ready to move with us?</h3>
              <p className="cta-panel-desc">
                Join thousands of businesses and individuals who trust Halfcon for their daily logistics and special operations in Nigeria.
              </p>
              <Link to="/register" className="cta-panel-btn-solid">Create an Account</Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="cta-panel-btn-outline">
                Talk to Sales
              </a>
              <div className="cta-panel-footer">
                <div className="cta-panel-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Lagos, Abuja, PH
                </div>
                <div className="cta-panel-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  24/7 Operations
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
