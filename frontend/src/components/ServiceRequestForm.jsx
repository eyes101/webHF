// components/ServiceRequestForm.jsx
// Shared "Post a Service Request" form, modelled on the request-page pattern
// used by Nigerian service marketplaces (e.g. HireSphere's /service-request):
// one single-step form — category, description, location, optional budget,
// timing — with an info box explaining the WhatsApp follow-up.
//
// Halfcon has no public request-board backend yet (requests are handled by
// Operations on WhatsApp), so on submit the form:
//   1. validates the required fields inline (no alert()),
//   2. saves a copy of the request on this device (localStorage), and
//   3. opens WhatsApp to Halfcon Operations with the request pre-filled.
// It never pretends the request was posted to a board or a server.
import React, { useState } from 'react';
import { whatsappLink } from '../config/contacts';

export const SERVICE_REQUEST_CATEGORIES = [
  'Electrical & Power',
  'Plumbing & Water',
  'Carpentry & Interiors',
  'Building Maintenance',
  'Logistics Service',
  'Special Duties',
  'Other',
];

export const SERVICE_REQUEST_TIMING = [
  'Anytime (flexible)',
  'Emergency — today',
  'Within 24 hours',
  'This week',
  'Next week',
];

const STORAGE_KEY = 'halfcon_service_requests';

export function buildServiceRequestMessage(req) {
  const lines = [
    'Hello Halfcon Operations,',
    '',
    'I would like to request a service:',
    '',
    `📋 *Category:* ${req.category}`,
  ];
  if (req.serviceName) lines.push(`🔧 *Service:* ${req.serviceName}`);
  lines.push(
    `📝 *What I need:* ${req.description}`,
    `📍 *Location:* ${req.location}`,
    `⏱️ *When:* ${req.timing}`,
  );
  if (req.budget) lines.push(`💰 *My budget:* ₦${Number(req.budget).toLocaleString()}`);
  lines.push(
    '',
    `👤 *Name:* ${req.name}`,
    `📱 *My WhatsApp:* ${req.phone}`,
    '',
    'Please contact me to discuss details and pricing.',
  );
  return lines.join('\n');
}

export function saveServiceRequestLocally(req) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = {
      ...req,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      channel: 'whatsapp',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, 20)));
    return entry;
  } catch {
    return null;
  }
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--ink)',
  marginBottom: '5px',
};

export default function ServiceRequestForm({ initialCategory = '', initialServiceName = '' }) {
  const [category, setCategory] = useState(
    SERVICE_REQUEST_CATEGORIES.includes(initialCategory) ? initialCategory : '',
  );
  const [description, setDescription] = useState(
    initialServiceName ? `I would like to request: ${initialServiceName}. ` : '',
  );
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [timing, setTiming] = useState(SERVICE_REQUEST_TIMING[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category) return setError('Please choose the service category you need.');
    if (description.trim().length < 10) return setError('Please describe what you need (a sentence or two is enough).');
    if (!location.trim()) return setError('Please tell us where the job is (your area and city).');
    if (!name.trim()) return setError('Please tell us your name so we know who to ask for.');
    if (phone.replace(/\D/g, '').length < 10) return setError('Please enter a valid WhatsApp number so we can reach you.');

    const req = {
      category,
      serviceName: initialServiceName || '',
      description: description.trim(),
      location: location.trim(),
      budget: budget ? String(Math.max(0, parseInt(budget, 10) || 0)) : '',
      timing,
      name: name.trim(),
      phone: phone.trim(),
    };
    setError('');
    saveServiceRequestLocally(req);
    window.open(whatsappLink(buildServiceRequestMessage(req)), '_blank');
    setSubmitted(req);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 4px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
        <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
          Your request is on its way, {submitted.name.split(' ')[0]}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--steel)', lineHeight: 1.6, marginBottom: '18px' }}>
          We opened WhatsApp with your request details addressed to Halfcon Operations.
          Once you press send there, we will reply on WhatsApp to discuss details and pricing.
          A copy of this request is saved on this device.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            className="btn btn-green"
            href={whatsappLink(buildServiceRequestMessage(submitted))}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Open WhatsApp Again
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSubmitted(null);
              setDescription('');
              setBudget('');
            }}
          >
            Make Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="sr-category" style={labelStyle}>What service do you need? *</label>
          <select
            id="sr-category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {SERVICE_REQUEST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {initialServiceName && (
            <div style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '5px' }}>
              About: <strong style={{ color: 'var(--ink)' }}>{initialServiceName}</strong>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="sr-description" style={labelStyle}>Describe what you need *</label>
          <textarea
            id="sr-description"
            className="input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. I need an electrician to fix my distribution board and stop the breaker tripping."
            required
          />
        </div>

        <div>
          <label htmlFor="sr-location" style={labelStyle}>Your location *</label>
          <input
            id="sr-location"
            type="text"
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Ikeja, Lagos"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label htmlFor="sr-budget" style={labelStyle}>Budget (₦) <span style={{ color: 'var(--steel)', fontWeight: 500 }}>(optional)</span></label>
            <input
              id="sr-budget"
              type="number"
              min="0"
              step="1000"
              className="input"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 25000"
            />
          </div>
          <div>
            <label htmlFor="sr-timing" style={labelStyle}>When do you need it?</label>
            <select
              id="sr-timing"
              className="input"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
            >
              {SERVICE_REQUEST_TIMING.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label htmlFor="sr-name" style={labelStyle}>Your name *</label>
            <input
              id="sr-name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adaeze Okafor"
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label htmlFor="sr-phone" style={labelStyle}>WhatsApp number *</label>
            <input
              id="sr-phone"
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0803 123 4567"
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '13px',
            color: '#1E3A8A',
            lineHeight: 1.55,
          }}
        >
          <span aria-hidden="true">ℹ️</span>
          <span>
            Halfcon Operations will contact you via WhatsApp to discuss details and pricing.
            Make sure your WhatsApp number above is correct.
          </span>
        </div>

        {error && (
          <div className="error" role="alert" style={{ fontSize: '13px' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-solid btn-lg" style={{ width: '100%' }}>
          Post Service Request →
        </button>
        <div style={{ fontSize: '12px', color: 'var(--steel)', textAlign: 'center' }}>
          No booking fee. Your request goes straight to Halfcon Operations on WhatsApp.
        </div>
      </div>
    </form>
  );
}
