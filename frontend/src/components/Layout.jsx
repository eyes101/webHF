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
              <Link to="/services" className="nav-link">Logistics</Link>
              <Link to="/services" className="nav-link">Special Duties</Link>
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
              Nigeria's premier logistics, special duties, and property development company. Delivering excellence across the nation.
            </p>
            <div className="footer-socials">
              <a href={CONTACTS.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={CONTACTS.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-heading">Services</div>
            <Link to="/services" className="footer-link">Express Logistics</Link>
            <Link to="/services" className="footer-link">Special Duties</Link>
            <Link to="/services" className="footer-link">Property Development</Link>
            <Link to="/services" className="footer-link">Corporate Fulfillment</Link>
            <Link to="/services" className="footer-link">Haulage</Link>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>123 Logistics Way, Victoria Island, Lagos, Nigeria</span>
            </div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href={`tel:${CONTACTS.whatsappDisplay}`} className="footer-link">{CONTACTS.whatsappDisplay}</a>
            </div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
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
          <path d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.42.703 4.68 1.92 6.6L3 29l7.1-2.36a12.42 12.42 0 0 0 5.9 1.49h.001c6.894 0 12.5-5.607 12.5-12.5S22.895 3 16.001 3zm0 22.7c-1.9 0-3.71-.5-5.27-1.45l-.38-.22-4.21 1.4 1.41-4.1-.25-.4a10.18 10.18 0 0 1-1.55-5.43c0-5.65 4.6-10.25 10.25-10.25 5.65 0 10.25 4.6 10.25 10.25 0 5.66-4.6 10.2-10.25 10.2zm5.62-7.68c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.69.15-.2.3-.79 1-0.97 1.2-.18.2-.36.23-.66.08-.31-.15-1.3-.48-2.47-1.52-.91-.81-1.53-1.82-1.71-2.12-.18-.3-.02-.47.13-.62.15-.15.34-.39.51-.58.17-.2.23-.34.34-.56.11-.23.06-.42-.03-.58-.09-.15-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.46-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.36-.27.3-1.03 1.01-1.03 2.47s1.06 2.86 1.21 3.06c.15.2 2.07 3.16 5.02 4.31 2.95 1.15 2.95.77 3.48.72.53-.05 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.13-.26-.2-.57-.34z"/>
        </svg>
      </a>
    </div>
  );
}
