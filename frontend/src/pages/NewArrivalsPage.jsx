// pages/NewArrivalsPage.jsx — New In Stock & Latest Releases
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MARKETPLACE_ITEMS } from '../data/products';
import { formatNaira } from '../utils/currency';
import './ShopPage.css';

export default function NewArrivalsPage() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [addedToast, setAddedToast] = useState(null);

  // New arrivals (first 6 items or latest)
  const newArrivals = MARKETPLACE_ITEMS.slice(0, 8);

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

  return (
    <div className="shop-page">
      <div className="shop-hero-banner" style={{ background: 'linear-gradient(135deg, #0F1B4C 0%, #1D4ED8 60%, #0F1B4C 100%)' }}>
        <div className="wrap">
          <div className="shop-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>New Arrivals</strong>
          </div>
          <h1 className="shop-hero-title">✨ New Arrivals &amp; 2026 In-Stock Catalog</h1>
          <p className="shop-hero-desc">
            Recently dispatched to our Ikorodu warehouse &amp; Alaba international showroom. Available for immediate same-day delivery.
          </p>
        </div>
      </div>

      <div className="wrap shop-main-container">
        {addedToast && (
          <div className="added-toast-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>{addedToast}</strong> added to cart!</span>
            <Link to="/cart" className="toast-cart-link">View Cart &amp; Checkout →</Link>
          </div>
        )}

        <div className="shop-products-grid" style={{ marginTop: '20px' }}>
          {newArrivals.map((item) => (
            <div
              key={item.id}
              className="product-card-fam"
              onClick={() => navigate(`/products/${item.id}`)}
            >
              <div className="card-top-bar">
                <span className="badge-discount" style={{ background: '#2563EB' }}>NEW ARRIVAL</span>
                <span className="badge-tag">{item.discount || '20% OFF'}</span>
                <button
                  type="button"
                  className="wishlist-btn"
                  onClick={(e) => { e.stopPropagation(); alert(`Added ${item.name} to wishlist!`); }}
                >
                  ♡
                </button>
              </div>

              <div className="product-img-box">
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

              <div className="product-body">
                <span className="product-cat-name">{item.categoryLabel || item.category}</span>
                <h4 className="product-title">{item.name}</h4>

                <div className="product-rating-row">
                  <span className="stars">★★★★★</span>
                  <span className="rating-num">({item.reviews || 35})</span>
                </div>

                <div className="product-price-row">
                  <span className="current-price">{formatNaira(item.price_cents)}</span>
                  {item.originalPrice_cents && (
                    <span className="original-price">{formatNaira(item.originalPrice_cents)}</span>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-add-cart-orange"
                  onClick={(e) => handleAddToCart(e, item)}
                >
                  🛒 ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
