// pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const item = getProductById(id);
    if (item) {
      setProduct(item);
      setActiveImage(item.image);
      setQuantity(1);
      setRelated(getRelatedProducts(item.category, item.id));
    } else {
      setProduct(null);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="wrap" style={{ padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '40px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Product Not Found
        </h1>
        <p style={{ color: 'var(--steel)', marginBottom: '28px' }}>
          The requested appliance or hardware item could not be located in our inventory.
        </p>
        <Link to="/#marketplace" className="btn btn-solid btn-lg">
          Browse All Products &amp; Sales
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        category: product.categoryLabel || product.category,
        price_cents: product.price_cents,
        unit: product.unit,
        description: product.desc,
      },
      quantity
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  const handleBuyNow = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        category: product.categoryLabel || product.category,
        price_cents: product.price_cents,
        unit: product.unit,
        description: product.desc,
      },
      quantity
    );
    navigate('/checkout');
  };

  const savingsCents = (product.originalPrice_cents || 0) - (product.price_cents || 0);

  return (
    <div className="product-page-wrap wrap">
      {/* Breadcrumb Navigation */}
      <nav className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <a href="/#marketplace">Products</a>
        <span className="sep">/</span>
        <span className="current">{product.categoryLabel || product.category}</span>
        <span className="sep">/</span>
        <span className="current-name">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="product-layout-grid">
        {/* Left Column: Multi-Angle High-Res Gallery */}
        <div className="product-gallery-card">
          <div className="product-main-image-wrap">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="product-main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/solar-all-in-one-ess.jpg';
              }}
            />
            <div className="product-discount-pill">{product.discount}</div>
          </div>

          {/* Interactive Multi-Angle Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="product-thumb-carousel">
              {product.gallery.map((imgUrl, gIdx) => (
                <button
                  key={gIdx}
                  type="button"
                  className={`product-thumb-btn ${activeImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${gIdx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Stock, Purchase & Action Hub */}
        <div className="product-info-hub">
          <div className="product-badge-row">
            <span className="product-tag-badge">{product.tag}</span>
            <span className="product-sku">SKU: {product.sku}</span>
          </div>

          <h1 className="product-headline">{product.name}</h1>

          {/* Ratings & Reviews */}
          <div className="product-ratings-row">
            <span className="stars">★★★★★</span>
            <span className="rating-score">{product.rating}</span>
            <span className="reviews-tally">({product.reviews} verified customer reviews)</span>
            <span className="orders-badge">🔥 100% In Stock</span>
          </div>

          {/* Pricing Box */}
          <div className="product-price-card">
            <div className="price-main-line">
              <span className="price-active">{formatNaira(product.price_cents)}</span>
              {product.originalPrice_cents && (
                <span className="price-strikethrough">{formatNaira(product.originalPrice_cents)}</span>
              )}
              <span className="savings-badge">20% Promotional Discount</span>
            </div>
            {savingsCents > 0 && (
              <div className="savings-callout">
                🎉 You save <strong>{formatNaira(savingsCents)}</strong> instantly with code <code>HALFCON20</code>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="product-lead-desc">{product.desc}</p>

          {/* Outlet & Showroom Availability */}
          <div className="product-store-status">
            <div className="store-status-item">
              <span className="status-dot green" />
              <div>
                <strong>Showroom Pickup &amp; Dispatch:</strong>
                <div>{product.stockLocation}</div>
              </div>
            </div>
            <div className="store-status-item">
              <span className="status-dot blue" />
              <div>
                <strong>Delivery Speed:</strong> Same-day dispatch across Lagos &middot; 24-48hrs Nationwide.
              </div>
            </div>
          </div>

          {/* Quantity Stepper & Actions */}
          <div className="product-purchase-box">
            <div className="qty-row">
              <label className="qty-label">Quantity ({product.unit}):</label>
              <div className="qty-stepper">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="qty-input"
                />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <div className="qty-subtotal">
                Subtotal: <strong>{formatNaira(product.price_cents * quantity)}</strong>
              </div>
            </div>

            {/* Added Toast */}
            {addedToast && (
              <div className="product-added-toast">
                <span>✓ Added to cart!</span>
                <Link to="/cart" className="toast-cart-btn">View Cart &amp; Checkout →</Link>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="product-cta-buttons">
              <button
                type="button"
                className="btn btn-solid btn-lg btn-cart-action"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>

              <button
                type="button"
                className="btn btn-dark btn-lg btn-buy-action"
                onClick={handleBuyNow}
              >
                ⚡ Instant Buy Now
              </button>

              <a
                href={whatsappLink(`Hello Halfcon, I am on the website viewing "${product.name}" (${formatNaira(product.price_cents)}) and would like to place an order.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-green btn-lg btn-wa-action"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
                Order on WhatsApp
              </a>
            </div>
          </div>

          {/* Buyer Trust & Protection Badges */}
          <div className="product-trust-grid">
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <div>
                <strong>{product.warranty || 'Official Warranty'}</strong>
                <div>100% Genuine Certified Hardware</div>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💳</span>
              <div>
                <strong>Encrypted Paystack Payments</strong>
                <div>Naira Debit Cards, USSD, Bank Transfer</div>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">👨‍🔧</span>
              <div>
                <strong>Expert Installation Available</strong>
                <div>Certified Halfcon electrical engineers</div>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">📞</span>
              <div>
                <strong>Direct Dispatch Hotline</strong>
                <div>{CONTACTS.whatsappDisplay} / {CONTACTS.phoneSecondary}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Section */}
      <section className="product-specs-section">
        <h2 className="section-title-sm">Technical Specifications &amp; Inclusions</h2>
        <div className="specs-table-card">
          <table className="specs-table">
            <tbody>
              {product.specs.map((spec, sIdx) => (
                <tr key={sIdx}>
                  <td className="spec-check">✓</td>
                  <td className="spec-text">{spec}</td>
                </tr>
              ))}
              <tr>
                <td className="spec-check">✓</td>
                <td className="spec-text">Physical Stock Inspection Available at Ikorodu &amp; Alaba Outlets</td>
              </tr>
              <tr>
                <td className="spec-check">✓</td>
                <td className="spec-text">Instant Digital Invoice &amp; Official Halfcon Receipt Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <section className="related-products-section">
          <div className="related-header">
            <div>
              <div className="related-eyebrow">Complementary Hardware</div>
              <h2 className="section-title-sm">Frequently Bought Together</h2>
            </div>
            <a href="/#marketplace" className="btn btn-ghost">View All Products →</a>
          </div>

          <div className="related-grid">
            {related.map((rel) => (
              <div
                key={rel.id}
                className="related-card"
                onClick={() => navigate(`/products/${rel.id}`)}
              >
                <div className="related-img-wrap">
                  <img src={rel.image} alt={rel.name} loading="lazy" />
                  <span className="related-discount">{rel.discount}</span>
                </div>
                <div className="related-card-body">
                  <h3 className="related-title">{rel.name}</h3>
                  <div className="related-price">{formatNaira(rel.price_cents)}</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-solid"
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${rel.id}`);
                    }}
                  >
                    View Product Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
