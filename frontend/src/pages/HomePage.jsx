// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';
import './HomePage.css';

const CATEGORY_CONFIG = {
  electrical: { color: '#f59e0b', bg: '#fef3c7', strip: '#f59e0b', icon: '⚡' },
  'home-management': { color: '#8b5cf6', bg: '#f3e8ff', strip: '#8b5cf6', icon: '🏠' },
  'office-management': { color: '#06b6d4', bg: '#cffafe', strip: '#06b6d4', icon: '🏢' },
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
        setServices(res.services);
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
              Nigeria's Most Trusted Service Provider
            </div>

            <h1 className="hero-title">
              Complete <span className="hero-title-accent">care</span> &amp;<br />
              professional services.
            </h1>

            <p className="hero-desc">
              From electrical solutions to comprehensive home and office management.
              We deliver excellence and reliability across Nigeria.
            </p>

            <div className="hero-ctas">
              <Link to="/services" className="cta-primary">
                Request Service
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 [...]
              </Link>
              <Link to="/services" className="cta-secondary">Browse Services</Link>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9[...]
                Nationwide
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9[...]
                24/7 Support
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9[...]
                Secure
              </div>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-img-ring hero-img-ring-1" />
            <div className="hero-img-ring hero-img-ring-2" />
            <img
              src="/hero.png"
              alt="Professional services"
              className="hero-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="hero-float-badge">
              <div className="hero-float-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/[...]
              </div>
              <div>
                <div className="hero-float-label">Services Today</div>
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
              {services.map((s) => {
                const cfg = getCategoryConfig(s.category);
                return (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    className="service-card"
                    style={{ '--strip-color': cfg.strip, '--icon-color': cfg.color, '--icon-bg': cfg.bg }}
                  >
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
            <h2 className="section-title">How we work</h2>
            <p className="section-desc" style={{ marginBottom: '48px' }}>
              We've streamlined our process to ensure your service requests are handled with maximum efficiency and professionalism.
            </p>

            <div className="steps">
              {[
                { n: '1', title: 'Book a Service', desc: 'Enter your details, select your required service (electrical, home, or office management), and get an instant quote.' },
                { n: '2', title: 'We Process & Assign', desc: 'Our system instantly assigns the nearest qualified professional to handle your specific request.' },
                { n: '3', title: 'Track & Complete', desc: 'Monitor progress in real-time. Receive notifications upon successful completion of your service.' },
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
              <h3 className="cta-panel-title">Ready to work with us?</h3>
              <p className="cta-panel-desc">
                Join thousands of businesses and individuals who trust us for their electrical, home, and office management needs across Nigeria.
              </p>
              <Link to="/register" className="cta-panel-btn-solid">Create an Account</Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="cta-panel-btn-outline">
                Talk to Sales
              </a>
              <div className="cta-panel-footer">
                <div className="cta-panel-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13[...]
                  Lagos, Abuja, PH
                </div>
                <div className="cta-panel-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyli[...]
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
