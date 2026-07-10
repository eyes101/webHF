// pages/ServiceDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.services.get(slug)
      .then((res) => setService(res.service))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (service) {
      addItem(service, quantity);
      navigate('/cart');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!service) return <div style={{ padding: '40px', textAlign: 'center' }}>Service not found</div>;

  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1 style={{ fontSize: '42px', fontFamily: "'Big Shoulders Display', sans-serif", textTransform: 'uppercase', marginBottom: '20px' }}>
        {service.name}
      </h1>
      <p style={{ color: '#5C6B73', marginBottom: '20px', maxWidth: '600px' }}>
        {service.description}
      </p>
      <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginBottom: '30px' }}>
        {formatNaira(service.price_cents)} / {service.unit}
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '40px' }}>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
          className="input"
          style={{ width: '80px' }}
        />
        <button className="btn btn-solid" onClick={handleAddToCart}>
          Add to cart
        </button>
      </div>
    </div>
  );
}
