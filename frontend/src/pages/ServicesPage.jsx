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
    category: 'Building Maintenance',
    title: 'Maintenance & Surface Care',
    icon: '🏠',
    color: '#16A34A',
    bg: '#DCFCE7',
    desc: 'Weather-shield painting, roof waterproofing, tile re-grouting & surface patching.',
    highlights: [
      'Interior & exterior weather-shield painting',
      'Bituminous membrane roof leak waterproofing',
      'Porcelain tile re-grouting & floor repair',
      'Wall crack masonry patching & smooth screeding',
    ],
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const activeSort = searchParams.get('sort') || 'default';
  const [loading, setLoading] = useState(true);
  const [negotiatePillar, setNegotiatePillar] = useState(null);
  const { addItem } = useCart();
  const [addedItem, setAddedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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

  // Fetch filtered or full list when activeCategory changes (or on retry)
  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    api.services
      .list(activeCategory)
      .then((res) => setServices(res.services || []))
      .catch((err) => {
        console.error('Failed to load services:', err);
        setServices([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, retryCount]);

  const handleCategorySelect = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (!cat) {
      next.delete('category');
    } else {
      next.set('category', cat);
    }
    setSearchParams(next);
  };

  const handleSortSelect = (sort) => {
    const next = new URLSearchParams(searchParams);
    if (!sort || sort === 'default') {
      next.delete('sort');
    } else {
      next.set('sort', sort);
    }
    setSearchParams(next);
  };

  const sortedServices = [...services].sort((a, b) => {
    switch (activeSort) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'price-asc':
        return (a.price_cents ?? 0) - (b.price_cents ?? 0);
      case 'price-desc':
        return (b.price_cents ?? 0) - (a.price_cents ?? 0);
      default:
        return 0; // Keep the API order: category, then name
    }
  });

  const visibleServices = sortedServices.filter((service) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return [service.name, service.description, service.category]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q));
  });

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
          Maintenance &amp; Sales Solutions
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
          Services &amp; Maintenance Catalog
        </h1>
        <p style={{ color: 'var(--steel)', fontSize: '16px', lineHeight: 1.6 }}>
          Professional home maintenance, technician repairs, genuine electrical &amp; electronics supplies, and express logistics across Nigeria.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '32px', maxWidth: '560px' }}>
        <label htmlFor="services-search" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
          Search services
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            id="services-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. solar inverter, leak detection, painting…"
            style={{ flex: 1, padding: '12px 16px', fontSize: '14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', color: 'var(--ink)', background: '#ffffff' }}
          />
          {searchQuery && (
            <button type="button" className="btn btn-sm" onClick={() => setSearchQuery('')}>
              Clear ✕
            </button>
          )}
        </div>
        {searchQuery && !loading && !loadError && (
          <p style={{ fontSize: '13px', color: 'var(--steel)', marginTop: '8px' }}>
            {visibleServices.length} of {services.length} services match “{searchQuery}”
            {activeCategory ? ` in ${activeCategory}` : ''}
          </p>
        )}
      </div>

      {/* 4-COLUMN HOME MAINTENANCE & REPAIR PILLARS WITH P2P ARTISAN HIRING */}
      <section style={{ marginBottom: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '26px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)' }}>
              Home Maintenance &amp; Repair Pillars
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
                    🤝 Request Artisan &amp; Escrow Task
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

      {/* Sort Control */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
        <label htmlFor="services-sort" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
          Sort by:
        </label>
        <select
          id="services-sort"
          value={activeSort}
          onChange={(e) => handleSortSelect(e.target.value)}
          className="btn btn-sm"
          style={{ fontSize: '13px', cursor: 'pointer' }}
          aria-label="Sort services"
        >
          <option value="default">Default (Category, then Name)</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Services Grid */}
      {loadError ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--steel)', marginBottom: '16px' }}>
            We couldn’t load the services catalog. Please check your connection and try again.
          </p>
          <button
            type="button"
            className="btn btn-sm btn-solid"
            onClick={() => setRetryCount((c) => c + 1)}
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--steel)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading services...
        </div>
      ) : visibleServices.length === 0 && searchQuery.trim() ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--steel)', marginBottom: '16px' }}>No services match “{searchQuery}”{activeCategory ? ` in ${activeCategory}` : ''}. Try a different search, or view everything.</p>
          <button
            type="button"
            className="btn btn-sm btn-solid"
            onClick={() => { setSearchQuery(''); handleCategorySelect(''); }}
          >
            View All Services
          </button>
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
          {visibleServices.map((service) => (
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

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, service)}
                      className={`btn btn-sm ${addedItem === service.id ? 'btn-green' : 'btn-solid'}`}
                      style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}
                    >
                      {addedItem === service.id ? '✓ Requested' : 'Request Now →'}
                    </button>
                  </div>
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
