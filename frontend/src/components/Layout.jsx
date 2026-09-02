// components/Layout.jsx — Universal Header, Navigation & Footer (FAMSWORLD Design)
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CONTACTS, whatsappLink } from '../config/contacts';
import ReceptionistChatBot from './ReceptionistChatBot';
import NetworkAndStateRestorer from './NetworkAndStateRestorer';
import AtoZApplianceDropdown from './AtoZApplianceDropdown';
import './Layout.css';

export default function Layout() {
  const { user, isEmailVerified, logout, resendVerificationEmail } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [atozOpen, setAtozOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const shopRef = useRef(null);
  const servicesRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (shopRef.current && !shopRef.current.contains(e.target)) {
        setShopDropdownOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/shop?q=${encodeURIComponent(headerSearch.trim())}`);
      setSearchOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout-root">
      {/* Offline Status & State / Scroll Restorer */}
      <NetworkAndStateRestorer />

      {/* TOP ANNOUNCEMENT BAR (Dark Navy) */}
      <div className="top-utility-bar">
        <div className="wrap top-utility-inner">
          <div className="top-utility-item">
            <span>🚚</span>
            <span>Free Lagos Delivery on Orders Over ₦200,000</span>
          </div>
          <div className="top-utility-item center-item">
            <span>🔄</span>
            <span>100% Escrow Protection &amp; 6-Month Warranty</span>
          </div>
          <div className="top-utility-item right-item">
            <span>🎧</span>
            <span>24/7 Hotline: <a href="tel:+2348137321877">+234 813 732 1877</a></span>
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR (Crisp White) */}
      <header className="main-header">
        <div className="wrap header-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo-fam">
            <img
              src="/logo.png"
              alt="Halfcon Logo"
              className="logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="brand-name">HALFCON</span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="desktop-nav">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
              HOME
            </Link>

            {/* Shop Dropdown */}
            <div className="nav-dropdown-item" ref={shopRef}>
              <button
                type="button"
                className={`nav-item dropdown-btn ${isActive('/shop') || isActive('/products') ? 'active' : ''}`}
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                onMouseEnter={() => setShopDropdownOpen(true)}
              >
                SHOP ▾
              </button>
              {shopDropdownOpen && (
                <div className="mega-dropdown-menu" onMouseLeave={() => setShopDropdownOpen(false)}>
                  <Link to="/shop" className="dropdown-link" onClick={() => setShopDropdownOpen(false)}>
                    <strong>All Products Catalog</strong>
                    <span>Complete inventory of genuine electronics</span>
                  </Link>
                  <Link to="/kitchens" className="dropdown-link" onClick={() => setShopDropdownOpen(false)}>
                    <strong>🍳 Modular Kitchens Suite</strong>
                    <span>Waterfall islands &amp; built-in appliances</span>
                  </Link>
                  <button
                    type="button"
                    className="dropdown-link"
                    onClick={() => { setAtozOpen(true); setShopDropdownOpen(false); }}
                    style={{ textAlign: 'left', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <strong>📖 A-Z Kitchen Appliances Directory</strong>
                    <span>Air fryers to Yam pounders A-Z guide</span>
                  </button>
                  <Link to="/shop?category=appliances" className="dropdown-link" onClick={() => setShopDropdownOpen(false)}>
                    <strong>🔋 Solar &amp; Inverter Systems</strong>
                    <span>5KVA ESS &amp; LiFePO4 batteries</span>
                  </Link>
                  <Link to="/shop?category=ac-cooling" className="dropdown-link" onClick={() => setShopDropdownOpen(false)}>
                    <strong>❄️ AC &amp; Climate Cooling</strong>
                    <span>Inverter split ACs &amp; standing fans</span>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/best-sellers" className={`nav-item ${isActive('/best-sellers') ? 'active' : ''}`}>
              BEST SELLERS
            </Link>

            <Link to="/new-arrivals" className={`nav-item ${isActive('/new-arrivals') ? 'active' : ''}`}>
              NEW ARRIVALS
            </Link>

            <Link to="/kitchens" className={`nav-item kitchen-highlight ${isActive('/kitchens') ? 'active' : ''}`}>
              MODULAR KITCHENS
            </Link>

            {/* Services Dropdown */}
            <div className="nav-dropdown-item" ref={servicesRef}>
              <button
                type="button"
                className={`nav-item dropdown-btn ${isActive('/services') ? 'active' : ''}`}
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                onMouseEnter={() => setServicesDropdownOpen(true)}
              >
                SERVICES ▾
              </button>
              {servicesDropdownOpen && (
                <div className="mega-dropdown-menu" onMouseLeave={() => setServicesDropdownOpen(false)}>
                  <Link to="/services" className="dropdown-link" onClick={() => setServicesDropdownOpen(false)}>
                    <strong>All Property Services</strong>
                    <span>Escrow-backed certified maintenance</span>
                  </Link>
                  <Link to="/services?category=Cleaning" className="dropdown-link" onClick={() => setServicesDropdownOpen(false)}>
                    <strong>🧹 Industrial &amp; Deep Cleaning</strong>
                    <span>High-rise facade &amp; floor scrubbing</span>
                  </Link>
                  <Link to="/services?category=Logistics" className="dropdown-link" onClick={() => setServicesDropdownOpen(false)}>
                    <strong>🚚 Express Logistics</strong>
                    <span>Same-day dispatch across Lagos &amp; Nigeria</span>
                  </Link>
                  <Link to="/services?category=Special%20Duties" className="dropdown-link" onClick={() => setServicesDropdownOpen(false)}>
                    <strong>🛡️ Special Duties</strong>
                    <span>Site security &amp; property protocols</span>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/artisans" className={`nav-item ${isActive('/artisans') ? 'active' : ''}`}>
              ARTISANS
            </Link>

            <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
              ABOUT US
            </Link>

            <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>
              CONTACT US
            </Link>
          </nav>

          {/* Right Utility Icons (FAMSWORLD style) */}
          <div className="header-utility-icons">
            {/* Search Toggle */}
            <button
              type="button"
              className="icon-action-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              title="Search Products"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>

            {/* Account / Profile */}
            {user ? (
              <div className="user-icon-menu">
                <Link to="/orders" className="icon-action-btn" title="My Orders & Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
                {(user.role === 'staff' || user.role === 'admin') && (
                  <Link to="/staff" className="badge-staff-link">Staff</Link>
                )}
                <button type="button" onClick={handleLogout} className="logout-mini-btn" title="Logout">✕</button>
              </div>
            ) : (
              <Link to="/login" className="icon-action-btn" aria-label="Account Login" title="Sign In">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            )}

            {/* Wishlist Icon */}
            <button
              type="button"
              className="icon-action-btn"
              onClick={() => navigate('/shop')}
              title="Saved Items / Wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>

            {/* Cart Icon with Counter */}
            <Link to="/cart" className="cart-action-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className="cart-counter-fam">{items.length}</span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              className="mobile-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Search Dropdown Bar */}
        {searchOpen && (
          <div className="header-search-bar-expand">
            <form onSubmit={handleSearchSubmit} className="wrap search-form-expand">
              <input
                type="text"
                placeholder="Search over 500+ kitchen appliances, solar inverters, electrical fittings..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                autoFocus
                className="search-expand-input"
              />
              <button type="submit" className="search-expand-btn">Search Store</button>
              <button type="button" className="search-close-btn" onClick={() => setSearchOpen(false)}>✕</button>
            </form>
          </div>
        )}

        {/* Mobile Slide-Out Menu */}
        {menuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-nav-links">
              <Link to="/" className="m-link" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/shop" className="m-link" onClick={() => setMenuOpen(false)}>Shop All Products</Link>
              <Link to="/kitchens" className="m-link highlight" onClick={() => setMenuOpen(false)}>🍳 Modular Kitchens Suite</Link>
              <button
                type="button"
                className="m-link m-btn"
                onClick={() => { setAtozOpen(true); setMenuOpen(false); }}
              >
                📖 A-Z Kitchen Appliances Directory
              </button>
              <Link to="/best-sellers" className="m-link" onClick={() => setMenuOpen(false)}>🔥 Best Sellers</Link>
              <Link to="/new-arrivals" className="m-link" onClick={() => setMenuOpen(false)}>✨ New Arrivals</Link>
              <Link to="/services" className="m-link" onClick={() => setMenuOpen(false)}>Services Hub</Link>
              <Link to="/artisans" className="m-link" onClick={() => setMenuOpen(false)}>Verified Artisans</Link>
              <Link to="/about" className="m-link" onClick={() => setMenuOpen(false)}>About Us</Link>
              <Link to="/contact" className="m-link" onClick={() => setMenuOpen(false)}>Contact &amp; Outlets</Link>
              <Link to="/track" className="m-link" onClick={() => setMenuOpen(false)}>Track My Order</Link>
              <Link to="/faq" className="m-link" onClick={() => setMenuOpen(false)}>FAQ &amp; Escrow Help</Link>

              <div className="m-auth-box">
                {user ? (
                  <>
                    <Link to="/orders" className="m-auth-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    {(user.role === 'staff' || user.role === 'admin') && (
                      <Link to="/staff" className="m-auth-link" onClick={() => setMenuOpen(false)}>Staff Dashboard</Link>
                    )}
                    <button className="m-auth-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="m-auth-link" onClick={() => setMenuOpen(false)}>Log In</Link>
                    <Link to="/register" className="m-auth-btn-register" onClick={() => setMenuOpen(false)}>Register Account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN ROUTE CONTENT */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* FAMSWORLD STYLE NEWSLETTER SUBSCRIPTION STRIP */}
      <section className="newsletter-section-fam">
        <div className="wrap newsletter-inner">
          <div className="newsletter-left">
            <div className="newsletter-icon">✉️</div>
            <div>
              <h3 className="newsletter-title">JOIN THE HALFCON FAMILY</h3>
              <p className="newsletter-sub">
                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
              </p>
            </div>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="newsletter-form-box">
            {newsletterSubscribed ? (
              <span className="newsletter-success">🎉 Thank you for subscribing! Check your inbox.</span>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">
                  SUBSCRIBE &gt;
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* FAMSWORLD STYLE COMPREHENSIVE FOOTER */}
      <footer className="footer-fam">
        <div className="wrap footer-grid-fam">
          {/* Col 1: Brand & Socials */}
          <div className="footer-col-fam brand-col">
            <div className="footer-logo">
              <img
                src="/logo.png"
                alt="Halfcon Logo"
                className="logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="brand-name-footer">HALFCON</span>
            </div>
            <p className="footer-blurb-fam">
              HALFCON delivers quality products and verified artisan property maintenance you can trust, at prices you will love. Your satisfaction is our priority.
            </p>
            <div className="footer-social-icons">
              <a href={CONTACTS.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">ⓕ</a>
              <a href={CONTACTS.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">📸</a>
              <a href={CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
              <a href={`mailto:${CONTACTS.email}`} aria-label="Email">✉️</a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="footer-col-fam">
            <h4 className="footer-title">SHOP</h4>
            <ul className="footer-links-list">
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/kitchens">Modular Kitchens</Link></li>
              <li><Link to="/best-sellers">Best Sellers</Link></li>
              <li><Link to="/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/track">Track Order</Link></li>
              <li><Link to="/shop?category=appliances">Solar Deals</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="footer-col-fam">
            <h4 className="footer-title">CUSTOMER SERVICE</h4>
            <ul className="footer-links-list">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">Shipping Policy</Link></li>
              <li><Link to="/faq">Return &amp; Refund Policy</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/track">Live Order Tracker</Link></li>
            </ul>
          </div>

          {/* Col 4: About Us */}
          <div className="footer-col-fam">
            <h4 className="footer-title">ABOUT US</h4>
            <ul className="footer-links-list">
              <li><Link to="/about">About HALFCON</Link></li>
              <li><Link to="/about">Our Story &amp; Outlets</Link></li>
              <li><Link to="/artisans">Artisan Standards</Link></li>
              <li><Link to="/staff/login">Staff Portal</Link></li>
              <li><Link to="/faq">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Col 5: We Accept & Currency */}
          <div className="footer-col-fam payment-col">
            <h4 className="footer-title">WE ACCEPT</h4>
            <div className="payment-badges-wrap">
              <span className="pay-badge visa">VISA</span>
              <span className="pay-badge mastercard">Mastercard</span>
              <span className="pay-badge paystack">Paystack</span>
              <span className="pay-badge bank">Bank Transfer</span>
              <span className="pay-badge escrow">Escrow</span>
            </div>
            <div className="outlet-mini-note">
              <strong>Showrooms:</strong>
              <p>Ikorodu &amp; Alaba Int'l Market, Lagos</p>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="footer-bottom-bar-fam">
          <div className="wrap footer-bottom-inner">
            <p>© 2026 HALFCON. Quality &amp; Trust. All Rights Reserved.</p>
            <div className="currency-selector">
              <span>Currency: <strong>NGN ₦</strong> (Nigeria)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Receptionist Chatbot */}
      <ReceptionistChatBot />

      {/* Interactive A-Z Appliances & Showroom Directory Modal */}
      <AtoZApplianceDropdown
        isOpen={atozOpen}
        onClose={() => setAtozOpen(false)}
        initialTab="atoz"
      />
    </div>
  );
}
