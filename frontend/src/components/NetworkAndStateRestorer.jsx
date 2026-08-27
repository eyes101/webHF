// components/NetworkAndStateRestorer.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './NetworkAndStateRestorer.css';

export default function NetworkAndStateRestorer() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(null);

  // 1. Monitor Online / Offline Network Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Track & Save Last Active Route & Scroll Position
  useEffect(() => {
    const fullPath = location.pathname + location.search + location.hash;

    // Do not save login/register as resume paths
    if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/register') && !location.pathname.startsWith('/staff/login')) {
      localStorage.setItem('halfcon_last_route', fullPath);
      localStorage.setItem('halfcon_last_timestamp', Date.now().toString());
    }

    // Restore scroll position for this specific route if stored
    const savedScroll = sessionStorage.getItem(`halfcon_scroll_${location.pathname}`);
    if (savedScroll) {
      const scrollY = parseInt(savedScroll, 10);
      // Small timeout to allow page content to render
      setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      }, 50);
    }

    // Scroll listener to save continuous reading position
    const handleScroll = () => {
      sessionStorage.setItem(`halfcon_scroll_${location.pathname}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  // 3. Detect if User Reopened Homepage but Left Off on an Inner Page (e.g. Products / Checkout)
  useEffect(() => {
    if (location.pathname === '/') {
      const lastRoute = localStorage.getItem('halfcon_last_route');
      const lastTime = parseInt(localStorage.getItem('halfcon_last_timestamp') || '0', 10);
      const isRecent = Date.now() - lastTime < 1000 * 60 * 60 * 24; // within 24 hours

      if (lastRoute && lastRoute !== '/' && isRecent) {
        // Parse friendly label
        let label = 'previous page';
        if (lastRoute.startsWith('/products/')) label = 'product details';
        else if (lastRoute.startsWith('/services')) label = 'service catalog';
        else if (lastRoute.startsWith('/cart')) label = 'saved cart';
        else if (lastRoute.startsWith('/checkout')) label = 'checkout';
        else if (lastRoute.startsWith('/orders')) label = 'order tracker';

        setResumePrompt({ path: lastRoute, label });
      }
    } else {
      setResumePrompt(null);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="network-banner offline-banner" role="alert">
          <div className="banner-content">
            <span className="banner-icon">📡</span>
            <div className="banner-text">
              <strong>Offline Mode Active:</strong> You can continue browsing cached products and managing your cart.
              Everything will sync automatically once reconnected.
            </div>
          </div>
        </div>
      )}

      {/* Reconnected Toast */}
      {isOnline && showOnlineToast && (
        <div className="network-banner online-banner" role="status">
          <div className="banner-content">
            <span className="banner-icon">🟢</span>
            <div className="banner-text">
              <strong>Back Online!</strong> Connected to Halfcon live inventory &amp; operations servers.
            </div>
            <button
              type="button"
              className="banner-dismiss"
              onClick={() => setShowOnlineToast(false)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Resume Previous Session Floating Pill */}
      {resumePrompt && (
        <div className="resume-session-pill">
          <div className="resume-text">
            <span>👋 Welcome back! Resume your <strong>{resumePrompt.label}</strong>?</span>
          </div>
          <div className="resume-actions">
            <button
              type="button"
              className="resume-btn-go"
              onClick={() => {
                navigate(resumePrompt.path);
                setResumePrompt(null);
              }}
            >
              Resume →
            </button>
            <button
              type="button"
              className="resume-btn-close"
              onClick={() => {
                localStorage.removeItem('halfcon_last_route');
                setResumePrompt(null);
              }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
