// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './HomePage.css';

// Jumia-style categorized marketplace inventory based on the official Halfcon product & service line
const MARKETPLACE_CATEGORIES = [
  { id: 'all', label: 'All Items & Services', icon: '✨' },
  { id: 'appliances', label: 'Electrical & Power', icon: '⚡' },
  { id: 'ac-cooling', label: 'AC & Climate Cooling', icon: '❄️' },
  { id: 'cleaning', label: 'Industrial & Home Cleaning', icon: '🧹' },
  { id: 'curtains', label: 'Curtains & Window Blinds', icon: '🪟' },
  { id: 'interior', label: 'Kitchen & POP Interior', icon: '🔨' },
  { id: 'plumbing', label: 'Plumbing & Pipes', icon: '🚰' },
];

const MARKETPLACE_ITEMS = [
  // Electrical & Power
  {
    id: 'mkt-1',
    category: 'appliances',
    name: 'Haisic 5KVA Hybrid Solar Inverter + Lithium Battery System',
    originalPrice_cents: 185000000,
    price_cents: 148000000, // 20% off
    discount: '20% OFF',
    rating: 4.9,
    reviews: 142,
    tag: 'Best Seller',
    unit: 'Complete Kit',
    icon: '🔋',
    desc: 'Heavy-duty 5KVA hybrid pure sine-wave inverter with lithium iron phosphate battery backup. Perfect for residential homes and corporate offices.',
    specs: ['Pure Sine Wave 5KVA / 48V', 'Lithium LiFePO4 Battery Support', 'Automatic Grid / Generator / Solar Switching', '5-Year Warranty Included'],
  },
  {
    id: 'mkt-2',
    category: 'appliances',
    name: 'Industrial Heavy-Duty Cable Extension Reel (50 Meters)',
    originalPrice_cents: 4500000,
    price_cents: 3600000,
    discount: '20% OFF',
    rating: 4.8,
    reviews: 98,
    tag: 'Top Rated',
    unit: 'Roll',
    icon: '🔌',
    desc: 'Rugged 50-meter heavy-duty cable extension reel with 4 surge-protected universal sockets and thermal safety cut-off.',
    specs: ['50m Heavy Gauge Copper Cable', '4 Surge Protected Sockets', 'High-Impact Drum with Carry Handle', 'Safety Overload Switch'],
  },
  {
    id: 'mkt-3',
    category: 'appliances',
    name: 'Smart Home Electrical Cable & Wiring Fittings Bundle',
    originalPrice_cents: 8500000,
    price_cents: 6800000,
    discount: '20% OFF',
    rating: 4.9,
    reviews: 76,
    tag: 'Pro Builder',
    unit: 'Pack',
    icon: '⚡',
    desc: 'Complete building electrical kit: flame-retardant single/double copper cables, modular switches, sockets, and junction boxes.',
    specs: ['100% Pure Copper Cores', 'Flame-Retardant PVC Insulation', 'Includes 10 Sockets + 10 Switches', 'Certified for Nigerian Grid'],
  },

  // AC & Climate Cooling
  {
    id: 'mkt-4',
    category: 'ac-cooling',
    name: 'Haisic / Haier 1.5HP Inverter Split Air Conditioner',
    originalPrice_cents: 42000000,
    price_cents: 33600000,
    discount: '20% OFF',
    rating: 4.9,
    reviews: 110,
    tag: 'Popular',
    unit: 'Unit',
    icon: '❄️',
    desc: 'High-efficiency fast-cooling inverter split AC with low-voltage startup, turbo mode, and anti-rust gold fin compressor.',
    specs: ['1.5 HP Fast Cooling Capacity', 'Up to 60% Energy Saving Inverter', 'Low Voltage Starter (130V-260V)', 'Installation Kit Included'],
  },
  {
    id: 'mkt-5',
    category: 'ac-cooling',
    name: 'Outdoor Heavy-Duty AC Compressor Servicing & Recharge',
    originalPrice_cents: 1800000,
    price_cents: 1440000,
    discount: '20% OFF',
    rating: 4.8,
    reviews: 84,
    tag: 'Service',
    unit: 'Per Unit',
    icon: '🛠️',
    desc: 'Complete AC chemical coil washing, gas pressure leak detection, freon top-up, and electrical condenser optimization.',
    specs: ['Certified HVAC Technician On-Site', 'Full Chemical Coil & Filter Wash', 'Freon R410A / R22 Pressure Check', '30-Day Service Guarantee'],
  },

  // Cleaning & Maintenance
  {
    id: 'mkt-6',
    category: 'cleaning',
    name: 'High-Rise Facade & Glass Window Rope-Access Cleaning',
    originalPrice_cents: 25000000,
    price_cents: 20000000,
    discount: '20% OFF',
    rating: 5.0,
    reviews: 62,
    tag: 'Industrial',
    unit: 'Per Building Scope',
    icon: '🧗‍♂️',
    desc: 'Professional rope-access high-rise window washing, exterior building stain removal, and facade restoration for corporate towers.',
    specs: ['Certified Rope-Access Technicians', 'Streak-Free Hydro-Washing Solutions', 'Full Safety Rigging & Insurance', 'Alucobond & Glass Restoration'],
  },
  {
    id: 'mkt-7',
    category: 'cleaning',
    name: 'Commercial High-Pressure Jet Washer (2200W / 160 Bar)',
    originalPrice_cents: 11000000,
    price_cents: 8800000,
    discount: '20% OFF',
    rating: 4.8,
    reviews: 95,
    tag: 'Equipment',
    unit: 'Machine',
    icon: '🚿',
    desc: 'Heavy-duty 160-bar high pressure washer for car detailing, driveway paving restoration, compound washing, and compound cleaning.',
    specs: ['2200W Induction Motor', '160 Bar Max Pressure', '10m Steel Reinforced High Pressure Hose', 'Foam Cannon Attachment Included'],
  },
  {
    id: 'mkt-8',
    category: 'cleaning',
    name: 'Industrial Floor Buffing & Tile Scrubbing Deep Clean',
    originalPrice_cents: 12000000,
    price_cents: 9600000,
    discount: '20% OFF',
    rating: 4.9,
    reviews: 130,
    tag: 'House Care',
    unit: 'Per 150 sqm',
    icon: '✨',
    desc: 'Heavy-duty rotary machine floor scrubbing, tile grout descaling, marble crystallisation, and high-gloss polish for homes & offices.',
    specs: ['Industrial Single-Disc Floor Scrubber', 'Marble & Terrazzo Crystallization', 'Removes 100% Grout Grime & Wax Build-up', 'Eco-Friendly Shine Sealant'],
  },

  // Curtains & Window Blinds
  {
    id: 'mkt-9',
    category: 'curtains',
    name: 'Custom Luxury Drapes & Curtains (Empire, Pleat & Swags)',
    originalPrice_cents: 16000000,
    price_cents: 12800000,
    discount: '20% OFF',
    rating: 4.9,
    reviews: 154,
    tag: 'Luxury Decor',
    unit: 'Per Window Set',
    icon: '🪟',
    desc: 'Bespoke interior drapery tailored in Empire, Overlapping Swags, French Pleat, Roller, Sandglass, and Italian styles.',
    specs: ['Blackout & Sheer Dual Layer Options', 'Heavyweight Jacquard / Velvet Fabrics', 'Includes Track Rail & Motorized Rods', 'Free On-Site Measurement & Fitting'],
  },
  {
    id: 'mkt-10',
    category: 'curtains',
    name: 'Modern Motorized & Manual Vertical / Roller Blinds',
    originalPrice_cents: 7500000,
    price_cents: 6000000,
    discount: '20% OFF',
    rating: 4.8,
    reviews: 89,
    tag: 'Office & Home',
    unit: 'Per Window',
    icon: '🏢',
    desc: 'Sleek sunscreen and blackout roller blinds, vertical louvers, and wooden Venetian blinds for contemporary executive spaces.',
    specs: ['UV & Heat Reflective Fabric', 'Smooth Chain / Remote Control Mechanism', 'Anti-Static Dust Resistant Surface', 'Custom Sized to Exact Window Frame'],
  },

  // Kitchen & POP Interior
  {
    id: 'mkt-11',
    category: 'interior',
    name: 'Modern Modular Kitchen Build-Out with LED Accent Lighting',
    originalPrice_cents: 65000000,
    price_cents: 52000000,
    discount: '20% OFF',
    rating: 5.0,
    reviews: 78,
    tag: 'Interior Fit-Out',
    unit: 'Per Project',
    icon: '🍳',
    desc: 'Full contemporary kitchen cabinetry with granite/quartz worktops, soft-close drawers, under-cabinet warm LED strips, and chimney hood.',
    specs: ['Moisture-Resistant High-Gloss HDF/MDF', 'Solid Quartz or Granite Countertop', 'Built-in Space for Oven & Dishwasher', '3D Architecture Render Prior to Build'],
  },
  {
    id: 'mkt-12',
    category: 'interior',
    name: 'Walk-In Closet & Master Wardrobe System',
    originalPrice_cents: 38000000,
    price_cents: 30400000,
    discount: '20% OFF',
    rating: 4.9,
    reviews: 67,
    tag: 'Custom Joinery',
    unit: 'Per Room',
    icon: '👔',
    desc: 'Custom master walk-in wardrobe featuring multi-tier shelving, shoe racks, integrated mirror vanities, and artificial grass/turf accents.',
    specs: ['Full Floor-to-Ceiling Shelving', 'Integrated LED Motion Sensor Lights', 'Velvet Jewelry Drawers & Hanger Bars', 'Custom Compartments for 100+ Pairs of Shoes'],
  },
  {
    id: 'mkt-13',
    category: 'interior',
    name: 'Luxury POP False Ceiling with Recessed Warm Strip Lighting',
    originalPrice_cents: 22000000,
    price_cents: 17600000,
    discount: '20% OFF',
    rating: 4.9,
    reviews: 93,
    tag: 'POP Ceiling',
    unit: 'Per Living Area',
    icon: '💡',
    desc: 'Architectural Plaster of Paris (POP) ceiling design with geometric layered profiles, cove lighting slots, and spotlight distribution.',
    specs: ['Reinforced Gypsum Plaster Framework', 'Dual-Color Warm & White Hidden LED Coves', 'Anti-Sagging Heavy Gauge Hangers', 'Smooth Flawless Screeding & Finish'],
  },

  // Plumbing
  {
    id: 'mkt-14',
    category: 'plumbing',
    name: 'PPR & PVC Plumbing Pipes and Pressure Fittings Bundle',
    originalPrice_cents: 9500000,
    price_cents: 7600000,
    discount: '20% OFF',
    rating: 4.8,
    reviews: 82,
    tag: 'Building Supplies',
    unit: 'Bundle',
    icon: '🔧',
    desc: 'High-pressure PPR hot/cold water distribution pipes, PVC waste conduits, elbows, union joints, and brass gate valves.',
    specs: ['PN20 High Pressure Rated PPR', 'UV & Corrosion Resistant Material', 'Includes 20 Pipes + 50 Assorted Fittings', 'Guaranteed Leak-Free Thermal Fusion'],
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [addedToast, setAddedToast] = useState(null);

  const { addItem } = useCart();
  const navigate = useNavigate();

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
      {/* ===== TOP PROMO MARQUEE BANNER ===== */}
      <div className="promo-top-bar">
        <div className="wrap promo-top-inner">
          <div className="promo-badge">⚡ 20% DISCOUNT OFF ALL SERVICES &amp; APPLIANCES</div>
          <div className="promo-addresses">
            <span>📍 <strong>Ikorodu:</strong> {CONTACTS.addressIkorodu}</span>
            <span className="promo-sep">|</span>
            <span>📍 <strong>Alaba Int'l:</strong> {CONTACTS.addressAlaba}</span>
          </div>
          <div className="promo-hotline">
            Hotline: <a href={`tel:${CONTACTS.whatsappDisplay}`}>{CONTACTS.whatsappDisplay}</a>
          </div>
        </div>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg-blob hero-bg-blob-1" />
        <div className="hero-bg-blob hero-bg-blob-2" />

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot">
                <span className="hero-badge-ping" />
              </span>
              House Care &middot; Home &amp; Offices Maintenance &middot; Electrical Appliances
            </div>

            <h1 className="hero-title">
              Operations, Home Care &amp;<br />
              <span className="hero-title-accent">Electrical Systems</span> Built for You.
            </h1>

            <p className="hero-desc">
              From commercial facade cleaning, custom drapes &amp; modular kitchens to solar inverter installations and vetted artisans across Nigeria.
            </p>

            <div className="hero-ctas">
              <a href="#marketplace" className="cta-primary">
                Browse 20% Off Catalog
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a href={whatsappLink("Hi Halfcon, I would like to make an instant order.")} target="_blank" rel="noopener noreferrer" className="cta-secondary">
                Order on WhatsApp
              </a>
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
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Ikorodu &amp; Alaba Stores
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                100% Genuine Appliances
              </div>
              <div className="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Same-Day Dispatch
              </div>
            </div>
          </div>

          {/* Hero Banner Showcase */}
          <div className="hero-media">
            <div className="hero-flyer-frame">
              <img
                src="/halfcon-banner.png"
                alt="Halfcon House Care and Appliances"
                className="hero-flyer-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="hero-flyer-ribbon">
                <span className="ribbon-text">20% OFF ALL ORDERS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== JUMIA-STYLE MARKETPLACE & SERVICE GALLERY ===== */}
      <section id="marketplace" className="marketplace-section">
        <div className="wrap">
          {/* Section Header */}
          <div className="marketplace-header">
            <div>
              <div className="section-eyebrow">Interactive Catalog</div>
              <h2 className="section-title">Explore Halfcon Products &amp; Services</h2>
              <p className="section-desc">Click any item for instant specifications, pricing discounts, and direct checkout.</p>
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

          {/* Category Tabs (Jumia Style) */}
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
          </div>

          {/* Toast Notification */}
          {addedToast && (
            <div className="added-toast-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span><strong>{addedToast}</strong> added to cart!</span>
              <Link to="/cart" className="toast-cart-link">View Cart →</Link>
            </div>
          )}

          {/* Products & Services Grid */}
          <div className="marketplace-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="mkt-card"
                onClick={() => setActiveModalItem(item)}
              >
                {/* Discount Badge */}
                <div className="mkt-discount-badge">{item.discount}</div>

                {/* Card Icon Header */}
                <div className="mkt-card-img-placeholder">
                  <span className="mkt-icon-large">{item.icon}</span>
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
                    <a
                      href={whatsappLink(`Hi Halfcon, I would like to order: ${item.name} at the discounted price of ${formatNaira(item.price_cents)}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mkt-btn-wa"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
                      Buy on WA
                    </a>
                  </div>
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

      {/* ===== QUICK DETAIL MODAL (JUMIA STYLE) ===== */}
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
                <div className="modal-icon-display">{activeModalItem.icon}</div>
                <div className="mkt-discount-badge" style={{ top: '16px', left: '16px' }}>{activeModalItem.discount}</div>
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
                    Add to Cart ({formatNaira(activeModalItem.price_cents)})
                  </button>

                  <a
                    href={whatsappLink(`Hi Halfcon, I would like to order: ${activeModalItem.name} at ${formatNaira(activeModalItem.price_cents)}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green btn-lg"
                  >
                    WhatsApp Order
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
