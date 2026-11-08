// pages/RequestServicePage.jsx
// "Post a Service Request" page at /request-service (alias /service-request),
// modelled on HireSphere's /service-request: a single-step form — category,
// description, location, optional budget, timing — so a customer who cannot
// find a catalog service can simply describe the job and be contacted.
//
// Halfcon differences, kept honest:
// - Guests are NOT forced through a sign-in modal before submitting (that is
//   HireSphere's pattern); instead the form collects name + WhatsApp number
//   and hands the request to Halfcon Operations on WhatsApp, which is how
//   Halfcon actually handles requests today.
// - A "Can't find it in the catalog?" banner on the Services page and a
//   slide-out drawer (ServiceRequestDrawer) lead here / reuse the same form.
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ServiceRequestForm from '../components/ServiceRequestForm';
import { CONTACTS, whatsappLink } from '../config/contacts';

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Tell us what you need',
    text: 'Pick a category and describe the job in your own words — a sentence or two is enough.',
  },
  {
    step: '2',
    title: 'We reply on WhatsApp',
    text: 'Halfcon Operations contacts you on the WhatsApp number you give us, to confirm details and pricing.',
  },
  {
    step: '3',
    title: 'Agree & get it done',
    text: 'Once you agree the price and schedule, a verified Halfcon specialist is assigned to your job.',
  },
];

export default function RequestServicePage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialServiceName = searchParams.get('service') || '';

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: '760px', marginBottom: '36px' }}>
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
            marginBottom: '12px',
          }}
        >
          Request a Service
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
            marginBottom: '14px',
          }}
        >
          Post a Service Request
        </h1>
        <p style={{ color: 'var(--steel)', fontSize: '16px', lineHeight: 1.6 }}>
          Can't find the exact service in the <Link to="/services" style={{ color: 'var(--rust)', fontWeight: 700 }}>catalog</Link>?
          Describe the job here and let Halfcon come to you — no booking fee, no middleman.
        </p>
      </div>

      {/* How it works */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        {HOW_IT_WORKS.map((item) => (
          <div key={item.step} className="card" style={{ padding: '20px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#0F1B4C',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
                marginBottom: '10px',
              }}
            >
              {item.step}
            </div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--ink)', marginBottom: '5px' }}>
              {item.title}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--steel)', lineHeight: 1.55 }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.65fr)', gap: '24px', alignItems: 'start' }}>
        {/* The request form */}
        <div className="card" style={{ padding: '28px' }}>
          <ServiceRequestForm
            key={`${initialCategory}|${initialServiceName}`}
            initialCategory={initialCategory}
            initialServiceName={initialServiceName}
          />
        </div>

        {/* Side contact card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '22px', background: 'var(--paper-dim)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
              Prefer to talk first?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--steel)', lineHeight: 1.6, marginBottom: '14px' }}>
              Message Halfcon Operations directly and we will help you scope the job.
            </p>
            <a
              className="btn btn-green"
              style={{ width: '100%', marginBottom: '10px' }}
              href={whatsappLink("Hi Halfcon, I'd like to discuss a service request.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 WhatsApp {CONTACTS.whatsappDisplay}
            </a>
            <div style={{ fontSize: '13px', color: 'var(--steel)' }}>
              ✉️ {CONTACTS.email}
              <br />
              📞 {CONTACTS.phoneSecondary}
            </div>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
              Visit us
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--steel)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--ink)' }}>Ikorodu:</strong> {CONTACTS.addressIkorodu}
              <br />
              <br />
              <strong style={{ color: 'var(--ink)' }}>Alaba:</strong> {CONTACTS.addressAlaba}
            </p>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
              Know the service already?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--steel)', lineHeight: 1.6, marginBottom: '12px' }}>
              Fixed-price services in the catalog can be requested instantly, without describing the job.
            </p>
            <Link to="/services" className="btn btn-ghost" style={{ width: '100%' }}>
              Browse the Services Catalog →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
