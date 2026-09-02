import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { CONTACTS, whatsappLink } from '../config/contacts';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_ITEMS } from '../data/products';
import AtoZApplianceDropdown from '../components/AtoZApplianceDropdown';
import './HomePage.css';

// Cost Estimator Project Types & Scale Options
const ESTIMATOR_PROJECTS = [
  {
    id: 'solar',
    title: 'Solar & Inverter Installation',
    icon: '🔋',
    options: [
      { label: '1KVA Essential (Lights, TV, Fans)', originalCents: 56000000, priceCents: 45000000 },
      { label: '3.5KVA Home Setup (Fridge + TV + All Lights)', originalCents: 118000000, priceCents: 95000000 },
      { label: '5KVA Full Residence (1 Inverter AC + Fridge + Home)', originalCents: 185000000, priceCents: 148000000 },
      { label: '10KVA Commercial / Duplex Heavy Setup', originalCents: 400000000, priceCents: 320000000 },
    ],
  },
  {
    id: 'rewiring',
    title: 'Electrical Rewiring & Surge Protection',
    icon: '⚡',
    options: [
      { label: '1-Bedroom / Studio Apartment', originalCents: 22500000, priceCents: 18000000 },
      { label: '2-Bedroom Apartment / Flat', originalCents: 35000000, priceCents: 28000000 },
      { label: '3-Bedroom Flat / Office Unit', originalCents: 47500000, priceCents: 38000000 },
      { label: '4-5 Bedroom Duplex / Commercial Building', originalCents: 77500000, priceCents: 62000000 },
    ],
  },
  {
    id: 'kitchen',
    title: 'Modular Kitchen Cabinetry & LED Fit-Out',
    icon: '🍳',
    options: [
      { label: 'Compact Linear Kitchen (8 Feet)', originalCents: 65000000, priceCents: 52000000 },
      { label: 'L-Shaped Family Kitchen (12 Feet)', originalCents: 106000000, priceCents: 85000000 },
      { label: 'Luxury Island Kitchen (16+ Feet + Quartz Island)', originalCents: 206000000, priceCents: 165000000 },
    ],
  },
  {
    id: 'cleaning',
    title: 'Deep Floor Scrubbing & Tile Polish',
    icon: '✨',
    options: [
      { label: 'Standard Flat / Office (Up to 100 sqm)', originalCents: 12000000, priceCents: 9600000 },
      { label: 'Large Residence / Hall (Up to 250 sqm)', originalCents: 23800000, priceCents: 19000000 },
      { label: 'Commercial Compound (Up to 500 sqm)', originalCents: 43800000, priceCents: 35000000 },
    ],
  },
  {
    id: 'blinds',
    title: 'Luxury Drapes & Motorized Window Blinds',
    icon: '🪟',
    options: [
      { label: '2 Main Windows (Living Room)', originalCents: 16000000, priceCents: 12800000 },
      { label: '5 Windows (Full 2-Bed Flat)', originalCents: 36200000, priceCents: 29000000 },
      { label: '10+ Windows (Full House / Duplex)', originalCents: 68800000, priceCents: 55000000 },
    ],
  },
];

