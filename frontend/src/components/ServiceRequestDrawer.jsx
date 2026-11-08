// components/ServiceRequestDrawer.jsx
// Slide-out "Request a Service" drawer: a panel that draws out from the
// right edge of the screen over a dimmed backdrop — the pop-up/drawer
// interaction the owner asked us to add after reviewing HireSphere.
// (HireSphere itself has no side drawer at desktop width; Halfcon gets the
// drawer treatment for the same request form it offers on /request-service.)
//
// Behaviour:
// - Opens with a slide-in animation; backdrop click, the ✕ button, and the
//   Escape key all close it (better than HireSphere's sign-in modal, which
//   can only be dismissed via its "Not now" link).
// - Locks body scroll while open and moves focus to the close button.
// - Full-width on small screens; respects prefers-reduced-motion.
import React, { useEffect, useRef } from 'react';
import ServiceRequestForm from './ServiceRequestForm';
import './ServiceRequestDrawer.css';

export default function ServiceRequestDrawer({ open, onClose, initialCategory = '', initialServiceName = '' }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sr-drawer-root">
      <div className="sr-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        className="sr-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Request a service"
      >
        <div className="sr-drawer-header">
          <button
            type="button"
            ref={closeRef}
            className="sr-drawer-close"
            onClick={onClose}
            aria-label="Close request drawer"
          >
            ✕
          </button>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#FBBF24', letterSpacing: '0.06em', marginBottom: '5px' }}>
            📋 Post a Service Request
          </div>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '27px', fontWeight: 900, textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
            Tell Us the Job
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', marginTop: '5px', lineHeight: 1.5 }}>
            Describe what you need and Halfcon Operations will reply on WhatsApp — no booking fee, no middleman.
          </p>
        </div>

        <div className="sr-drawer-body">
          <ServiceRequestForm
            key={`${initialCategory}|${initialServiceName}`}
            initialCategory={initialCategory}
            initialServiceName={initialServiceName}
          />
        </div>
      </aside>
    </div>
  );
}
