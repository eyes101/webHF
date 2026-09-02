// pages/FAQPage.jsx — Frequently Asked Questions
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { whatsappLink } from '../config/contacts';
import './FAQPage.css';

const FAQS = [
  {
    q: 'How does Halfcon 100% Escrow Protection work?',
    a: 'When you book a service or order an appliance installation, your funds are safely held in escrow. The artisan or technician is only paid after our engineering supervisor inspects the site and you personally sign off that the work meets all standards.',
  },
  {
    q: 'Are all appliances sold by Halfcon 100% original and under warranty?',
    a: 'Yes. Every unit is sourced directly from OEM manufacturers and tested on our live test benches at our Ikorodu and Alaba International showrooms. All products include official manufacturer warranty cards and 7-day instant replacement support.',
  },
  {
    q: 'What are the delivery timelines for Lagos and nationwide?',
    a: 'Orders confirmed before 2:00 PM are dispatched same-day across Lagos (Island and Mainland). Interstate deliveries to Abuja, Port Harcourt, Ibadan, and other states take 2 to 4 working days via secure logistics partners.',
  },
  {
    q: 'How do I book a free site inspection for Modular Kitchens or Solar Setup?',
    a: 'You can use our online Free Site Visit booking form or WhatsApp our supervisor directly. A certified technician will visit your location with laser dimensioning tools and material swatches at zero charge.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept secure instant payments via Paystack, Flutterwave, Direct Bank Transfer to our corporate account, Debit/Credit Cards (Mastercard, Visa, Verve), and Escrow on site inspection.',
  },
  {
    q: 'What is the 6-Month Halfcon Warranty on repairs and installations?',
    a: 'All electrical rewiring, plumbing setups, solar installations, and modular cabinetry built by Halfcon come with a guaranteed 6-month free diagnostic and remediation warranty.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <div className="wrap">
          <div className="shop-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>FAQ</strong>
          </div>
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">Everything you need to know about shopping, escrow protection, deliveries, and warranties with Halfcon.</p>
        </div>
      </div>

      <div className="wrap faq-container">
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${openIdx === i ? 'open' : ''}`}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span className="faq-icon">{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <div className="faq-answer-panel">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-help-box">
          <h3>Still have questions?</h3>
          <p>Our customer support team is available 24/7 on WhatsApp and phone.</p>
          <a
            href={whatsappLink('Hi Halfcon, I have a question about your services and appliances')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-green btn-md"
          >
            Chat with Support on WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
}
