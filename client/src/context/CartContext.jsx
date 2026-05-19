import { createContext, useState, useContext, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = useCallback((item, restId, restName) => {
    if (restaurantId && restaurantId !== restId) {
      const confirmed = window.confirm(
        "Your cart has items from another restaurant. Clear cart and add this item?"
      );
      if (!confirmed) return false;
      setItems([]);
    }
    setRestaurantId(restId);
    setRestaurantName(restName);
    setItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  }, [restaurantId]);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => {
      const updated = prev
        .map((i) => (i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName("");
      }
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
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
