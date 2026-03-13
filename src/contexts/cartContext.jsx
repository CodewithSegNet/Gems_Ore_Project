import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { const saved = localStorage.getItem("gemsore_cart"); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  // Applied discount: { id, name, discount_type, type, value, discount_amount, code, product_id, source: 'auto'|'coupon' }
  const [appliedDiscount, setAppliedDiscount] = useState(() => {
    try { const saved = localStorage.getItem("gemsore_discount"); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [vatEnabled, setVatEnabled] = useState(true);
  const [vatRate, setVatRate] = useState(0.075); // default 7.5%, fetched from backend

  // Persist cart items to localStorage
  useEffect(() => {
    localStorage.setItem("gemsore_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist applied discount to localStorage
  useEffect(() => {
    if (appliedDiscount) {
      localStorage.setItem("gemsore_discount", JSON.stringify(appliedDiscount));
    } else {
      localStorage.removeItem("gemsore_discount");
    }
  }, [appliedDiscount]);

  // Fetch VAT settings from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:7001"}/api/v1/settings/public`);
        const json = await res.json();
        const data = json?.data;
        if (data) {
          if (data.vat_enabled !== undefined) setVatEnabled(data.vat_enabled === 'true' || data.vat_enabled === true);
          if (data.vat_rate && Number(data.vat_rate) >= 0) setVatRate(Number(data.vat_rate) / 100);
        }
      } catch {}
    })();
  }, []);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedDiscount(null);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discount = appliedDiscount ? appliedDiscount.discount_amount : 0;
  const vat = vatEnabled ? subtotal * vatRate : 0;
  const vatPercent = vatEnabled ? (vatRate * 100) : 0;
  const total = subtotal + vat - discount;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      subtotal,
      discount,
      vat,
      vatPercent,
      total,
      appliedDiscount,
      setAppliedDiscount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
