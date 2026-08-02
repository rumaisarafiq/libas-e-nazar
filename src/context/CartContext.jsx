import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "len_cart_v1";

// Flat shipping fee applied whenever the cart isn't empty. Free once the
// subtotal clears the threshold — simple, transparent "calculations" the
// Cart page can show a breakdown of.
const SHIPPING_FEE = 250;
const FREE_SHIPPING_THRESHOLD = 15000;
const TAX_RATE = 0.05; // 5% GST-style tax on subtotal

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [items]);

  // A cart line is uniquely identified by garment id + size, so the same
  // garment in two different sizes gets two separate lines.
  const addItem = (garment, { size = "M", style, qty = 1 } = {}) => {
    if (!garment) return;
    setItems((prev) => {
      const lineId = `${garment.id}::${size}`;
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [
        ...prev,
        {
          lineId,
          id: garment.id,
          name: garment.name,
          image: garment.image,
          price: garment.price || 0,
          size,
          style,
          qty,
        },
      ];
    });
  };

  const removeItem = (lineId) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  };

  const updateQty = (lineId, qty) => {
    setItems((prev) =>
      prev
        .map((i) => (i.lineId === lineId ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping =
      itemCount === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + shipping + tax;
    return {
      itemCount,
      subtotal,
      shipping,
      tax,
      total,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totals }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
