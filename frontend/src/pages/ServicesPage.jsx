// pages/ServicesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import ArtisanHireNegotiationModal from '../components/ArtisanHireNegotiationModal';

const PROPERTY_PILLARS = [
  {
    id: 'electrical',
    category: 'Electrical & Power',
    title: 'Electrical & Power',
    icon: '⚡',
    color: '#D97706',
    bg: '#FEF3C7',
    desc: 'Certified wiring, solar inverters, generator ATS automation & smart lighting.',
    highlights: [
      'Full-structure rewiring & load balancing',
      'Hybrid solar inverter & lithium battery banks',
      'Automatic generator transfer switch (ATS)',
      'Smart home lighting, breakers & sockets',
    ],
  },
  {
    id: 'plumbing',
    category: 'Plumbing & Water',
    title: 'Plumbing & Water',
    icon: '🚰',
    color: '#2563EB',
    bg: '#DBEAFE',
    desc: 'Leak detection, borehole pumping, water treatment & sanitary fittings.',
    highlights: [
      'Acoustic & thermal leak detection',
      'Borehole pumps & multi-stage filtration',
      'Water heaters & modern bathroom suites',
      'High-pressure drain jetting & soakaways',
    ],
  },
  {
    id: 'carpentry',
    category: 'Carpentry & Interiors',
    title: 'Carpentry & Fit-Out',
    icon: '🔨',
    color: '#F2A024',
    bg: '#FFFBEB',
    desc: 'Modular kitchen cabinets, wardrobes, POP ceilings & hardwood joinery.',
    highlights: [
      'Moisture-resistant modular kitchen units',
      'Plaster of Paris (POP) ceiling design',
      'Hardwood security doors & smart locks',
      'Porcelain tiling & wooden floor decking',
    ],
  },
  {
    id: 'property',
    category: 'Property Management',
    title: 'Property & Structures',
    icon: '🏢',
    color: '#16A34A',
    bg: '#DCFCE7',
    desc: 'Complete building renovations, waterproofing, masonry & safety audits.',
    highlights: [
      'Weather-shield interior & exterior painting',
      'Bituminous membrane roof waterproofing',
      'Full structural & MEP facility audits',
      'Masonry, plastering & perimeter fencing',
    ],
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [loading, setLoading] = useState(true);
  const [negotiatePillar, setNegotiatePillar] = useState(null);
  const { addItem } = useCart();
  const [addedItem, setAddedItem] = useState(null);

  // Fetch full catalog once to capture all distinct categories
  useEffect(() => {
    api.services
      .list()
      .then((res) => {
        const cats = [...new Set((res.services || []).map((s) => s.category).filter(Boolean))];
        setAllCategories(cats);
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Fetch filtered or full list when activeCategory changes
  useEffect(() => {
    setLoading(true);
    api.services
      .list(activeCategory)
      .then((res) => setServices(res.services || []))
      .catch((err) => console.error('Failed to load services:', err))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleCategorySelect = (cat) => {
    if (!cat) {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleQuickAdd = (e, service) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(service, 1);
    setAddedItem(service.id);
    setTimeout(() => setAddedItem(null), 2500);
  };

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px' }}>
      {/* Page Header */}
      <div style={{ maxWidth: '760px', marginBottom: '40px' }}>
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
          Comprehensive Solutions
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
          Services &amp; Property Catalog
        </h1>
        <p style={{ color: 'var(--steel)', fontSize: '16px', lineHeight: 1.6 }}>
          From full residential development and preventive property maintenance to express logistics and specialized operational duties across Nigeria.
        </p>
      </div>

      {/* 4-COLUMN HOME MAINTENANCE & PROPERTY PILLARS WITH P2P ARTISAN HIRING */}
      <section style={{ marginBottom: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '26px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)' }}>
              Home Maintenance &amp; Property Pillars
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--steel)' }}>
              Click any pillar to filter services, or click <strong>Hire Artisan</strong> to negotiate custom task scopes with escrow protection.
            </div>
          </div>
          {activeCategory && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleCategorySelect('')}
            >
              Clear Filter ✕
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {PROPERTY_PILLARS.map((pillar) => {
            const isSelected = activeCategory.toLowerCase().includes(pillar.id) || activeCategory.toLowerCase().includes(pillar.category.toLowerCase());
            return (
              <div
                key={pillar.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderColor: isSelected ? pillar.color : 'var(--line)',
                  background: isSelected ? pillar.bg : '#ffffff',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  padding: '24px 20px',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      background: pillar.bg,
                      color: pillar.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      marginBottom: '16px',
                    }}
                  >
                    {pillar.icon}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
                    {pillar.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--steel)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {pillar.desc}
                  </p>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {pillar.highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: 'var(--ink)' }}>
                        <span style={{ color: pillar.color, fontWeight: 700 }}>•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                  {/* Filter View Button */}
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '12px', justifyContent: 'space-between', width: '100%', color: pillar.color, fontWeight: 700 }}
                    onClick={() => handleCategorySelect(pillar.category)}
                  >
                    <span>{isSelected ? '✓ Filtering Services' : 'Browse Catalog Items'}</span>
                    <span>→</span>
                  </button>

                  {/* P2P Artisan Hiring & Negotiation Trigger */}
                  <button
                    type="button"
                    className="btn btn-sm btn-solid"
                    style={{ fontSize: '12px', width: '100%', background: '#0F1B4C', borderColor: '#0F1B4C' }}
                    onClick={() => setNegotiatePillar(pillar.id)}
                  >
                    🤝 Hire Artisan &amp; Escrow Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter Pills */}
      <div style={{ marginBottom: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className={`btn btn-sm ${!activeCategory ? 'btn-solid' : ''}`}
          onClick={() => handleCategorySelect('')}
        >
          All Categories
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${activeCategory.toLowerCase() === cat.toLowerCase() ? 'btn-solid' : ''}`}
            onClick={() => handleCategorySelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--steel)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--steel)', marginBottom: '16px' }}>No services currently listed under "{activeCategory}".</p>
          <button
            type="button"
            className="btn btn-sm btn-solid"
            onClick={() => handleCategorySelect('')}
          >
            View All Services
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="card"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s ease',
                  padding: '24px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--rust)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: 'var(--rust)',
                      marginBottom: '8px',
                    }}
                  >
                    {service.category || 'General Service'}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Big Shoulders Display', sans-serif",
                      fontSize: '22px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      color: 'var(--ink)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {service.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--steel)', marginBottom: '20px', lineHeight: 1.55 }}>
                    {service.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--line)',
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>
                    {formatNaira(service.price_cents)}
                    <span style={{ fontSize: '11px', color: 'var(--steel)', marginLeft: '4px', fontWeight: 500 }}>
                      / {service.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, service)}
                    className={`btn btn-sm ${addedItem === service.id ? 'btn-green' : 'btn-solid'}`}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {addedItem === service.id ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* P2P Artisan Hiring & Negotiation Modal */}
      {negotiatePillar && (
        <ArtisanHireNegotiationModal
          pillarId={negotiatePillar}
          onClose={() => setNegotiatePillar(null)}
        />
      )}
    </div>
  );
}
