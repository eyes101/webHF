// pages/ArtisansPage.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CONTACTS, whatsappLink } from '../config/contacts';
import ArtisanHireNegotiationModal from '../components/ArtisanHireNegotiationModal';

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [trade, setTrade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [negotiatePillar, setNegotiatePillar] = useState(null);

  // Fetch full list initially to populate all unique trades
  useEffect(() => {
    api.artisans.list()
      .then((res) => {
        const trades = [...new Set((res.artisans || []).map((a) => a.trade).filter(Boolean))];
        setAllTrades(trades);
      })
      .catch((err) => console.error('Failed to load artisan trades:', err));
  }, []);

  // Fetch filtered list by trade
  useEffect(() => {
    setLoading(true);
    api.artisans.list(trade)
      .then((res) => setArtisans(res.artisans || []))
      .catch((err) => console.error('Failed to load artisans:', err))
      .finally(() => setLoading(false));
  }, [trade]);

  const filteredArtisans = artisans.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (a.name || '').toLowerCase().includes(q);
    const tradeMatch = (a.trade || '').toLowerCase().includes(q);
    const servicesMatch = (a.services_offered || []).some((s) => s.toLowerCase().includes(q));
    return nameMatch || tradeMatch || servicesMatch;
  });

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: '720px', marginBottom: '36px' }}>
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
          Verified Personnel &middot; P2P Escrow
        </div>
        <h1
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: '44px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            color: 'var(--ink)',
            marginBottom: '12px',
          }}
        >
          Artisan Directory &amp; P2P Hiring
        </h1>
        <p style={{ color: 'var(--steel)', fontSize: '16px', lineHeight: 1.6 }}>
          Hire verified Nigerian tradespeople with mathematical task negotiation and escrow protection. Your funds are released strictly after you inspect and sign off on completed work.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        {/* Trade Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${!trade ? 'btn-solid' : ''}`}
            onClick={() => setTrade('')}
          >
            All Trades
          </button>
          {allTrades.map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${trade === t ? 'btn-solid' : ''}`}
              onClick={() => setTrade(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 14px', fontSize: '13px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--steel)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading verified artisans...
        </div>
      ) : filteredArtisans.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--steel)', marginBottom: '16px' }}>No artisans found matching your criteria.</p>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => { setTrade(''); setSearchQuery(''); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredArtisans.map((a) => (
            <div
              key={a.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                transition: 'all 0.2s ease',
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'var(--ink)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                      }}
                    >
                      {a.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--ink)' }}>{a.name}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rust)' }}>{a.trade}</div>
                    </div>
                  </div>

                  <span className="badge badge-green" style={{ fontSize: '10px' }}>
                    ✓ Verified
                  </span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--steel)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Skills &amp; Services
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(a.services_offered || []).map((serv, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'var(--paper-dim)',
                          border: '1px solid var(--line)',
                          color: 'var(--ink)',
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 500,
                        }}
                      >
                        {serv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-solid"
                  style={{ width: '100%', background: '#0F1B4C', borderColor: '#0F1B4C' }}
                  onClick={() => setNegotiatePillar(a.trade)}
                >
                  🤝 Hire &amp; Negotiate Task (Escrow)
                </button>

                <a
                  href={whatsappLink(`Hi Halfcon, I would like to book verified artisan ${a.name} (${a.trade}) for a project.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ width: '100%', fontSize: '13px', color: 'var(--green)' }}
                >
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
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

      {/* Direct Contact Notice */}
      <div className="card" style={{ marginTop: '48px', background: 'var(--paper-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Need a specialized trade or bulk commercial crew?</div>
          <div style={{ fontSize: '13px', color: 'var(--steel)' }}>Reach our operations supervisor directly to coordinate large-scale property maintenance.</div>
        </div>
        <a href={`mailto:${CONTACTS.email}`} className="btn btn-sm btn-dark">
          Contact Operations Team
        </a>
      </div>
    </div>
  );
}
