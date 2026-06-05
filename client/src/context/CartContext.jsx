import { createContext, useState, useContext, useCallback, useRef } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");

  // useRef to always have the latest restaurantId without stale closure
  const restaurantIdRef = useRef(null);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = useCallback((item, restId, restName) => {
    const currentRestId = restaurantIdRef.current;

    if (currentRestId && currentRestId !== restId) {
      const confirmed = window.confirm(
        "Your cart has items from another restaurant. Clear cart and add this item?"
      );
      if (!confirmed) return false;
      setItems([]);
    }

    // Update both state and ref
    restaurantIdRef.current = restId;
    setRestaurantId(restId);
    setRestaurantName(restName);

    setItems((prev) => {
      // If switching restaurant, start fresh
      const base = currentRestId && currentRestId !== restId ? [] : prev;
      const existing = base.find((i) => i._id === item._id);
      if (existing) {
        return base.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...base, { ...item, quantity: 1 }];
    });

    return true;
  }, []); // empty deps — uses ref instead of closure

  const removeItem = useCallback((itemId) => {
    setItems((prev) => {
      const updated = prev
        .map((i) => (i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      if (updated.length === 0) {
        restaurantIdRef.current = null;
        setRestaurantId(null);
        setRestaurantName("");
      }
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    restaurantIdRef.current = null;
    setItems([]);
    setRestaurantId(null);
    setRestaurantName("");
  }, []);

  return (
    <CartContext.Provider value={{ items, restaurantId, restaurantName, total, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export default CartContext;
