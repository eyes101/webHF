// context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Promo codes mirrored here for instant feedback in the cart.
// The server re-validates the code when the order is created
// (functions/src/routes/orders.js) and is the source of truth.
export const PROMO_CODES = { HALFCON20: 20 };

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('halfcon_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('halfcon_cart', JSON.stringify(items));
    } catch (err) {
      console.warn('Could not save cart to localStorage:', err);
    }
  }, [items]);

  const addItem = (service, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === service.id);
      if (existing) {
        return prev.map((i) =>
          i.id === service.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...service, quantity, cartItemId: Date.now() + Math.random() }];
    });
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
    } else {
      setItems((prev) =>
        prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
      );
    }
  };

  const removeItem = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clear = () => {
    setItems([]);
    setPromo(null);
    try {
      localStorage.removeItem('halfcon_cart');
    } catch {}
  };

  const [promo, setPromo] = useState(() => {
    try {
      const saved = localStorage.getItem('halfcon_promo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (promo) localStorage.setItem('halfcon_promo', JSON.stringify(promo));
      else localStorage.removeItem('halfcon_promo');
    } catch {}
  }, [promo]);

  const applyPromo = (code) => {
    const normalized = (code || '').trim().toUpperCase();
    const percent = PROMO_CODES[normalized];
    if (!percent) {
      return { ok: false, error: 'That code is not valid. Please check it and try again.' };
    }
    setPromo({ code: normalized, percent });
    return { ok: true, percent };
  };

  const removePromo = () => setPromo(null);

  const total = items.reduce((sum, item) => sum + (item.price_cents || 0) * (item.quantity || 1), 0);
  const discount = promo ? Math.round((total * promo.percent) / 100) : 0;
  const finalTotal = total - discount;

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, total, promo, applyPromo, removePromo, discount, finalTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
