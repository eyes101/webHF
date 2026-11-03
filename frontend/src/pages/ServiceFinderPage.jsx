// pages/ServiceFinderPage.jsx — Guided "describe your problem" service finder
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';

const PROBLEMS = [
  {
    key: 'power',
    icon: '⚡',
    label: 'Power problems',
    hint: 'No light, inverter or solar issues, wiring faults',
    categories: ['Electrical & Power'],
    words: ['power', 'light', 'inverter', 'solar', 'battery', 'wiring', 'generator', 'voltage', 'spark', 'socket', 'breaker', 'nepa', 'phcn'],
  },
  {
    key: 'water',
    icon: '🚰',
    label: 'Water & plumbing',
    hint: 'Leaks, borehole, low pressure, blocked pipes',
    categories: ['Plumbing & Water'],
    words: ['water', 'leak', 'pipe', 'borehole', 'pump', 'pressure', 'drain', 'blocked', 'tap', 'toilet', 'tank'],
  },
  {
    key: 'wood',
    icon: '🪚',
    label: 'Kitchen, wardrobes & woodwork',
    hint: 'Cabinets, wardrobes, ceilings, doors, tiling',
    categories: ['Carpentry & Interiors'],
    words: ['kitchen', 'cabinet', 'wardrobe', 'ceiling', 'door', 'wood', 'tile', 'tiling', 'furniture', 'shelf'],
  },
  {
    key: 'walls',
    icon: '🏠',
    label: 'Walls, roof & building',
    hint: 'Painting, roofing, waterproofing, repairs',
    categories: ['Building Maintenance'],
    words: ['paint', 'roof', 'wall', 'crack', 'waterproof', 'plaster', 'grout', 'renovat', 'repair', 'building', 'damp'],
  },
  {
    key: 'moving',
    icon: '🚚',
    label: 'Moving & logistics',
    hint: 'Moving house, haulage, dispatch',
    categories: ['Logistics Service'],
    words: ['move', 'moving', 'haulage', 'deliver', 'dispatch', 'truck', 'goods', 'transport'],
  },
  {
    key: 'other',
    icon: '✨',
    label: 'Something else',
    hint: 'Special or one-off jobs',
    categories: ['Special Duties'],
    words: [],
  },
];

