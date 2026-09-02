// pages/HomePage.jsx — Redesigned Homepage (FAMSWORLD Ultra-Modern E-Commerce Layout)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { CONTACTS, whatsappLink } from '../config/contacts';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_ITEMS } from '../data/products';
import { ATOZ_APPLIANCES } from '../data/kitchenDirectory';
import AtoZApplianceDropdown from '../components/AtoZApplianceDropdown';
import './HomePage.css';

// Featured Categories with Circular Images (FAMSWORLD Style)
const CIRCULAR_CATEGORIES = [
  {
    id: 'kitchens',
    name: 'Modular Kitchens',
    img: '/kitchens/kitchen-1.webp',
    link: '/kitchens',
    tag: 'Luxury',
  },
  {
    id: 'solar',
    name: 'Solar & Inverters',
    img: '/images/solar-all-in-one-ess.jpg',
    link: '/shop?category=appliances',
    tag: '5KVA ESS',
  },
  {
    id: 'atoz-kitchen',
    name: 'Kitchen Appliances',
    img: '/kitchens/kitchen-3.jpg',
    action: 'atoz',
    tag: 'A to Z',
  },
  {
    id: 'ac-cooling',
    name: 'AC & Climate',
    img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
    link: '/shop?category=ac-cooling',
    tag: 'Inverter',
  },
  {
    id: 'cleaning',
    name: 'Deep Cleaning',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    link: '/services?category=Cleaning',
    tag: 'Hygiene',
  },
  {
    id: 'electrical',
    name: 'Electrical & Power',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    link: '/shop?category=appliances',
    tag: 'Wiring',
  },
  {
    id: 'artisans',
    name: 'Vetted Artisans',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
    link: '/artisans',
    tag: 'Certified',
  },
];

