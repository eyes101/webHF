// components/Layout.jsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header">
        <div className="wrap header-wrap">
          <div className="logo">
            <img src="/logo.png" alt="Halfcon" className="logo-img" />
            <div className="logo-tag">OPS / DEV / LOGISTICS</div>
          </div>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            {(user?.role === 'staff' || user?.role === 'admin') && <Link to="/staff">Staff</Link>}
          </nav>
          <div className="nav-actions">
            <Link to="/cart" className="nav-cart">
              Cart {items.length > 0 && `(${items.length})`}
            </Link>
            {user ? (
              <div className="user-menu">
                <span>{user.name}</span>
                {user.role === 'customer' && <Link to="/orders" className="btn btn-sm">Orders</Link>}
                <button className="btn btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn">Login</Link>
                <Link to="/register" className="btn btn-solid">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="wrap footer-main">
          <div className="footer-col">
            <img src="/logo.png" alt="Halfcon" className="footer-logo" />
            <p className="footer-blurb">
              Special duties, property development, relocation, and logistics —
              booked, tracked, and paid for in one place.
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-heading mono">CONTACT</div>
            <a href={`mailto:${CONTACTS.email}`} className="footer-link">{CONTACTS.email}</a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="footer-link">
              WhatsApp — {CONTACTS.whatsappDisplay}
            </a>
          </div>

          <div className="footer-col">
            <div className="footer-heading mono">FOLLOW</div>
            <a href={CONTACTS.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
              Instagram {CONTACTS.instagram}
            </a>
            <a href={CONTACTS.facebookUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
              Facebook {CONTACTS.facebook}
            </a>
          </div>
        </div>

        <div className="wrap footer-wrap">
          <div>© 2026 HALFCON — HALFCON.IT.COM</div>
          <div>
            <a href="#">Privacy</a> · <a href="#">Terms</a>
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
