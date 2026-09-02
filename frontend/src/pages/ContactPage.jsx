// pages/ContactPage.jsx — Contact Halfcon, Inquiry Form & Outlets Map
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-hero">
        <div className="wrap">
          <div className="shop-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Contact Us</strong>
          </div>
          <h1 className="contact-title">Get in Touch with Halfcon</h1>
          <p className="contact-subtitle">
            Need an appliance price quote, custom kitchen design consultation, or emergency artisan dispatch? Our support team is ready 24/7.
          </p>
        </div>
      </div>

      <div className="wrap contact-container">
        <div className="contact-layout">
          {/* Left Form */}
          <div className="contact-form-card">
            <h2 className="card-title">Send Us a Direct Message</h2>
            <p className="card-desc">Fill out this form and a Halfcon supervisor will reach out via WhatsApp or phone within 15 minutes.</p>

            {submitted ? (
              <div className="contact-success-box">
                <div className="success-icon">✅</div>
                <h3>Message Received!</h3>
                <p>Thank you, {formData.name}. Our dispatch supervisor has received your message and will contact you shortly.</p>
                <a
                  href={whatsappLink(`Hi Halfcon, I submitted a contact inquiry: ${formData.message}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-green btn-md"
                  style={{ marginTop: '12px' }}
                >
                  Continue on WhatsApp →
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row-2col">
                  <div>
                    <label className="field-label">Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. Babatunde Adeleke"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      className="input"
                      required
                      placeholder="e.g. 0813 732 1877"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div>
                    <label className="field-label">Email Address</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="e.g. adeleke@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label">Subject Category *</label>
                    <select
                      className="input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Modular Kitchen Quote">Modular Kitchen Quote</option>
                      <option value="Solar & Inverter Setup">Solar &amp; Inverter Setup</option>
                      <option value="Artisan Dispatch">Artisan Dispatch</option>
                      <option value="Product Bulk Purchase">Product Bulk Purchase</option>
                      <option value="Warranty / Escrow Support">Warranty / Escrow Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label">Your Message / Project Details *</label>
                  <textarea
                    className="input"
                    required
                    rows="4"
                    placeholder="Tell us about the appliance you need or the site dimensions for inspection..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-solid btn-lg" style={{ background: '#EA580C', color: '#fff' }}>
                  Send Inquiry Message →
                </button>
              </form>
            )}
          </div>

          {/* Right Direct Outlets Information */}
          <aside className="contact-info-col">
            <div className="info-card">
              <h3 className="info-title">📍 Physical Outlets &amp; Hubs</h3>

              <div className="outlet-box">
                <span className="outlet-tag">Main Warehouse &amp; Hub</span>
                <h4>Ikorodu Central Outlet</h4>
                <p>{CONTACTS.addressIkorodu}</p>
                <div className="outlet-times">Mon - Sat: 8:00 AM – 6:30 PM</div>
                <a href="tel:+2348137321877" className="outlet-phone">📞 +234 813 732 1877</a>
              </div>

              <div className="outlet-box">
                <span className="outlet-tag blue">Commercial Electronics Center</span>
                <h4>Alaba International Showroom</h4>
                <p>{CONTACTS.addressAlaba}</p>
                <div className="outlet-times">Mon - Sat: 8:30 AM – 6:00 PM</div>
                <a href="tel:+2347041003623" className="outlet-phone">📞 +234 704 100 3623</a>
              </div>

              <div className="quick-contact-strip">
                <div className="qc-item">
                  <strong>Email:</strong>
                  <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
                </div>
                <div className="qc-item">
                  <strong>Direct WhatsApp:</strong>
                  <a href={whatsappLink('Hi Halfcon, I am contacting you from the website')} target="_blank" rel="noopener noreferrer">
                    Chat with Dispatch Supervisor
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
