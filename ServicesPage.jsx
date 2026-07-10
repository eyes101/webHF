// pages/ServicesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.services.list(category)
      .then((res) => setServices(res.services))
      .finally(() => setLoading(false));
  }, [category]);

  const categories = [...new Set(services.map((s) => s.category))];

  const formatPrice = (cents) => formatNaira(cents);

  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '42px', fontFamily: "'Big Shoulders Display', sans-serif", textTransform: 'uppercase' }}>
        Services catalog
      </h1>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${!category ? 'btn-solid' : ''}`}
          onClick={() => setCategory('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn ${category === cat ? 'btn-solid' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {services.map((service) => (
            <Link key={service.id} to={`/services/${service.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#C2491D'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#D8D3C6'}>
                <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  {service.name}
                </div>
                <div style={{ fontSize: '13px', color: '#5C6B73', marginBottom: '12px' }}>
                  {service.description}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 600 }}>
                  {formatPrice(service.price_cents)}
                  <span style={{ fontSize: '11px', color: '#5C6B73', marginLeft: '4px' }}>
                    {service.unit}
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
