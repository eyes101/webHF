// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';
import './HomePage.css';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.services.list()
      .then((res) => {
        const unique = {};
        res.services.forEach((s) => {
          if (!unique[s.category]) unique[s.category] = s;
        });
        setServices(Object.values(unique));
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (cents) => formatNaira(cents);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-content">
            <div className="hero-eyebrow">DISPATCH READY · ALL REGIONS</div>
            <h1 className="display">Work that<br/>gets <em>handled.</em></h1>
            <p className="hero-sub">Special duties, property development, relocation strategy, and logistics — booked, tracked, and paid for in one place. No back-and-forth, no guesswork.</p>
            <div className="hero-ctas">
              <Link to="/services" className="btn btn-solid">Browse services →</Link>
              <a href="#manifest" className="btn">How it works</a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stats-row">
              <div className="hero-stat">
                <div className="num">05</div>
                <div className="lbl">SERVICE LINES</div>
              </div>
              <div className="hero-stat">
                <div className="num">24/7</div>
                <div className="lbl">DISPATCH WINDOW</div>
              </div>
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat">
                <div className="num">100%</div>
                <div className="lbl">TRACKED ONLINE</div>
              </div>
              <div className="hero-stat">
                <div className="num">∞</div>
                <div className="lbl">REGIONS SERVED</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="manifest" id="manifest">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display">Operations manifest</h2>
            <div className="meta mono">UPDATED LIVE · CLICK A LINE TO BOOK</div>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading services...</div>
          ) : (
            <table className="manifest-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Rate</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="manifest-row" onClick={() => window.location.href = `/services/${s.slug}`}>
                    <td className="m-code">{s.category}</td>
                    <td>
                      <div className="m-name">{s.name}</div>
                      <div className="m-desc">{s.description}</div>
                    </td>
                    <td className="m-price">
                      {formatPrice(s.price_cents)}
                      <span className="m-unit">{s.unit}</span>
                    </td>
                    <td className="m-arrow">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="flow">
        <div className="wrap">
          <div className="section-head" style={{ borderColor: '#F5F3EE' }}>
            <h2 className="display">How it works</h2>
            <div className="meta mono">FROM BOOKING TO COMPLETION</div>
          </div>
          <div className="flow-steps">
            {[
              { num: '01', title: 'Select', desc: 'Pick a service line, set quantity or scope, and add your job details.' },
              { num: '02', title: 'Pay', desc: 'Checkout online. Your order is confirmed upon payment.' },
              { num: '03', title: 'Track', desc: 'Watch as our team picks it up, schedules, and works the job.' },
              { num: '04', title: 'Close', desc: 'Message the team directly and track until completion.' },
            ].map((s) => (
              <div key={s.num} className="flow-step">
                <div className="flow-num mono">{s.num} / {s.title.toUpperCase()}</div>
                <h3 className="display">{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <div className="wrap contact-cta-inner">
          <div>
            <h2 className="display">Need this sorted today?</h2>
            <p className="contact-cta-sub">Message us directly on WhatsApp — fastest way to reach the team.</p>
          </div>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-solid btn-lg">
            Chat on WhatsApp →
          </a>
        </div>
      </section>
    </>
  );
}
