// components/Toast.jsx
import React, { useEffect, useState } from 'react';

// Imperative toast notifications: call showToast('...') from anywhere —
// event handlers, catch blocks, plain helpers — no hooks or context needed.
// <ToastHost /> is mounted once in App.jsx and renders what is dispatched.
export function showToast(message) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('halfcon-toast', { detail: { message: String(message) } })
  );
}

let nextId = 1;

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const id = nextId++;
      const message = (e.detail && e.detail.message) || '';
      if (!message) return;
      setToasts((prev) => [...prev.slice(-2), { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    window.addEventListener('halfcon-toast', onToast);
    return () => window.removeEventListener('halfcon-toast', onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      role="status"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: 'calc(100% - 32px)',
        maxWidth: '440px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: 'auto',
            background: '#0F1B4C',
            color: '#ffffff',
            fontSize: '14px',
            lineHeight: 1.45,
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(15, 27, 76, 0.35)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{t.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '16px', cursor: 'pointer', padding: '0 2px' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
