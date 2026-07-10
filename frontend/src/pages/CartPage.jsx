import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="wrap" style={{ padding: '60px 32px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px' }}>Your cart is empty</h1>
        <button className="btn btn-solid" onClick={() => navigate('/services')}>
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1 style={{ marginBottom: '30px' }}>Shopping cart</h1>
      {items.map((item) => (
        <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #D8D3C6' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
            <div style={{ fontSize: '13px', color: '#5C6B73' }}>{item.description}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.cartItemId, parseInt(e.target.value, 10))}
              className="input"
              style={{ width: '60px' }}
            />
            <button className="btn btn-sm" onClick={() => removeItem(item.cartItemId)}>Remove</button>
          </div>
        </div>
      ))}
      <div style={{ padding: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
        <span>Total:</span>
        <span>{formatNaira(total)}</span>
      </div>
      <button className="btn btn-solid" onClick={() => navigate('/checkout')} style={{ marginTop: '20px' }}>
        Proceed to checkout
      </button>
    </div>
  );
}
