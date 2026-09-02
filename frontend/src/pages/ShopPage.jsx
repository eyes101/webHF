// pages/ShopPage.jsx — Full E-Commerce Catalog & Appliances Store
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MARKETPLACE_ITEMS, MARKETPLACE_CATEGORIES } from '../data/products';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';
import AtoZApplianceDropdown from '../components/AtoZApplianceDropdown';
import './ShopPage.css';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'
  const [priceMax, setPriceMax] = useState(250000000); // 2.5m Naira
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [atozOpen, setAtozOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(null);

  const { addItem } = useCart();
  const navigate = useNavigate();

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = MARKETPLACE_ITEMS.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = item.price_cents <= priceMax;
      return matchCat && matchSearch && matchPrice;
    });

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price_cents - b.price_cents);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price_cents - a.price_cents);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy, priceMax]);

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
      {/* Top Banner */}
      <div className="shop-hero-banner">
        <div className="wrap">
          <div className="shop-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Shop Catalog</strong>
          </div>
          <h1 className="shop-hero-title">Appliances, Solar &amp; Property Hardware</h1>
          <p className="shop-hero-desc">
            Explore genuine OEM equipment, solar inverters, and modular kitchen hardware with active 20% discount.
          </p>
          <div className="shop-hero-actions">
            <button
              type="button"
              className="btn-atoz-trigger"
              onClick={() => setAtozOpen(true)}
            >
              📖 Browse A-Z Kitchen Appliances Directory ▾
            </button>
            <Link to="/kitchens" className="btn-kitchens-link">
              🍳 Custom Modular Kitchens Suite →
            </Link>
          </div>
        </div>
      </div>

      <div className="wrap shop-main-container">
        {/* Toast Notification */}
        {addedToast && (
          <div className="added-toast-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>{addedToast}</strong> added to cart!</span>
            <Link to="/cart" className="toast-cart-link">View Cart &amp; Checkout →</Link>
          </div>
        )}

        {/* Layout with Sidebar Filters and Main Grid */}
        <div className="shop-layout">
          {/* Sidebar Filters */}
          <aside className="shop-sidebar">
            <div className="filter-card">
              <h3 className="filter-heading">Categories</h3>
              <ul className="category-filter-list">
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      className={`cat-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSearchParams(cat.id === 'all' ? {} : { category: cat.id });
                      }}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-label">{cat.label}</span>
                      <span className="cat-count">
                        {cat.id === 'all'
                          ? MARKETPLACE_ITEMS.length
                          : MARKETPLACE_ITEMS.filter((i) => i.category === cat.id).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="filter-card">
              <h3 className="filter-heading">Filter by Price</h3>
              <div className="price-slider-wrap">
                <input
                  type="range"
                  min="1000000"
                  max="250000000"
                  step="1000000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-range-labels">
                  <span>Up to:</span>
                  <strong>{formatNaira(priceMax)}</strong>
                </div>
              </div>
            </div>

            {/* Outlets Trust Box */}
            <div className="filter-card filter-trust-box">
              <h4>📍 Store Outlets</h4>
              <p><strong>Ikorodu:</strong> No. 6 Adebisi Close, Isawo Rd, Agric</p>
              <p><strong>Alaba:</strong> Shop H106B, Alaba Int'l Market, Ojo</p>
              <div className="trust-hotline">
                <span>Hotline / WhatsApp:</span>
                <a href="tel:+2348137321877">+234 813 732 1877</a>
              </div>
            </div>
          </aside>

          {/* Main Products Area */}
          <main className="shop-content">
            {/* Controls Bar */}
            <div className="shop-controls-bar">
              {/* Search Bar */}
              <div className="shop-search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search products, solar, cables, appliances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shop-search-input"
                />
                {searchQuery && (
                  <button type="button" className="shop-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>

              {/* Sort & Count */}
              <div className="shop-sort-wrap">
                <span className="products-count">Showing <strong>{filteredProducts.length}</strong> items</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="shop-sort-select"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>

                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid View"
                  >
                    ⊞
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List View"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid / List */}
            {filteredProducts.length === 0 ? (
              <div className="shop-empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try resetting filters or search for another appliance keyword.</p>
                <button
                  type="button"
                  className="btn btn-solid btn-md"
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setPriceMax(250000000); }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`shop-products-${viewMode}`}>
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    className="product-card-fam"
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    {/* Top Badges & Wishlist */}
                    <div className="card-top-bar">
                      <span className="badge-discount">{item.discount || '20% OFF'}</span>
                      {item.tag && <span className="badge-tag">{item.tag}</span>}
                      <button
                        type="button"
                        className="wishlist-btn"
                        onClick={(e) => { e.stopPropagation(); alert(`Added ${item.name} to wishlist!`); }}
                        title="Add to Wishlist"
                      >
                        ♡
                      </button>
                    </div>

                    {/* Image */}
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

                    {/* Details */}
                    <div className="product-body">
                      <span className="product-cat-name">{item.categoryLabel || item.category}</span>
                      <h4 className="product-title">{item.name}</h4>

                      <div className="product-rating-row">
                        <span className="stars">★★★★★</span>
                        <span className="rating-num">({item.reviews || 48})</span>
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
            )}
          </main>
        </div>
      </div>

      {/* Interactive A-Z Kitchen Appliances Directory */}
      <AtoZApplianceDropdown
        isOpen={atozOpen}
        onClose={() => setAtozOpen(false)}
        initialTab="atoz"
      />
    </div>
  );
}
