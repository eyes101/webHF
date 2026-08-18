// pages/ServicesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1
        style={{
          marginBottom: '12px',
          fontSize: '42px',
          fontFamily: "'Big Shoulders Display', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        Services Catalog
      </h1>
      <p style={{ color: 'var(--steel)', marginBottom: '32px', maxWidth: '600px', fontSize: '15px' }}>
        Explore our comprehensive nationwide logistics, special duties, and property maintenance solutions.
      </p>

      {/* Category filter pills */}
      <div style={{ marginBottom: '36px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${!activeCategory ? 'btn-solid' : ''}`}
          onClick={() => handleCategorySelect('')}
        >
          All Services
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

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--steel)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div style={{ padding: '40px', background: 'var(--paper-dim)', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: 'var(--steel)' }}>No services found in this category.</p>
          <button
            className="btn btn-sm"
            style={{ marginTop: '16px' }}
            onClick={() => handleCategorySelect('')}
          >
            View All Services
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
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
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  borderRadius: '8px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--rust)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 27, 76, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
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
                    {service.category || 'General'}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Big Shoulders Display', sans-serif",
                      fontSize: '22px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      color: 'var(--ink)',
                    }}
                  >
                    {service.name}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--steel)', marginBottom: '16px', lineHeight: 1.4 }}>
                    {service.description}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--line)',
                    paddingTop: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                    {formatNaira(service.price_cents)}
                    <span style={{ fontSize: '11px', color: 'var(--steel)', marginLeft: '4px', fontWeight: 400 }}>
                      {service.unit}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rust)' }}>
                    Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
