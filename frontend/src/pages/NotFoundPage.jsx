// pages/NotFoundPage.jsx — designed 404 for mistyped / moved links
import React from 'react';
import { Link } from 'react-router-dom';
import { whatsappLink } from '../config/contacts';

export default function NotFoundPage() {
  return (
    <div className="wrap" style={{ padding: '90px 24px', textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '110px', fontWeight: 900, lineHeight: 1, color: 'var(--navy, #0F1B4C)' }}>
        4<span style={{ color: 'var(--rust)' }}>0</span>4
      </div>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '34px', fontWeight: 900, textTransform: 'uppercase', margin: '10px 0 12px' }}>
        This page doesn't exist
      </h1>
      <p style={{ color: 'var(--steel)', lineHeight: 1.65, marginBottom: '30px' }}>
        The link may be old or mistyped — but whatever you were looking for, we can help you find it.
        Here are the places most customers head to:
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '26px' }}>
        <Link to="/services" className="btn btn-solid btn-lg">Browse Services</Link>
        <Link to="/shop" className="btn btn-outline btn-lg">Shop Products</Link>
        <Link to="/" className="btn btn-outline btn-lg">Go Home</Link>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--steel)' }}>
        Still stuck?{' '}
        <a href={whatsappLink('Hi Halfcon, I followed a link on your website and landed on a missing page.')} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--green)' }}>
          Ask us on WhatsApp
        </a>
        {' '}— or <Link to="/track" style={{ fontWeight: 700 }}>track your order</Link> if that's what you came for.
      </p>
    </div>
  );
}
