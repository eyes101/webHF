// pages/KitchensPage.jsx — Dedicated Luxury Modular Kitchens & Built-in Appliances Landing Page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';
import { KITCHEN_SHOWCASE_PROJECTS, ATOZ_APPLIANCES } from '../data/kitchenDirectory';
import AtoZApplianceDropdown from '../components/AtoZApplianceDropdown';
import './KitchensPage.css';

export default function KitchensPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  // State
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [atozOpen, setAtozOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(null);

  // Estimator State
  const [layoutType, setLayoutType] = useState('island');
  const [cabinetFinish, setCabinetFinish] = useState('acrylic');
  const [countertopType, setCountertopType] = useState('quartz');
  const [appliancePkg, setAppliancePkg] = useState('full');

  // Site Inspection Form State
  const [inspForm, setInspForm] = useState({
    name: '',
    phone: '',
    location: 'Lekki / Victoria Island',
    kitchenSize: 'Medium (12ft x 14ft)',
    preferredDate: '',
    notes: ''
  });
  const [inspSubmitted, setInspSubmitted] = useState(false);

  const currentProject = KITCHEN_SHOWCASE_PROJECTS[activeProjectIdx];

  // Dynamic Cost Calculation
  const layoutBaseCosts = {
    island: 285000000, // ₦2.85M
    lshape: 195000000, // ₦1.95M
    ushape: 245000000, // ₦2.45M
    galley: 165000000, // ₦1.65M
    penthouse: 360000000 // ₦3.60M
  };

  const finishMultipliers = {
    acrylic: 1.0,
    matte_hdf: 0.9,
    smoked_glass: 1.15,
    natural_wood: 1.25
  };

  const countertopAddons = {
    quartz: 0,
    granite: -15000000,
    calacatta_marble: 25000000
  };

  const appliancePkgAddons = {
    none: 0,
    basic: 38000000, // Hob + Extractor (+₦380k)
    full: 85000000, // Oven + Hob + Microwave + Extractor (+₦850k)
    premium: 145000000 // Oven + Hob + Microwave + Extractor + Dishwasher (+₦1.45M)
  };

  const calculatedBaseCents =
    (layoutBaseCosts[layoutType] || 285000000) * (finishMultipliers[cabinetFinish] || 1.0) +
    (countertopAddons[countertopType] || 0) +
    (appliancePkgAddons[appliancePkg] || 0);

  const discountCents = Math.round(calculatedBaseCents * 0.2);
  const finalPriceCents = calculatedBaseCents - discountCents;

  const handleRequestKitchenQuote = (project) => {
    const targetProject = project || currentProject;
    addItem(
      {
        id: targetProject.id,
        name: `Modular Kitchen Fit-Out: ${targetProject.title}`,
        category: 'Modular Kitchens',
        price_cents: targetProject.price_cents,
        unit: 'Full Kitchen Installation',
        description: targetProject.subtitle,
      },
      1
    );
    setAddedToast(targetProject.title);
    setTimeout(() => setAddedToast(null), 3500);
  };

  const handleBookInspectionSubmit = (e) => {
    e.preventDefault();
    setInspSubmitted(true);
    setTimeout(() => {
      const msg = `Hello Halfcon Kitchens, I want to book a Free Laser Site Measurement & 3D Render Inspection:
Name: ${inspForm.name}
Phone: ${inspForm.phone}
Location: ${inspForm.location}
Estimated Size: ${inspForm.kitchenSize}
Preferred Date: ${inspForm.preferredDate}
Notes: ${inspForm.notes || 'None'}`;
      window.open(whatsappLink(msg), '_blank');
      setInspSubmitted(false);
      setInspForm({
        name: '',
        phone: '',
        location: 'Lekki / Victoria Island',
        kitchenSize: 'Medium (12ft x 14ft)',
        preferredDate: '',
        notes: ''
      });
    }, 1200);
  };

  return (
    <div className="kitchens-page-wrap">
      {/* ===== HERO BANNER ===== */}
      <section className="k-hero-section">
        <div className="k-hero-bg-overlay" />
        <div className="wrap k-hero-inner">
          <div className="k-hero-left">
            <div className="k-hero-badge">
              <span className="badge-ping" />
              <span>✨ Official Architectural Kitchens &amp; Appliance Hub</span>
            </div>
            <h1 className="k-hero-title">
              Custom Modular Kitchens &amp; <span className="k-gold-text">Built-In Appliance Suites</span>
            </h1>
            <p className="k-hero-desc">
              Bespoke luxury kitchen cabinetry, engineered Calacatta quartz waterfall islands, 
              ceiling LED ambient channels, and seamless built-in ovens, hobs &amp; extractors designed, fabricated, 
              and installed across Nigeria.
            </p>

            <div className="k-hero-actions">
              <a href="#gallery" className="btn btn-solid btn-lg">
                View Real Project Gallery ↓
              </a>
              <a href="#calculator" className="btn btn-dark btn-lg">
                Calculate Kitchen Quote 📐
              </a>
              <button
                type="button"
                className="btn btn-ghost k-hero-atoz-btn"
                onClick={() => setAtozOpen(true)}
              >
                📖 A-Z Appliance Directory
              </button>
            </div>

            <div className="k-hero-guarantees">
              <div className="k-g-item">🛡️ <strong>5-Year</strong> Structural Warranty</div>
              <div className="k-g-item">📐 <strong>Free 3D</strong> Render &amp; Laser Site Inspection</div>
              <div className="k-g-item">⚡ <strong>10-14 Days</strong> Rapid Fabrication</div>
            </div>
          </div>

          {/* Hero Featured Kitchen Frame */}
          <div className="k-hero-right">
            <div className="k-hero-card">
              <div className="k-hero-img-box" onClick={() => setLightboxImg('/kitchens/kitchen-1.webp')}>
                <img
                  src="/kitchens/kitchen-1.webp"
                  alt="Modern Waterfall Island Kitchen"
                  className="k-hero-img"
                />
                <span className="k-zoom-badge">🔍 Click to Expand</span>
                <span className="k-hero-chip">Project Showcase #01</span>
              </div>
              <div className="k-hero-card-details">
                <h3>The Continental Waterfall Island Kitchen</h3>
                <p>Calacatta Quartz Waterfall Island &middot; High-Gloss White &amp; Charcoal Matte</p>
                <div className="k-hero-card-footer">
                  <div className="k-price-tag">
                    {formatNaira(285000000)}
                    <span className="k-original">{formatNaira(350000000)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-solid btn-sm"
                    onClick={() => handleRequestKitchenQuote(KITCHEN_SHOWCASE_PROJECTS[0])}
                  >
                    Request Design →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="k-added-toast wrap">
          <span>✓ Added "{addedToast}" to your request list!</span>
          <Link to="/checkout" className="btn btn-solid btn-sm">Proceed to Checkout →</Link>
        </div>
      )}

      {/* ===== INTERACTIVE 5-PROJECT GALLERY & LIGHTBOX ===== */}
      <section id="gallery" className="k-gallery-section">
        <div className="wrap">
          <div className="k-section-head">
            <div className="k-eyebrow">Real Completed Installations</div>
            <h2 className="k-section-title">Explore Halfcon Modular Kitchen Projects</h2>
            <p className="k-section-desc">
              Click any project below to inspect high-resolution photography, architectural lighting details, 
              cabinet specifications, and direct fit-out pricing.
            </p>
          </div>

          {/* Project Selector Tabs */}
          <div className="k-project-tabs-bar">
            {KITCHEN_SHOWCASE_PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                type="button"
                className={`k-proj-tab ${activeProjectIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveProjectIdx(idx)}
              >
                <span className="proj-tab-num">0{idx + 1}</span>
                <span className="proj-tab-title">{proj.title.split('—')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Project Full Showcase Display */}
          <div className="k-showcase-display">
            {/* Left: Main Big Image with Thumbnail Slider */}
            <div className="k-showcase-visuals">
              <div
                className="k-showcase-main-img-wrap"
                onClick={() => setLightboxImg(currentProject.image)}
              >
                <img
                  src={currentProject.image}
                  alt={currentProject.title}
                  className="k-showcase-main-img"
                />
                <div className="k-img-overlay-info">
                  <span className="k-overlay-badge">🔍 Click for Fullscreen 4K Lightbox</span>
                </div>
              </div>

              {/* Multi-Photo Grid */}
              <div className="k-thumbs-row">
                {currentProject.allImages.map((imgSrc, i) => (
                  <button
                    key={i}
                    type="button"
                    className="k-thumb-box"
                    onClick={() => setLightboxImg(imgSrc)}
                  >
                    <img src={imgSrc} alt={`Gallery view ${i + 1}`} />
                    <span className="thumb-zoom-icon">🔎</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Technical Specs & Fabrication Order Card */}
            <div className="k-showcase-info">
              <div className="k-tags-row">
                {currentProject.tags.map((t, i) => (
                  <span key={i} className="k-chip">{t}</span>
                ))}
                <span className="k-lead-time">⏱️ {currentProject.leadTime}</span>
              </div>

              <h3 className="k-showcase-title">{currentProject.title}</h3>
              <p className="k-showcase-subtitle">{currentProject.subtitle}</p>

              <div className="k-features-card">
                <div className="k-features-head">Key Architectural Specifications:</div>
                <ul className="k-features-list">
                  {currentProject.features.map((feat, i) => (
                    <li key={i}>
                      <span className="check-icon">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing Box */}
              <div className="k-price-card">
                <div className="k-price-main">
                  <span className="k-price-active">{formatNaira(currentProject.price_cents)}</span>
                  <span className="k-price-strikethrough">{formatNaira(currentProject.originalPrice_cents)}</span>
                  <span className="k-disc-pill">20% Promotional Discount</span>
                </div>
                <div className="k-price-note">
                  Includes: 3D CAD modeling, moisture-resistant cabinetry, marble/quartz island, soft-close hardware &amp; expert installation.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="k-action-row">
                <button
                  type="button"
                  className="btn btn-solid btn-lg"
                  onClick={() => handleRequestKitchenQuote(currentProject)}
                >
                  ⚡ Request This Kitchen Design
                </button>

                <a
                  href={whatsappLink(`Hello Halfcon, I am reviewing "${currentProject.title}" on the website and would like a custom quote.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-green btn-lg"
                >
                  WhatsApp Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE MODULAR KITCHEN ESTIMATOR ===== */}
      <section id="calculator" className="k-calculator-section">
        <div className="wrap">
          <div className="k-calc-container">
            <div className="k-calc-head">
              <span className="gold-pill">Instant Online Estimator</span>
              <h2>Custom Modular Kitchen Quotation Builder</h2>
              <p>Configure your layout, cabinet materials, countertops, and appliances to generate an instant estimate.</p>
            </div>

            <div className="k-calc-grid">
              {/* Controls Column */}
              <div className="k-calc-controls">
                {/* Step 1: Layout */}
                <div className="calc-group">
                  <label className="calc-label">1. Kitchen Layout Type:</label>
                  <div className="calc-options-grid">
                    {[
                      { id: 'island', name: 'Waterfall Island Suite', desc: 'Central marble island + surrounding units' },
                      { id: 'lshape', name: 'L-Shaped Modular Kitchen', desc: 'Optimized corner prep & storage' },
                      { id: 'ushape', name: 'U-Shaped Ergonomic Layout', desc: 'Triple-wall panoramic cabinetry' },
                      { id: 'galley', name: 'Galley / Parallel Kitchen', desc: 'Dual linear counters for apartments' },
                      { id: 'penthouse', name: 'Penthouse Full Suite', desc: 'Floor-to-ceiling towers & utility' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`calc-opt-btn ${layoutType === opt.id ? 'active' : ''}`}
                        onClick={() => setLayoutType(opt.id)}
                      >
                        <strong>{opt.name}</strong>
                        <span>{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Finish */}
                <div className="calc-group">
                  <label className="calc-label">2. Cabinet Finish &amp; Board Material:</label>
                  <div className="calc-pills-row">
                    {[
                      { id: 'acrylic', name: 'High-Gloss Acrylic (Reflective)' },
                      { id: 'matte_hdf', name: 'Matte Super-Smooth HDF' },
                      { id: 'smoked_glass', name: 'Smoked Tempered Glass Uppers' },
                      { id: 'natural_wood', name: 'Textured Natural Wood Veneer' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`calc-pill ${cabinetFinish === f.id ? 'active' : ''}`}
                        onClick={() => setCabinetFinish(f.id)}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Countertops */}
                <div className="calc-group">
                  <label className="calc-label">3. Countertop Surface Material:</label>
                  <div className="calc-pills-row">
                    {[
                      { id: 'quartz', name: 'Calacatta Engineered Quartz' },
                      { id: 'granite', name: 'Polished Black Pearl Granite' },
                      { id: 'calacatta_marble', name: 'Solid Calacatta Gold Marble' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`calc-pill ${countertopType === c.id ? 'active' : ''}`}
                        onClick={() => setCountertopType(c.id)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Built-in Appliances Package */}
                <div className="calc-group">
                  <label className="calc-label">4. Integrated Appliance Package:</label>
                  <div className="calc-pills-row">
                    {[
                      { id: 'none', name: 'Cabinetry Only (No Appliances)' },
                      { id: 'basic', name: 'Basic: 4-Burner Hob + Extractor' },
                      { id: 'full', name: 'Full: Oven + Hob + Microwave + Extractor' },
                      { id: 'premium', name: 'Executive: Full Suite + Dishwasher' },
                    ].map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        className={`calc-pill ${appliancePkg === pkg.id ? 'active' : ''}`}
                        onClick={() => setAppliancePkg(pkg.id)}
                      >
                        {pkg.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Summary Box */}
              <div className="k-calc-summary">
                <div className="summary-card">
                  <div className="summary-tag">Calculated Kitchen Quote</div>
                  <div className="summary-price-box">
                    <span className="summary-price-current">{formatNaira(finalPriceCents)}</span>
                    <span className="summary-price-original">{formatNaira(calculatedBaseCents)}</span>
                    <span className="summary-save-badge">You Save {formatNaira(discountCents)} (20% OFF)</span>
                  </div>

                  <div className="summary-specs-list">
                    <div><strong>Layout:</strong> {layoutType.toUpperCase()} Suite</div>
                    <div><strong>Finish:</strong> {cabinetFinish.replace('_', ' ').toUpperCase()}</div>
                    <div><strong>Countertop:</strong> {countertopType.replace('_', ' ').toUpperCase()}</div>
                    <div><strong>Appliances:</strong> {appliancePkg.toUpperCase()}</div>
                    <div><strong>Inspection:</strong> 100% Free Site Laser Measurement Included</div>
                  </div>

                  <div className="summary-actions">
                    <button
                      type="button"
                      className="btn btn-solid btn-lg"
                      style={{ width: '100%' }}
                      onClick={() => {
                        addItem(
                          {
                            id: `custom-k-${layoutType}-${cabinetFinish}`,
                            name: `Custom Modular Kitchen (${layoutType.toUpperCase()} - ${cabinetFinish.toUpperCase()})`,
                            category: 'Modular Kitchens',
                            price_cents: finalPriceCents,
                            unit: 'Custom Build Scope',
                            description: `Configured quote with ${countertopType} countertop and ${appliancePkg} appliance package. Free 3D design included.`
                          },
                          1
                        );
                        navigate('/checkout');
                      }}
                    >
                      Lock 20% Off &amp; Request Now →
                    </button>

                    <a
                      href={whatsappLink(`Hi Halfcon, I generated a Kitchen Estimate for ${layoutType.toUpperCase()} layout (${cabinetFinish}) with ${countertopType} countertop and ${appliancePkg} package at ${formatNaira(finalPriceCents)}. I want to proceed.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-green btn-lg"
                      style={{ width: '100%' }}
                    >
                      Send Configuration to WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FREE SITE INSPECTION BOOKING ===== */}
      <section className="k-inspection-section">
        <div className="wrap k-insp-inner">
          <div className="k-insp-left">
            <span className="gold-pill">Lagos &amp; Nationwide Service</span>
            <h2>Book a Free Laser Measurement &amp; 3D Render Inspection</h2>
            <p>
              Our lead architectural kitchen engineer will visit your property with physical material swatches (Quartz, HDF, Acrylic, Glass), 
              take digital laser measurements, and deliver an interactive 3D kitchen layout render within 48 hours.
            </p>

            <div className="k-insp-checklist">
              <div>✓ On-Site Laser Room &amp; Plumbing Angle Dimensioning</div>
              <div>✓ Physical HDF &amp; Marble Color Swatch Presentation</div>
              <div>✓ Appliance Ducting &amp; Electrical Load Assessment</div>
              <div>✓ 100% Free Consultation with No Hidden Obligations</div>
            </div>
          </div>

          <div className="k-insp-right">
            <form className="k-insp-form" onSubmit={handleBookInspectionSubmit}>
              <h3>Schedule Kitchen Inspection</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Adeyemi"
                    value={inspForm.name}
                    onChange={(e) => setInspForm({ ...inspForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0813 732 1877"
                    value={inspForm.phone}
                    onChange={(e) => setInspForm({ ...inspForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Property Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lekki Phase 1 / Ikeja GRA / Ikorodu"
                    value={inspForm.location}
                    onChange={(e) => setInspForm({ ...inspForm, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Kitchen Size</label>
                  <select
                    value={inspForm.kitchenSize}
                    onChange={(e) => setInspForm({ ...inspForm, kitchenSize: e.target.value })}
                  >
                    <option value="Compact (8ft x 10ft)">Compact (8ft x 10ft)</option>
                    <option value="Medium (12ft x 14ft)">Medium (12ft x 14ft)</option>
                    <option value="Large Island (16ft x 20ft)">Large Island (16ft x 20ft)</option>
                    <option value="Duplex / Mansion Suite">Duplex / Mansion Suite</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Preferred Inspection Date *</label>
                <input
                  type="date"
                  required
                  value={inspForm.preferredDate}
                  onChange={(e) => setInspForm({ ...inspForm, preferredDate: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-solid btn-lg" style={{ width: '100%' }}>
                {inspSubmitted ? 'Redirecting to WhatsApp...' : 'Confirm Free Site Inspection →'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="k-lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="k-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="High resolution kitchen showcase" className="k-lightbox-img" />
            <button
              type="button"
              className="k-lightbox-close"
              onClick={() => setLightboxImg(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* A to Z Modal */}
      <AtoZApplianceDropdown
        isOpen={atozOpen}
        onClose={() => setAtozOpen(false)}
        initialTab="atoz"
      />
    </div>
  );
}
