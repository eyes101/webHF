// pages/AboutPage.jsx — About Halfcon, Mission, Outlets & Standards
import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero Header */}
      <div className="about-hero">
        <div className="wrap">
          <div className="about-badge">ABOUT HALFCON NIGERIA</div>
          <h1 className="about-title">Delivering Uncompromising Quality in Property Maintenance &amp; Appliances</h1>
          <p className="about-subtitle">
            From luxury modular kitchens and hybrid solar power systems to vetted Nigerian artisans and commercial property care.
          </p>
        </div>
      </div>

      {/* Stats Counter Strip */}
      <div className="about-stats-bar">
        <div className="wrap about-stats-grid">
          <div className="stat-card">
            <span className="stat-num">10,000+</span>
            <span className="stat-label">Happy Clients &amp; Residences</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">500+</span>
            <span className="stat-label">Verified OEM Appliances in Stock</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">250+</span>
            <span className="stat-label">Vetted Artisans &amp; Technicians</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">100%</span>
            <span className="stat-label">Escrow &amp; Warranty Protection</span>
          </div>
        </div>
      </div>

      {/* Main Story & Values Section */}
      <div className="wrap about-main-content">
        <div className="about-grid-2col">
          <div>
            <div className="section-eyebrow">OUR CORE MISSION</div>
            <h2 className="section-heading">Redefining Property Care &amp; Electronics Retail Across Nigeria</h2>
            <p className="body-text">
              Halfcon was founded to solve two major challenges facing Nigerian homeowners, property managers, and businesses: 
              the rampant prevalence of counterfeit electronics/appliances, and the lack of accountability and standardization among local artisans.
            </p>
            <p className="body-text">
              By pairing direct OEM manufacturing partnerships with an escrow-protected artisan service model, 
              Halfcon ensures you receive 100% genuine products with warranty, while technicians are paid only after you inspect and sign off on completed work.
            </p>

            <div className="pillars-list">
              <div className="pillar-item">
                <div className="pillar-icon">🛡️</div>
                <div>
                  <h4>100% Escrow Protection</h4>
                  <p>Your service funds are held securely until our supervisor verifies the job meets engineering specifications.</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">⚡</div>
                <div>
                  <h4>Direct OEM Outlets in Lagos</h4>
                  <p>Physical warehouses in Ikorodu and Alaba International Market where all units are tested on live benches.</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">🍳</div>
                <div>
                  <h4>Architectural Modular Kitchens</h4>
                  <p>In-house 3D design, marine HDF fabrication, and seamless built-in appliances integration.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-media-col">
            <div className="about-image-card">
              <img src="/kitchens/kitchen-1.webp" alt="Halfcon Modular Kitchen" />
              <div className="img-overlay-caption">
                <strong>Showroom Quality Guaranteed</strong>
                <span>Calacatta Quartz Waterfall Kitchen — Lekki Project</span>
              </div>
            </div>

            <div className="about-branches-box">
              <h3>📍 Physical Locations &amp; Warehouses</h3>
              <div className="branch-row">
                <strong>Ikorodu Central Hub:</strong>
                <p>{CONTACTS.addressIkorodu}</p>
              </div>
              <div className="branch-row">
                <strong>Alaba Int'l Electronics Showroom:</strong>
                <p>{CONTACTS.addressAlaba}</p>
              </div>
              <div className="branch-cta-row">
                <a href={`tel:${CONTACTS.whatsappDisplay}`} className="btn btn-solid btn-sm">Call Hotline</a>
                <a href={whatsappLink('Hi Halfcon, I want to inquire about your services')} target="_blank" rel="noopener noreferrer" className="btn btn-green btn-sm">Chat on WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
