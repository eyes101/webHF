// components/Layout.jsx
import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <img src="/logo.png" alt="Halfcon" className="logo-img" />
            </Link>

            <nav className="nav">
              <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>Home</Link>
              <Link to="/services" className={isActive('/services') ? 'nav-link active' : 'nav-link'}>Services</Link>
              <Link to="/services" className="nav-link">Electrical</Link>
              <Link to="/services" className="nav-link">Home Management</Link>
              <Link to="/services" className="nav-link">Office Management</Link>
              {(user?.role === 'staff' || user?.role === 'admin') && (
                <Link to="/staff" className={isActive('/staff') ? 'nav-link active' : 'nav-link'}>Staff</Link>
              )}
            </nav>
          </div>

          <div className="header-right">
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {items.length > 0 && <span className="cart-badge">{items.length}</span>}
            </Link>

            <div className="auth-divider" />

            {user ? (
              <div className="user-menu">
                <span className="user-name">{user.name}</span>
                {user.role === 'customer' && (
                  <Link to="/orders" className="btn-ghost">Orders</Link>
                )}
                <Link to="/settings" className="btn-ghost">Settings</Link>
                <button className="btn-ghost" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log In</Link>
                <Link to="/register" className="btn-green">Register</Link>
              </>
            )}

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/services" className="mobile-link" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link to="/cart" className="mobile-link" onClick={() => setMenuOpen(false)}>Cart {items.length > 0 && `(${items.length})`}</Link>
            {user ? (
              <>
                {user.role === 'customer' && <Link to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>Orders</Link>}
                <Link to="/settings" className="mobile-link" onClick={() => setMenuOpen(false)}>Settings</Link>
                <button className="mobile-link mobile-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="mobile-link mobile-green" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-col">
            <Link to="/" className="footer-logo-link">
              <img src="/logo.png" alt="Halfcon" className="footer-logo-img" />
            </Link>
            <p className="footer-blurb">
              Nigeria's premier provider of electrical, home management, and office management services. Delivering excellence across the nation.
            </p>
            <div className="footer-socials">
              <a href={CONTACTS.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 [...]
              </a>
              <a href={CONTACTS.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47[...]
              </a>
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-heading">Services</div>
            <Link to="/services" className="footer-link">Electrical Services</Link>
            <Link to="/services" className="footer-link">Home Management</Link>
            <Link to="/services" className="footer-link">Office Management</Link>
            <Link to="/services" className="footer-link">Maintenance & Repairs</Link>
            <Link to="/services" className="footer-link">Professional Consulting</Link>
          </div>

          <div className="footer-col">
            <div className="footer-heading">Company</div>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">News &amp; Blog</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>

          <div className="footer-col">
            <div className="footer-heading">Contact</div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-1[...]
              <span>123 Professional Way, Victoria Island, Lagos, Nigeria</span>
            </div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 [...]
              <a href={`tel:${CONTACTS.whatsappDisplay}`} className="footer-link">{CONTACTS.whatsappDisplay}</a>
            </div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1[...]
              <a href={`mailto:${CONTACTS.email}`} className="footer-link">{CONTACTS.email}</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 Halfcon — All rights reserved.</div>
          <div>
            <a href="#" className="footer-bottom-link">Privacy</a>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="#" className="footer-bottom-link">Terms</a>
          </div>
        </div>
      </footer>

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
          <path d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.42.703 4.68 1.92 6.6L3 29l7.1-2.36a12.42 12.42 0 0 0 5.9 1.49h.001c6.894 0 12.5-5.607 12.5-12.5S22.895 3 16.001 3zm0 22.7c-1.9 0-3.71-.[...]
        </svg>
      </a>
    </div>
  );
}
