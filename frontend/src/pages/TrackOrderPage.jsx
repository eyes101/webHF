// pages/TrackOrderPage.jsx — Live Order & Dispatch Tracking
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './TrackOrderPage.css';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate(`/orders/${orderId.trim()}`);
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="track-page">
      <div className="track-hero">
        <div className="wrap">
          <div className="shop-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Track Order</strong>
          </div>
          <h1 className="track-title">Live Order &amp; Dispatch Tracking</h1>
          <p className="track-subtitle">Enter your Order ID or tracking code to monitor real-time fulfillment and rider dispatch across Nigeria.</p>
        </div>
      </div>

      <div className="wrap track-container">
        <div className="track-card">
          <h2 className="track-card-title">Enter Your Order ID</h2>
          <p className="track-card-desc">Your order ID was sent via SMS and Email upon checkout (e.g. <code>ord_17849204</code> or <code>HFC-1029</code>).</p>

          <form onSubmit={handleTrack} className="track-form">
            <div className="track-input-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                required
                placeholder="Enter Order ID (e.g. ord_178829)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="track-input"
              />
            </div>
            <button type="submit" className="btn-track-submit">
              Track Order Status →
            </button>
          </form>

          <div className="track-help-row">
            <span>Need assistance locating your tracking code?</span>
            <a href={whatsappLink('Hi Halfcon, I need help tracking my order')} target="_blank" rel="noopener noreferrer">
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
