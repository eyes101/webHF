// components/AtoZApplianceDropdown.jsx — Interactive A-Z Appliances & Showroom Directory Modal/Drawer
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ATOZ_APPLIANCES } from '../data/kitchenDirectory';
import { whatsappLink } from '../config/contacts';
import './AtoZApplianceDropdown.css';

export default function AtoZApplianceDropdown({ isOpen, onClose, initialTab = 'atoz' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Available unique letters in dataset
  const letters = useMemo(() => {
    const set = new Set(ATOZ_APPLIANCES.map((item) => item.letter));
    return ['ALL', ...Array.from(set).sort()];
  }, []);

  // Filtered list based on search and selected letter
  const filteredAppliances = useMemo(() => {
    return ATOZ_APPLIANCES.filter((item) => {
      const matchesLetter = selectedLetter === 'ALL' || item.letter === selectedLetter;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLetter && matchesSearch;
    });
  }, [searchQuery, selectedLetter]);

  if (!isOpen) return null;

  return (
    <div className="atoz-modal-overlay" onClick={onClose}>
      <div className="atoz-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="atoz-modal-header">
          <div className="atoz-header-left">
            <div className="atoz-eyebrow">Halfcon Official Directory</div>
            <h2 className="atoz-title">Kitchen Appliances, Electronics &amp; Stores Guide</h2>
          </div>

          <div className="atoz-header-tabs">
            <button
              type="button"
              className={`atoz-tab-btn ${activeTab === 'atoz' ? 'active' : ''}`}
              onClick={() => setActiveTab('atoz')}
            >
              📖 A-Z Appliance Catalog ({ATOZ_APPLIANCES.length})
            </button>
            <button
              type="button"
              className={`atoz-tab-btn ${activeTab === 'kitchens' ? 'active' : ''}`}
              onClick={() => setActiveTab('kitchens')}
            >
              🍳 Modular Kitchens Suite
            </button>
            <button
              type="button"
              className={`atoz-tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
              onClick={() => setActiveTab('stores')}
            >
              📍 Ikorodu &amp; Alaba Stores
            </button>
            <button
              type="button"
              className={`atoz-tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
              onClick={() => setActiveTab('dispatch')}
            >
              ⚡ Same-Day Dispatch &amp; Warranty
            </button>
          </div>

          <button
            type="button"
            className="atoz-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab 1: A-Z Appliances Directory */}
        {activeTab === 'atoz' && (
          <div className="atoz-body-tab">
            {/* Search & Alphabet Filter Toolbar */}
            <div className="atoz-toolbar">
              <div className="atoz-search-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search appliance (e.g. Air fryer, Oven, Blender, Extractor, Refrigerator)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="atoz-search-input"
                  autoFocus
                />
                {searchQuery && (
                  <button type="button" className="atoz-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>

              {/* Letter Bar */}
              <div className="atoz-letters-bar">
                {letters.map((ltr) => (
                  <button
                    key={ltr}
                    type="button"
                    className={`letter-pill ${selectedLetter === ltr ? 'active' : ''}`}
                    onClick={() => setSelectedLetter(ltr)}
                  >
                    {ltr}
                  </button>
                ))}
              </div>
            </div>

            {/* Appliances Grid */}
            <div className="atoz-items-scroll-wrap">
              {filteredAppliances.length === 0 ? (
                <div className="atoz-empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No appliance found matching "{searchQuery}"</h3>
                  <p>Try searching another keyword or request a custom order via our WhatsApp desk.</p>
                  <a
                    href={whatsappLink(`Hi Halfcon, I am looking for a kitchen appliance: ${searchQuery}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-solid btn-sm"
                  >
                    Request on WhatsApp →
                  </a>
                </div>
              ) : (
                <div className="atoz-items-grid">
                  {filteredAppliances.map((appliance, idx) => (
                    <div key={idx} className="atoz-appliance-card">
                      <div className="appliance-letter-tag">{appliance.letter}</div>
                      <div className="appliance-details">
                        <div className="appliance-cat-row">
                          <span className="appliance-category">{appliance.category}</span>
                          {appliance.tag && (
                            <span className="appliance-badge">{appliance.tag}</span>
                          )}
                        </div>
                        <h4 className="appliance-name">{appliance.name}</h4>
                        <div className="appliance-price-guide">
                          Price Est: <strong>{appliance.price_range}</strong>
                        </div>
                      </div>
                      <div className="appliance-actions">
                        <a
                          href={whatsappLink(`Hi Halfcon, I would like to purchase / request price for: ${appliance.name} (Ref: A-Z Directory).`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="atoz-wa-btn"
                          title="Instant Order on WhatsApp"
                        >
                          <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
                          Request Quote
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Modular Kitchens Feature */}
        {activeTab === 'kitchens' && (
          <div className="atoz-body-tab atoz-kitchen-banner-view">
            <div className="kitchen-hero-banner">
              <div className="kitchen-banner-content">
                <span className="gold-pill">✨ New Luxury Showcase</span>
                <h3>Custom Modular Kitchens &amp; Built-In Appliances</h3>
                <p>
                  Explore real completed projects featuring waterfall marble islands, integrated LED ambient channeling, 
                  smoked glass wall cabinetry, and built-in convection appliance towers fabricated across Lagos.
                </p>
                <div className="kitchen-cta-row">
                  <Link
                    to="/kitchens"
                    onClick={onClose}
                    className="btn btn-solid btn-lg"
                  >
                    Open Full Kitchen Landing Page &amp; Gallery →
                  </Link>
                  <a
                    href={whatsappLink(`Hi Halfcon, I would like to book a free site measurement inspection for a Modular Kitchen design.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green btn-lg"
                  >
                    Book Free Kitchen Measurement
                  </a>
                </div>
              </div>
              <div className="kitchen-banner-previews">
                <img src="/kitchens/kitchen-1.webp" alt="Modular Island Kitchen" className="k-mini-img" />
                <img src="/kitchens/kitchen-3.jpg" alt="Black Glass Kitchen" className="k-mini-img" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Ikorodu & Alaba Showrooms */}
        {activeTab === 'stores' && (
          <div className="atoz-body-tab atoz-stores-view">
            <div className="stores-grid">
              <div className="store-branch-card">
                <div className="store-header">
                  <span className="store-badge">Main Dispatch Outlet</span>
                  <h3>📍 Ikorodu Main Hub</h3>
                </div>
                <div className="store-address-box">
                  <strong>No. 6, Adebisi Close, off Believer's Road</strong>
                  <p>Isawo Road, Agric, Ikorodu, Lagos State, Nigeria.</p>
                </div>
                <div className="store-features-list">
                  <div>✓ Appliance Showroom &amp; Live Testing Bench</div>
                  <div>✓ Modular Kitchen Material &amp; HDF Acrylic Samples</div>
                  <div>✓ Solar Inverter &amp; Lithium Battery Dispatch Center</div>
                  <div>✓ Open Mon - Sat: 8:00 AM - 6:30 PM</div>
                </div>
                <div className="store-actions">
                  <a href="tel:+2348137321877" className="btn btn-solid btn-sm">📞 Call +234 813 732 1877</a>
                  <a
                    href={whatsappLink(`Hello Halfcon Ikorodu, I would like to visit the showroom or order pickup.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green btn-sm"
                  >
                    WhatsApp Ikorodu Hub
                  </a>
                </div>
              </div>

              <div className="store-branch-card">
                <div className="store-header">
                  <span className="store-badge blue">Commercial &amp; Electronics Hub</span>
                  <h3>📍 Alaba Int'l Electronics Center</h3>
                </div>
                <div className="store-address-box">
                  <strong>Shop H106B, Alaba Int'l Market</strong>
                  <p>Ojo, Lagos State, Nigeria.</p>
                </div>
                <div className="store-features-list">
                  <div>✓ Wholesale &amp; Retail Electronics &amp; Refrigeration</div>
                  <div>✓ Built-in Cooker Hobs, Microwave &amp; Oven Inventory</div>
                  <div>✓ Direct Import Grade A 100% Genuine Warranties</div>
                  <div>✓ Open Mon - Sat: 8:30 AM - 6:00 PM</div>
                </div>
                <div className="store-actions">
                  <a href="tel:+2347041003623" className="btn btn-solid btn-sm">📞 Call +234 704 100 3623</a>
                  <a
                    href={whatsappLink(`Hello Halfcon Alaba, I would like to inquire about appliances available at Shop H106B.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green btn-sm"
                  >
                    WhatsApp Alaba Store
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Dispatch & Warranty Policy */}
        {activeTab === 'dispatch' && (
          <div className="atoz-body-tab atoz-warranty-view">
            <div className="warranty-grid">
              <div className="warranty-box">
                <div className="w-icon">⚡</div>
                <h4>Same-Day Dispatch in Lagos</h4>
                <p>Orders confirmed before 2:00 PM are dispatched same-day via our verified logistics partners across Lagos Island, Mainland, Lekki, Ikeja, and Ikorodu.</p>
              </div>

              <div className="warranty-box">
                <div className="w-icon">🛡️</div>
                <h4>100% Genuine Appliance Guarantee</h4>
                <p>Every product is sourced directly from OEM certified manufacturers with genuine tamper-proof seals, English manuals, and full warranty cards.</p>
              </div>

              <div className="warranty-box">
                <div className="w-icon">🔒</div>
                <h4>Escrow Buyer Protection</h4>
                <p>Payments for installation services and artisan tasks are held in escrow until you inspect and approve the completed job on-site.</p>
              </div>

              <div className="warranty-box">
                <div className="w-icon">🔄</div>
                <h4>7-Day Free Replacement</h4>
                <p>In the unlikely event of any manufacturer defect, enjoy an instant swap or direct technician replacement with zero hassle.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="atoz-modal-footer">
          <div className="footer-support-line">
            Need urgent assistance? Hotline: <a href="tel:+2348137321877"><strong>+234 813 732 1877</strong></a> &middot; WhatsApp: <strong>0704 100 3623</strong>
          </div>
          <button type="button" className="btn btn-dark btn-sm" onClick={onClose}>
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