// Customer Testimonials
const TESTIMONIALS = [
  {
    quote: "Amazing quality and fast same-day dispatch to Lekki! The 5KVA All-in-One Solar Inverter works flawlessly and powers our whole apartment with zero noise.",
    name: "Dr. Babatunde Adeleke",
    role: "Verified Buyer · Lekki Phase 1",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
  {
    quote: "HALFCON has become our go-to for all property fittings. Their modular waterfall kitchen fabrication is top-notch, and the 100% escrow protection gives complete peace of mind.",
    name: "Amina Yusuf",
    role: "Verified Client · Victoria Island",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
  {
    quote: "Excellent customer service and genuine appliances with original warranty cards. The live test bench at their Alaba showroom gave me total confidence.",
    name: "Chukwuma Eze",
    role: "Verified Buyer · Ikeja GRA",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
];

export default function HomePage() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [atozOpen, setAtozOpen] = useState(false);
  const [atozTab, setAtozTab] = useState('atoz');
  const [addedToast, setAddedToast] = useState(null);
  const [categoryScrollIdx, setCategoryScrollIdx] = useState(0);

  // Best Sellers (Top 5 items)
  const bestSellers = MARKETPLACE_ITEMS.slice(0, 5);

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    addItem(
      {
        id: item.id,
        name: item.name,
        category: item.categoryLabel || item.category,
        price_cents: item.price_cents,
        unit: item.unit || 'Piece',
        description: item.desc,
      },
      1
    );
    setAddedToast(item.name);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleCategoryClick = (cat) => {
    if (cat.action === 'atoz') {
      setAtozTab('atoz');
      setAtozOpen(true);
    } else if (cat.link) {
      navigate(cat.link);
    }
  };

  return (
    <div className="fam-homepage">
      {/* Toast Notification */}
      {addedToast && (
        <div className="toast-float-fam">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span><strong>{addedToast}</strong> added to cart!</span>
          <Link to="/cart" className="toast-cart-btn">View Cart →</Link>
        </div>
      )}

      {/* ===== 1. HERO SECTION (FAMSWORLD SPLIT 2-COLUMN PODIUM STYLE) ===== */}
      <section className="fam-hero-section">
        <div className="wrap fam-hero-grid">
          {/* Left Column: Text & CTAs */}
          <div className="fam-hero-left">
            <div className="fam-welcome-pill">
              <span>WELCOME TO HALFCON</span>
            </div>

            <h1 className="fam-hero-headline">
              Home Care &amp; Property Maintenance with<br />
              <span className="text-orange-fam">Electrical &amp; Electronics</span> Sales.
            </h1>

            <p className="fam-hero-subtext">
              From commercial facade cleaning, custom drapes &amp; modular kitchens to solar inverter installations and vetted artisans across Nigeria.
            </p>

            <div className="fam-hero-cta-row">
              <Link to="/shop" className="fam-btn-primary">
                SHOP NOW <span className="arrow-icon">&gt;</span>
              </Link>
              <Link to="/kitchens" className="fam-btn-outline">
                EXPLORE COLLECTION
              </Link>
            </div>

            {/* 4 Micro Feature Trust Pills */}
            <div className="fam-micro-features-grid">
              <div className="micro-feat-item">
                <span className="feat-icon">⭐</span>
                <div>
                  <strong>Premium Quality</strong>
                  <span>Carefully Selected</span>
                </div>
              </div>

              <div className="micro-feat-item">
                <span className="feat-icon">💳</span>
                <div>
                  <strong>Secure Payments</strong>
                  <span>100% Safe &amp; Secure</span>
                </div>
              </div>

              <div className="micro-feat-item">
                <span className="feat-icon">⚡</span>
                <div>
                  <strong>Easy Returns</strong>
                  <span>Hassle Free Returns</span>
                </div>
              </div>

              <div className="micro-feat-item">
                <span className="feat-icon">🎧</span>
                <div>
                  <strong>Customer Support</strong>
                  <span>24/7 Friendly Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Product Podium & Backdrop */}
          <div className="fam-hero-right">
            <div className="fam-podium-stage">
              {/* Sunset Orange Circle Backdrop */}
              <div className="fam-orange-backdrop-circle" />

              {/* Cylindrical Podium Bases */}
              <div className="podium-pedestal base-main">
                {/* Main Hero Product: Solar ESS + Kitchen Suite */}
                <div className="hero-floating-product main-device">
                  <img
                    src="/images/solar-all-in-one-ess.jpg"
                    alt="5KVA Hybrid Solar Inverter"
                    className="img-device"
                  />
                  <div className="device-tag-badge">5KVA ESS Solar Kit</div>
                </div>
              </div>

              <div className="podium-pedestal base-left">
                <div className="hero-floating-product secondary-kitchen" onClick={() => navigate('/kitchens')}>
                  <img
                    src="/kitchens/kitchen-1.webp"
                    alt="Modular Waterfall Kitchen"
                    className="img-kitchen-thumb"
                  />
                  <div className="device-tag-badge">Modular Kitchens</div>
                </div>
              </div>

              <div className="podium-pedestal base-right">
                <div className="hero-floating-product speaker-device" onClick={() => { setAtozTab('atoz'); setAtozOpen(true); }}>
                  <img
                    src="/kitchens/kitchen-3.jpg"
                    alt="Built-in Appliances Suite"
                    className="img-appliance-thumb"
                  />
                  <div className="device-tag-badge">Built-in Suite</div>
                </div>
              </div>

              {/* Verified Trust Stamp Float */}
              <div className="hero-trust-stamp">
                <span className="stamp-icon">🛡️</span>
                <div>
                  <strong>100% GENUINE</strong>
                  <span>Lagos Outlets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. TRUST & VALUE PROPOSITION BAR (4 COLUMNS) ===== */}
      <section className="fam-trust-bar-section">
        <div className="wrap fam-trust-grid">
          <div className="trust-card-fam">
            <span className="t-icon">🚚</span>
            <div>
              <h4>FREE SHIPPING</h4>
              <p>On orders over ₦200,000</p>
            </div>
          </div>

          <div className="trust-card-fam">
            <span className="t-icon">🔄</span>
            <div>
              <h4>30 DAYS RETURNS</h4>
              <p>100% Escrow satisfaction sign-off</p>
            </div>
          </div>

          <div className="trust-card-fam">
            <span className="t-icon">🛡️</span>
            <div>
              <h4>SECURE PAYMENT</h4>
              <p>100% secure Paystack &amp; Bank</p>
            </div>
          </div>

          <div className="trust-card-fam">
            <span className="t-icon">🎧</span>
            <div>
              <h4>24/7 SUPPORT</h4>
              <p>We're here to help anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. SHOP BY CATEGORY (CIRCULAR CARDS CAROUSEL) ===== */}
      <section className="fam-category-section">
        <div className="wrap">
          <div className="fam-section-header-center">
            <h2 className="fam-section-title">
              SHOP BY <span className="underline-orange">CATEGORY</span>
            </h2>
          </div>

          <div className="fam-categories-carousel">
            <div className="categories-grid-row">
              {CIRCULAR_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="cat-circle-card"
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div className="cat-circle-img-wrap">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/kitchens/kitchen-1.webp';
                      }}
                    />
                    <span className="cat-pill-tag">{cat.tag}</span>
                  </div>
                  <h3 className="cat-circle-name">{cat.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. BEST SELLERS PRODUCT GRID ===== */}
      <section className="fam-bestsellers-section">
        <div className="wrap">
          <div className="fam-section-header-between">
            <h2 className="fam-section-title-left">
              BEST <span className="text-orange-fam">SELLERS</span>
            </h2>
            <Link to="/best-sellers" className="view-all-link-fam">
              VIEW ALL
            </Link>
          </div>

          <div className="fam-products-grid-5col">
            {bestSellers.map((item) => (
              <div
                key={item.id}
                className="fam-product-card"
                onClick={() => navigate(`/products/${item.id}`)}
              >
                {/* Top Badges */}
                <div className="fam-card-badge-row">
                  <span className="badge-best-seller">BEST SELLER</span>
                  <button
                    type="button"
                    className="fam-wishlist-btn"
                    onClick={(e) => { e.stopPropagation(); alert(`Added ${item.name} to wishlist!`); }}
                  >
                    ♡
                  </button>
                </div>

                {/* Product Image */}
                <div className="fam-product-image-box">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/solar-all-in-one-ess.jpg';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="fam-product-info">
                  <h4 className="fam-product-name">{item.name}</h4>

                  <div className="fam-stars-row">
                    <span className="fam-stars">★★★★★</span>
                    <span className="fam-review-count">({item.reviews || 84})</span>
                  </div>

                  <div className="fam-price-row">
                    <span className="fam-current-price">{formatNaira(item.price_cents)}</span>
                    {item.originalPrice_cents && (
                      <span className="fam-old-price">{formatNaira(item.originalPrice_cents)}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="fam-btn-add-cart"
                    onClick={(e) => handleAddToCart(e, item)}
                  >
                    🛒 ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. SPECIAL OFFER BANNER (DEEP NAVY + 3D GIFT BOX) ===== */}
      <section className="fam-promo-banner-section">
        <div className="wrap">
          <div className="fam-promo-card">
            <div className="promo-gift-box-illustration">
              <span className="gift-emoji">🎁</span>
            </div>

            <div className="promo-text-content">
              <span className="promo-eyebrow">SPECIAL OFFER</span>
              <h3 className="promo-headline">
                UP TO <span className="highlight-discount">20% OFF</span>
              </h3>
              <p className="promo-details">
                Limited time offer on all appliances, modular kitchens &amp; property services. Use code: <strong>HALFCON20</strong>
              </p>
            </div>

            <Link to="/shop" className="promo-cta-btn">
              SHOP THE SALE &gt;
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 6. WHY SHOP WITH US? (4 COUNTER METRICS) ===== */}
      <section className="fam-why-us-section">
        <div className="wrap">
          <div className="fam-section-header-center">
            <h2 className="fam-section-title">
              WHY <span className="underline-orange">SHOP WITH US?</span>
            </h2>
          </div>

          <div className="fam-why-us-grid">
            <div className="why-us-card">
              <span className="why-icon">👥</span>
              <div>
                <strong className="why-num">10K+</strong>
                <span className="why-label">Happy Customers</span>
              </div>
            </div>

            <div className="why-us-card">
              <span className="why-icon">⭐</span>
              <div>
                <strong className="why-num">4.8</strong>
                <span className="why-label">Customer Rating</span>
              </div>
            </div>

            <div className="why-us-card">
              <span className="why-icon">📦</span>
              <div>
                <strong className="why-num">500+</strong>
                <span className="why-label">Quality Products</span>
              </div>
            </div>

            <div className="why-us-card">
              <span className="why-icon">🛡️</span>
              <div>
                <strong className="why-num">100%</strong>
                <span className="why-label">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. WHAT OUR CUSTOMERS SAY (TESTIMONIALS) ===== */}
      <section className="fam-testimonials-section">
        <div className="wrap">
          <div className="fam-section-header-center">
            <h2 className="fam-section-title">
              WHAT OUR <span className="underline-orange">CUSTOMERS SAY</span>
            </h2>
          </div>

          <div className="fam-testimonials-grid">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="testimonial-card-fam">
                <div className="quote-mark">“</div>
                <div className="test-stars">★★★★★</div>
                <p className="test-quote-text">{t.quote}</p>
                <div className="test-author-row">
                  <img src={t.avatar} alt={t.name} className="test-avatar" />
                  <div>
                    <strong className="test-author-name">{t.name}</strong>
                    <span className="test-author-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive A-Z Kitchen Appliances Directory Modal */}
      <AtoZApplianceDropdown
        isOpen={atozOpen}
        onClose={() => setAtozOpen(false)}
        initialTab={atozTab}
      />
    </div>
  );
}