export default function ServiceFinderPage() {
  const [step, setStep] = useState(1);
  const [problem, setProblem] = useState(null);
  const [details, setDetails] = useState('');
  const [services, setServices] = useState([]);
  const [loadError, setLoadError] = useState('');
  const { addItem } = useCart();
  const [added, setAdded] = useState({});

  useEffect(() => {
    api.services
      .list()
      .then((data) => setServices(data.services || []))
      .catch(() => setLoadError('We could not load the services catalog just now. You can still describe the job to our team on WhatsApp below.'));
  }, []);

  const matches = useMemo(() => {
    if (!problem) return [];
    const text = details.toLowerCase();
    const extraWords = problem.words.filter((w) => text.includes(w));
    const scored = services
      .filter((s) => problem.categories.includes(s.category))
      .map((s) => {
        const hay = `${s.name} ${s.description || ''}`.toLowerCase();
        let score = 1;
        extraWords.forEach((w) => { if (hay.includes(w)) score += 2; });
        problem.words.forEach((w) => { if (text.includes(w) && hay.includes(w)) score += 1; });
        return { service: s, score };
      })
      .sort((a, b) => b.score - a.score || a.service.name.localeCompare(b.service.name));
    return scored.slice(0, 4).map((x) => x.service);
  }, [problem, details, services]);

  const waMessage = problem
    ? `Hi Halfcon, I need help with: ${problem.label}. ${details ? `Details: ${details}` : ''}`.trim()
    : 'Hi Halfcon, I need help with a job at my place.';

  const cardStyle = { background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-md)' };

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <p style={{ fontSize: '13px', marginBottom: '10px' }}>
        <Link to="/">Home</Link> <span style={{ color: 'var(--steel)' }}>/</span> <strong>Service Finder</strong>
      </p>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '40px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>
        What do you need help with?
      </h1>
      <p style={{ color: 'var(--steel)', marginBottom: '28px', maxWidth: '620px', lineHeight: 1.6 }}>
        Answer two quick questions and we'll point you to the right service — or connect you with a verified artisan or our team on WhatsApp.
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', fontSize: '13px', fontWeight: 700 }}>
        {[1, 2, 3].map((n) => (
          <span key={n} style={{ padding: '6px 12px', borderRadius: '999px', background: step >= n ? 'var(--navy, #0F1B4C)' : 'var(--paper-dim)', color: step >= n ? '#fff' : 'var(--steel)' }}>
            {n}. {n === 1 ? 'The problem' : n === 2 ? 'Details' : 'Your matches'}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {PROBLEMS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => { setProblem(p); setStep(2); }}
              style={{ ...cardStyle, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
            >
              <div style={{ fontSize: '26px', marginBottom: '8px' }}>{p.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{p.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--steel)', lineHeight: 1.5 }}>{p.hint}</div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && problem && (
        <div style={cardStyle}>
          <div style={{ fontSize: '22px', marginBottom: '4px' }}>{problem.icon} {problem.label}</div>
          <p style={{ color: 'var(--steel)', fontSize: '14px', lineHeight: 1.6, marginBottom: '14px' }}>
            Tell us a little more so we can match you better — what's happening, and roughly where (area in Lagos is fine). You can skip this if you'd rather just see the services.
          </p>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="e.g. My 3.5kVA inverter stops charging when NEPA light comes, in Ikorodu…"
            style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', lineHeight: 1.55, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button type="button" className="btn btn-solid" onClick={() => setStep(3)}>Show my matches →</button>
          </div>
        </div>
      )}

      {step === 3 && problem && (
        <div>
          {loadError && (
            <div style={{ ...cardStyle, marginBottom: '16px', fontSize: '14px', lineHeight: 1.6 }}>
              {loadError}
            </div>
          )}

          {matches.length > 0 && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '14px' }}>Services that fit “{problem.label}”</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {matches.map((s) => (
                  <div key={s.id || s.slug} style={cardStyle}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--rust)', marginBottom: '4px' }}>{s.category}</div>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{s.name}</div>
                    <p style={{ fontSize: '13px', color: 'var(--steel)', lineHeight: 1.55, marginBottom: '12px' }}>{s.description}</p>
                    <div style={{ fontWeight: 800, marginBottom: '12px' }}>
                      {formatNaira(s.price_cents)} <span style={{ fontSize: '12px', color: 'var(--steel)', fontWeight: 500 }}>per {s.unit}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link to={`/services/${s.slug}`} className="btn btn-outline btn-sm">View details</Link>
                      <button
                        type="button"
                        className="btn btn-solid btn-sm"
                        onClick={() => { addItem(s); setAdded((prev) => ({ ...prev, [s.id]: true })); }}
                      >
                        {added[s.id] ? '✓ Added to cart' : 'Request now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ ...cardStyle, marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>Rather hire an artisan directly?</div>
            <p style={{ fontSize: '14px', color: 'var(--steel)', lineHeight: 1.6, marginBottom: '12px' }}>
              Browse verified artisans for this kind of work and hire with escrow protection — your money is only released when you approve the finished job.
            </p>
            <Link to="/artisans" className="btn btn-outline">Browse artisans →</Link>
          </div>

          <div style={{ ...cardStyle, marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>Not sure, or it's urgent?</div>
            <p style={{ fontSize: '14px', color: 'var(--steel)', lineHeight: 1.6, marginBottom: '12px' }}>
              Send your description straight to our team on WhatsApp — your answers above are already filled in, just tap send.
            </p>
            <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#25D366', color: '#fff', border: 'none' }}>
              💬 Send it on WhatsApp
            </a>
          </div>

          <button type="button" className="btn btn-outline" onClick={() => { setStep(1); setProblem(null); }}>
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