// Before & After Project Social Proof
const BEFORE_AFTER_PROJECTS = [
  {
    title: 'Lekki Phase 1 Luxury Residence',
    category: 'Modular Kitchen Fit-Out',
    beforeDesc: 'Outdated dark wooden cabinets with broken drawers.',
    afterDesc: 'High-gloss acrylic modular cabinets, quartz island & warm LED strips.',
    badge: '100% Completed',
    client: 'Mr. & Mrs. Adeleke',
    quote: '"Halfcon delivered beyond expectations. The 3D render was accurate and finish flawless."',
  },
  {
    title: 'Ikeja GRA Corporate Office',
    category: '5KVA Hybrid Solar Inverter System',
    beforeDesc: 'Heavy ₦450k monthly generator diesel bills with constant power cuts.',
    afterDesc: 'Seamless 24/7 solar power transition with 0ms cut-over.',
    badge: 'Verified Commercial',
    client: 'Apex Global Logistics',
    quote: '"We reduced energy costs by 75% in the first month. Excellent technician support."',
  },
  {
    title: 'Victoria Island Penthouse',
    category: 'POP Ceiling & Architectural Lighting',
    beforeDesc: 'Plain concrete ceiling with exposed electrical wiring conduits.',
    afterDesc: 'Geometric POP false ceiling with smart warm & daylight cove lighting.',
    badge: '5-Star Rating',
    client: 'Engr. D. Balogun',
    quote: '"Cleanest tradespeople in Lagos. Arrived on time and cleaned up afterwards."',
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalActiveImage, setModalActiveImage] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [addedToast, setAddedToast] = useState(null);

  // Estimator State
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [activeOptionIdx, setActiveOptionIdx] = useState(1);

  // Free Inspection Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspForm, setInspForm] = useState({ name: '', phone: '', address: '', projectType: 'Solar & Inverter Setup', date: '' });
  const [inspSubmitted, setInspSubmitted] = useState(false);
  const [atozOpen, setAtozOpen] = useState(false);
  const [atozTab, setAtozTab] = useState('atoz');

  const { addItem } = useCart();
  const navigate = useNavigate();

  const currentProject = ESTIMATOR_PROJECTS[activeProjectIdx];
  const currentOption = currentProject.options[Math.min(activeOptionIdx, currentProject.options.length - 1)];

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/orders/${trackingNumber.trim()}`);
    } else {
      navigate('/orders');
    }
  };

  const handleAddToCart = (e, item) => {
    e?.stopPropagation();
    addItem(
      {
        id: item.id,
        name: item.name,
        category: item.category,
        price_cents: item.price_cents,
        unit: item.unit,
        description: item.desc,
      },
      1
    );
    setAddedToast(item.name);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleBookEstimate = () => {
    addItem(
      {
        id: `est-${currentProject.id}-${activeOptionIdx}`,
        name: `${currentProject.title} — ${currentOption.label}`,
        category: 'Project Quote',
        price_cents: currentOption.priceCents,
        unit: 'Project Scope',
        description: `Instant online quotation locked with 20% discount. Free site inspection included.`,
      },
      1
    );
    navigate('/checkout');
  };

  const handleInspectionSubmit = (e) => {
    e.preventDefault();
    setInspSubmitted(true);
    setTimeout(() => {
      window.open(
        whatsappLink(
          `Hello Halfcon, I would like to book a Free Site Inspection:\nName: ${inspForm.name}\nPhone: ${inspForm.phone}\nProject: ${inspForm.projectType}\nAddress: ${inspForm.address}\nPreferred Date: ${inspForm.date}`
        ),
        '_blank'
      );
      setInspectionModalOpen(false);
      setInspSubmitted(false);
      setInspForm({ name: '', phone: '', address: '', projectType: 'Solar & Inverter Setup', date: '' });
    }, 1500);
  };

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="home">
      {/* ===== HERO SECTION WITH HALFCON BANNER BACKGROUND ===== */}
      <section className="hero-section">
        <div className="hero-bg-overlay" />

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot">
                <span className="hero-badge-ping" />
              </span>
              House Care &middot; Home &amp; Offices Maintenance &middot; Electrical Appliances
            </div>

            <h1 className="hero-title">
              Home Care &amp; Property Maintenance with<br />
              <span className="hero-title-accent">Electrical &amp; Electronics</span> Sales.
            </h1>

            <p className="hero-desc">
              From commercial facade cleaning, custom drapes &amp; modular kitchens to solar inverter installations and vetted artisans across Nigeria.
            </p>

            <div className="hero-ctas">
              <a href="#marketplace" className="cta-primary">
                Browse 20% Off Catalog
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <button
                type="button"
                className="cta-secondary"
                onClick={() => setInspectionModalOpen(true)}
              >
                📅 Book Free Site Visit
              </button>
            </div>

            {/* Quick Order Tracking */}
            <form onSubmit={handleTrackSubmit} className="hero-track-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--steel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Enter Order ID to track (e.g. ord_12345)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="hero-track-input"
              />
              <button type="submit" className="hero-track-btn">
                Track Order
              </button>
            </form>

            <div className="hero-trust">
              <button
                type="button"
                className="trust-item trust-item-btn"
                onClick={() => { setAtozTab('stores'); setAtozOpen(true); }}
                title="Click to view Ikorodu & Alaba Outlets"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>📍 Ikorodu &amp; Alaba Stores ▾</span>
              </button>
              <button
                type="button"
                className="trust-item trust-item-btn"
                onClick={() => { setAtozTab('atoz'); setAtozOpen(true); }}
                title="Click to browse A-Z Kitchen Appliances & Electronics"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>🛡️ 100% Genuine Appliances (A-Z Directory) ▾</span>
              </button>
              <button
                type="button"
                className="trust-item trust-item-btn"
                onClick={() => { setAtozTab('dispatch'); setAtozOpen(true); }}
                title="Click to view Same-Day Dispatch & Warranty terms"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>⚡ Same-Day Dispatch &amp; Escrow ▾</span>
              </button>
            </div>
          </div>

          {/* Hero Highlights Card */}
          <div className="hero-media">
            <div className="hero-glass-card">
              <div className="glass-card-header">
                <span className="glass-chip">⚡ 20% PROMO ACTIVE</span>
                <span className="glass-code">CODE: HALFCON20</span>
              </div>
              <h3 className="glass-title">Direct Outlets &amp; Service Hub</h3>
              
              {/* Quick Link to Modular Kitchens Suite */}
              <Link to="/kitchens" className="glass-kitchen-promo-box">
                <div className="promo-badge-mini">✨ NEW SHOWCASE</div>
                <div className="promo-kitchen-title">Custom Modular Kitchens &amp; Islands →</div>
                <div className="promo-kitchen-desc">Real Marble waterfall islands &amp; built-in appliances gallery</div>
              </Link>

              <div className="glass-locations">
                <div className="glass-loc-item" onClick={() => { setAtozTab('stores'); setAtozOpen(true); }} style={{ cursor: 'pointer' }}>
                  <span className="loc-icon">📍</span>
                  <div>
                    <strong>Ikorodu Warehouse &amp; Hub:</strong>
                    <p>{CONTACTS.addressIkorodu}</p>
                  </div>
                </div>
                <div className="glass-loc-item" onClick={() => { setAtozTab('stores'); setAtozOpen(true); }} style={{ cursor: 'pointer' }}>
                  <span className="loc-icon">📍</span>
                  <div>
                    <strong>Alaba Int'l Showroom:</strong>
                    <p>{CONTACTS.addressAlaba}</p>
                  </div>
                </div>
              </div>
              <div className="glass-footer">
                <div className="glass-hotline">
                  <span>Dispatch Hotline:</span>
                  <a href={`tel:${CONTACTS.whatsappDisplay}`}>{CONTACTS.whatsappDisplay}</a>
                </div>
                <a
                  href={whatsappLink('Hi Halfcon, I would like to inquire about your services and 20% discount offer.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-wa-btn"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST & ESCROW GUARANTEE BAR ===== */}
      <section className="guarantee-section">
        <div className="wrap">
          <div className="guarantee-grid">
            <div className="guarantee-card">
              <div className="guarantee-icon">🛡️</div>
              <div>
                <div className="guarantee-title">100% Escrow Protection</div>
                <div className="guarantee-desc">Technicians are paid only after you inspect and sign off on completed work.</div>
              </div>
            </div>

            <div className="guarantee-card">
              <div className="guarantee-icon">⚡</div>
              <div>
                <div className="guarantee-title">6-Month Warranty</div>
                <div className="guarantee-desc">Guaranteed free diagnostic &amp; remediation on all electrical &amp; plumbing installations.</div>
              </div>
            </div>

            <div className="guarantee-card">
              <div className="guarantee-icon">🚚</div>
              <div>
                <div className="guarantee-title">Same-Day Dispatch</div>
                <div className="guarantee-desc">Rapid deployment from our dedicated Ikorodu and Alaba Market branch networks.</div>
              </div>
            </div>

            <div className="guarantee-card">
              <div className="guarantee-icon">👮‍♂️</div>
              <div>
                <div className="guarantee-title">Vetted Professionals</div>
                <div className="guarantee-desc">100% background-checked, insured, and certified Nigerian technicians.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INSTANT PROJECT COST ESTIMATOR & QUOTE GENERATOR ===== */}
      <section className="estimator-section">
        <div className="wrap">
          <div className="estimator-box">
            <div className="estimator-header">
              <div className="section-eyebrow" style={{ color: '#FBBF24' }}>Instant Cost Calculator</div>
              <h2 className="estimator-title">Get an Instant Project Estimate &amp; Save 20%</h2>
              <p className="estimator-subtitle">
                Select your project type and building size to calculate transparent Naira pricing with free engineer site inspection.
              </p>
            </div>

            <div className="estimator-body">
              {/* Project Type Selector */}
              <div className="estimator-tabs">
                {ESTIMATOR_PROJECTS.map((proj, idx) => (
                  <button
                    key={proj.id}
                    type="button"
                    className={`estimator-tab-btn ${activeProjectIdx === idx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveProjectIdx(idx);
                      setActiveOptionIdx(0);
                    }}
                  >
                    <span>{proj.icon}</span>
                    <span>{proj.title}</span>
                  </button>
                ))}
              </div>

              {/* Scope Options */}
              <div className="estimator-options">
                <div className="options-label">Select Project Scope / Size:</div>
                <div className="options-grid">
                  {currentProject.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      className={`option-btn ${activeOptionIdx === oIdx ? 'selected' : ''}`}
                      onClick={() => setActiveOptionIdx(oIdx)}
                    >
                      <div className="option-label">{opt.label}</div>
                      <div className="option-price">{formatNaira(opt.priceCents)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimate Calculation Result Card */}
              <div className="estimator-result-card">
                <div className="result-left">
                  <div className="result-tag">Estimated Package Total:</div>
                  <div className="result-prices">
                    <span className="result-price-current">{formatNaira(currentOption.priceCents)}</span>
                    <span className="result-price-original">{formatNaira(currentOption.originalCents)}</span>
                    <span className="result-saved-badge">20% Discount Applied</span>
                  </div>
                  <div className="result-note">Includes: Materials, certified labor, site preparation &amp; 6-month warranty.</div>
                </div>

                <div className="result-actions">
                  <button
                    type="button"
                    className="btn btn-solid btn-lg"
                    onClick={handleBookEstimate}
                  >
                    Lock 20% Off &amp; Request Now →
                  </button>

                  <a
                    href={whatsappLink(`Hi Halfcon, I calculated a project estimate on your website for ${currentProject.title} (${currentOption.label}) at ${formatNaira(currentOption.priceCents)}. I would like to proceed.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green btn-lg"
                  >
                    WhatsApp Quote
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== JUMIA-STYLE MARKETPLACE & SERVICE GALLERY (WITH REAL STOCK PHOTOS) ===== */}
      <section id="marketplace" className="marketplace-section">
        <div className="wrap">
          {/* Section Header */}
          <div className="marketplace-header">
            <div>
              <div className="section-eyebrow">Interactive Catalog</div>
              <h2 className="section-title">Explore Halfcon Products &amp; Services</h2>
              <p className="section-desc">Click any product photo for instant specifications, 20% discount pricing, and direct checkout.</p>
            </div>

            {/* Search Input */}
            <div className="marketplace-search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--steel)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search appliances, cleaning, kitchens, drapes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="marketplace-search-input"
              />
            </div>
          </div>

          {/* Category Tabs (Jumia Style) + A-Z Button */}
          <div className="category-scroll-tabs">
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="tab-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
            <button
              type="button"
              className="category-tab-btn atoz-special-tab-btn"
              onClick={() => { setAtozTab('atoz'); setAtozOpen(true); }}
            >
              <span className="tab-icon">📖</span>
              <span>A-Z Appliances Directory</span>
            </button>
            <Link
              to="/kitchens"
              className="category-tab-btn kitchen-special-tab-btn"
            >
              <span className="tab-icon">🍳</span>
              <span>Modular Kitchens Suite →</span>
            </Link>
          </div>

          {/* Dedicated Modular Kitchens Showcase Spotlight Banner */}
          <div className="home-kitchen-spotlight-card">
            <div className="spotlight-badge-row">
              <span className="spotlight-gold-badge">🍳 LUXURY MODULAR KITCHENS</span>
              <span className="spotlight-discount-badge">20% Promotional Discount Active</span>
            </div>
            <div className="spotlight-body-grid">
              <div className="spotlight-content">
                <h3>Custom Modular Kitchens &amp; Waterfall Islands</h3>
                <p>
                  Fabricated with moisture-shielded marine HDF, Calacatta marble waterfall countertops, 
                  and integrated built-in appliance towers with convection ovens &amp; silent heat extractors.
                </p>
                <div className="spotlight-actions">
                  <Link to="/kitchens" className="btn btn-solid btn-md">
                    Open Kitchen Showcase &amp; 3D Gallery →
                  </Link>
                  <button
                    type="button"
                    className="btn btn-dark btn-md"
                    onClick={() => { setAtozTab('atoz'); setAtozOpen(true); }}
                  >
                    Browse A-Z Kitchen Appliances
                  </button>
                </div>
              </div>
              <div className="spotlight-previews-grid">
                <div className="spotlight-thumb-wrap" onClick={() => navigate('/kitchens')}>
                  <img src="/kitchens/kitchen-1.webp" alt="Waterfall Island Kitchen" />
                  <span className="spotlight-overlay-label">Waterfall Island</span>
                </div>
                <div className="spotlight-thumb-wrap" onClick={() => navigate('/kitchens')}>
                  <img src="/kitchens/kitchen-2.jpg" alt="Ambient LED Linear Kitchen" />
                  <span className="spotlight-overlay-label">Linear Ambient LED</span>
                </div>
                <div className="spotlight-thumb-wrap" onClick={() => navigate('/kitchens')}>
                  <img src="/kitchens/kitchen-3.jpg" alt="Ultra-Modern Black Glass Kitchen" />
                  <span className="spotlight-overlay-label">Smoked Glass Suite</span>
                </div>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {addedToast && (
            <div className="added-toast-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span><strong>{addedToast}</strong> added to cart!</span>
              <Link to="/cart" className="toast-cart-link">View Cart →</Link>
            </div>
          )}

          {/* Products & Services Grid with Real Stock Images */}
          <div className="marketplace-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="mkt-card"
                onClick={() => navigate(`/products/${item.id}`)}
              >
                {/* Discount Badge */}
                <div className="mkt-discount-badge">{item.discount}</div>

                {/* Real Product Stock Photo */}
                <div className="mkt-card-img-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="mkt-product-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/solar-all-in-one-ess.jpg';
                    }}
                  />
                  <span className="mkt-tag-chip">{item.tag}</span>
                </div>

                {/* Card Content */}
                <div className="mkt-card-body">
                  <div className="mkt-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-num">{item.rating}</span>
                    <span className="reviews-count">({item.reviews})</span>
                  </div>

                  <h3 className="mkt-title">{item.name}</h3>
                  <p className="mkt-desc">{item.desc}</p>

                  <div className="mkt-pricing">
                    <div className="mkt-price-current">
                      {formatNaira(item.price_cents)}
                    </div>
                    <div className="mkt-price-original">
                      {formatNaira(item.originalPrice_cents)}
                    </div>
                  </div>
                  <div className="mkt-unit">Unit: {item.unit}</div>

                  {/* Actions */}
                  <div className="mkt-actions">
                    <button
                      type="button"
                      className="mkt-btn-cart"
                      onClick={(e) => handleAddToCart(e, item)}
                    >
                      + Add to Cart
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark"
                      style={{ fontSize: '11px', padding: '8px 10px', whiteSpace: 'nowrap' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${item.id}`);
                      }}
                    >
                      Details →
                    </button>
                    <a
                      href={whatsappLink(`Hi Halfcon, I would like to order: ${item.name} at the discounted price of ${formatNaira(item.price_cents)}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mkt-btn-wa"
                      onClick={(e) => e.stopPropagation()}
                      title="Order on WhatsApp"
                    >
                      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BEFORE & AFTER SOCIAL PROOF SHOWCASE ===== */}
      <section className="proof-section">
        <div className="wrap">
          <div className="section-header">
            <div className="section-eyebrow">Proven Results</div>
            <h2 className="section-title">Before &amp; After Project Showcase</h2>
            <p className="section-desc">See the standard of workmanship we deliver across residential and commercial properties in Nigeria.</p>
          </div>

          <div className="proof-grid">
            {BEFORE_AFTER_PROJECTS.map((proj, idx) => (
              <div key={idx} className="proof-card">
                <div className="proof-header">
                  <div>
                    <span className="proof-category">{proj.category}</span>
                    <h3 className="proof-title">{proj.title}</h3>
                  </div>
                  <span className="badge badge-green">{proj.badge}</span>
                </div>

                <div className="proof-compare-box">
                  <div className="compare-item before">
                    <span className="compare-tag">Before:</span>
                    <p>{proj.beforeDesc}</p>
                  </div>
                  <div className="compare-arrow">➔</div>
                  <div className="compare-item after">
                    <span className="compare-tag">After:</span>
                    <p>{proj.afterDesc}</p>
                  </div>
                </div>

                <div className="proof-quote">
                  {proj.quote}
                  <div className="quote-author">— {proj.client}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHYSICAL STORE LOCATIONS BANNER ===== */}
      <section className="locations-section">
        <div className="wrap">
          <div className="locations-card">
            <div className="locations-text">
              <div className="section-eyebrow" style={{ color: 'var(--rust)' }}>Physical Outlets &amp; Showrooms</div>
              <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', marginBottom: '14px' }}>
                Visit Us In Ikorodu &amp; Alaba International Market
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                Inspect appliances, select drapery fabrics, or consult directly with our property engineers.
              </p>

              <div className="locations-grid-inner">
                <div className="loc-box">
                  <div className="loc-title">🏢 Ikorodu Office &amp; Warehouse</div>
                  <div className="loc-desc">{CONTACTS.addressIkorodu}</div>
                  <div className="loc-phone">📞 {CONTACTS.whatsappDisplay}</div>
                </div>
                <div className="loc-box">
                  <div className="loc-title">🔌 Alaba International Market Outlet</div>
                  <div className="loc-desc">{CONTACTS.addressAlaba}</div>
                  <div className="loc-phone">📞 {CONTACTS.phoneSecondary}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUICK DETAIL MODAL WITH REAL STOCK PRODUCT IMAGE ===== */}
      {activeModalItem && (
        <div className="modal-overlay" onClick={() => setActiveModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModalItem(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="modal-grid">
              <div className="modal-img-col">
                <img
                  src={modalActiveImage || activeModalItem.image}
                  alt={activeModalItem.name}
                  className="modal-product-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/solar-all-in-one-ess.jpg';
                  }}
                />
                <div className="mkt-discount-badge" style={{ top: '16px', left: '16px' }}>{activeModalItem.discount}</div>

                {/* Interactive Multi-Angle Stock Photo Gallery */}
                {activeModalItem.gallery && activeModalItem.gallery.length > 1 && (
                  <div className="modal-gallery-thumbs">
                    {activeModalItem.gallery.map((imgUrl, gIdx) => (
                      <button
                        key={gIdx}
                        type="button"
                        className={`modal-thumb-btn ${(modalActiveImage || activeModalItem.image) === imgUrl ? 'active' : ''}`}
                        onClick={() => setModalActiveImage(imgUrl)}
                        title={`View image ${gIdx + 1}`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${gIdx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-info-col">
                <div className="modal-tag">{activeModalItem.tag}</div>
                <h2 className="modal-title">{activeModalItem.name}</h2>
                <div className="mkt-rating" style={{ marginBottom: '14px' }}>
                  <span className="stars">★★★★★</span>
                  <span className="rating-num">{activeModalItem.rating}</span>
                  <span className="reviews-count">({activeModalItem.reviews} verified customer reviews)</span>
                </div>

                <div className="modal-pricing">
                  <span className="modal-price-current">{formatNaira(activeModalItem.price_cents)}</span>
                  <span className="modal-price-original">{formatNaira(activeModalItem.originalPrice_cents)}</span>
                  <span className="modal-discount-pill">20% Saved</span>
                </div>

                <p className="modal-desc">{activeModalItem.desc}</p>

                {/* Specifications Checklist */}
                <div className="modal-specs">
                  <div className="specs-title">Key Specifications &amp; Inclusions:</div>
                  <ul>
                    {activeModalItem.specs.map((spec, i) => (
                      <li key={i}>✓ {spec}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn btn-solid btn-lg"
                    style={{ flex: 1 }}
                    onClick={() => {
                      handleAddToCart(null, activeModalItem);
                      setActiveModalItem(null);
                    }}
                  >
                    {activeModalItem.tag === 'Service' || activeModalItem.category === 'cleaning'
                      ? `Request Service (${formatNaira(activeModalItem.price_cents)})`
                      : `Add to Cart (${formatNaira(activeModalItem.price_cents)})`}
                  </button>

                  <button
                    type="button"
                    className="btn btn-dark btn-lg"
                    onClick={() => {
                      const pId = activeModalItem.id;
                      setActiveModalItem(null);
                      navigate(`/products/${pId}`);
                    }}
                  >
                    Full Details →
                  </button>

                  <a
                    href={whatsappLink(`Hi Halfcon, I would like to request: ${activeModalItem.name} at ${formatNaira(activeModalItem.price_cents)}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green btn-lg"
                  >
                    {activeModalItem.tag === 'Service' || activeModalItem.category === 'cleaning' ? 'Request on WhatsApp' : 'WhatsApp Order'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FREE SITE INSPECTION MODAL ===== */}
      {inspectionModalOpen && (
        <div className="modal-overlay" onClick={() => setInspectionModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setInspectionModalOpen(false)}
            >
              ✕
            </button>

            <div style={{ padding: '36px 32px' }}>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--rust)',
                  background: 'var(--rust-light)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '8px',
                }}
              >
                Zero-Cost Consultation
              </div>
              <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '8px' }}>
                Book a Free Engineer Site Visit
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--steel)', marginBottom: '24px', lineHeight: 1.5 }}>
                Our senior project supervisor will visit your residential or commercial site in Lagos to perform technical assessments and deliver an itemized quote.
              </p>

              {inspSubmitted ? (
                <div className="success" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Opening WhatsApp Hotline...</div>
                  <div style={{ fontSize: '13px' }}>Your site inspection request is being transferred to our dispatch desk.</div>
                </div>
              ) : (
                <form onSubmit={handleInspectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Your Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. Chief Babatunde Adeleke"
                      value={inspForm.name}
                      onChange={(e) => setInspForm({ ...inspForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      className="input"
                      required
                      placeholder="e.g. 0803 123 4567"
                      value={inspForm.phone}
                      onChange={(e) => setInspForm({ ...inspForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Project Category *</label>
                    <select
                      className="input"
                      value={inspForm.projectType}
                      onChange={(e) => setInspForm({ ...inspForm, projectType: e.target.value })}
                    >
                      <option value="Solar & Inverter Setup">Solar &amp; Inverter Setup</option>
                      <option value="Modular Kitchen & Wardrobe">Modular Kitchen &amp; Wardrobe</option>
                      <option value="Full House Electrical Rewiring">Full House Electrical Rewiring</option>
                      <option value="High-Rise Facade / Deep Cleaning">High-Rise Facade / Deep Cleaning</option>
                      <option value="POP Ceilings & Interior Fit-Out">POP Ceilings &amp; Interior Fit-Out</option>
                      <option value="Plumbing & Borehole Installation">Plumbing &amp; Borehole Installation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Site Location / Address *</label>
                    <textarea
                      className="input"
                      required
                      placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                      style={{ minHeight: '70px' }}
                      value={inspForm.address}
                      onChange={(e) => setInspForm({ ...inspForm, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Preferred Inspection Date</label>
                    <input
                      type="date"
                      className="input"
                      value={inspForm.date}
                      onChange={(e) => setInspForm({ ...inspForm, date: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-solid btn-lg" style={{ marginTop: '8px' }}>
                    Confirm &amp; Dispatch Supervisor →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive A-Z Kitchen Appliances & Showrooms Directory Modal */}
      <AtoZApplianceDropdown
        isOpen={atozOpen}
        onClose={() => setAtozOpen(false)}
        initialTab={atozTab}
      />
    </div>
  );
}
