import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CONTACTS, whatsappLink } from '../config/contacts';

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState([]);
  const [trade, setTrade] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.artisans.list(trade).then((res) => setArtisans(res.artisans)).finally(() => setLoading(false));
  }, [trade]);

  const trades = [...new Set(artisans.map((a) => a.trade))];

  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1
        style={{
          marginBottom: '12px',
          fontSize: '42px',
          fontFamily: "'Big Shoulders Display', sans-serif",
          textTransform: 'uppercase',
        }}
      >
        Artisans
      </h1>
      <p style={{ color: 'var(--steel)', marginBottom: '30px', maxWidth: '600px' }}>
        Vetted tradespeople available for house care and property work. Contact us to book any of them for a job.
      </p>

      {trades.length > 1 && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${!trade ? 'btn-solid' : ''}`} onClick={() => setTrade('')}>
            All trades
          </button>
          {trades.map((t) => (
            <button key={t} className={`btn btn-sm ${trade === t ? 'btn-solid' : ''}`} onClick={() => setTrade(t)}>
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : artisans.length === 0 ? (
        <div style={{ color: 'var(--steel)' }}>No artisans listed yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ink)' }}>
                <th style={{ textAlign: 'left', padding: '12px 10px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 10px' }}>Trade</th>
                <th style={{ textAlign: 'left', padding: '12px 10px' }}>Services offered</th>
                <th style={{ textAlign: 'left', padding: '12px 10px' }}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {artisans.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>{a.name}</td>
                  <td style={{ padding: '12px 10px' }}>{a.trade}</td>
                  <td style={{ padding: '12px 10px', fontSize: '13px', color: 'var(--steel)' }}>
                    {(a.services_offered || []).join(', ')}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <a
                      href={whatsappLink(`Hi Halfcon, I'd like to book ${a.name} (${a.trade}) for a job.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                    >
                      Book via WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '30px', fontSize: '13px', color: 'var(--steel)' }}>
        Don't see the trade you need? Reach us directly at{' '}
        <a href={`mailto:${CONTACTS.email}`} style={{ color: 'var(--rust)' }}>
          {CONTACTS.email}
        </a>
        .
      </p>
    </div>
  );
}
