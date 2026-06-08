import { createContext, useState, useContext, useCallback, useRef } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState({}); // { restId: restName }

  const restaurantIdRef = useRef(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // For backward compat — last added restaurant
  const restaurantId = items.length > 0 ? items[items.length - 1].restId : null;
  const restaurantName = restaurantId ? restaurants[restaurantId] : "";

  const addItem = useCallback((item, restId, restName) => {
    // Save restaurant name
    setRestaurants((prev) => ({ ...prev, [restId]: restName }));

    setItems((prev) => {
      const existing = prev.find((i) => i._id === item._id && i.restId === restId);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id && i.restId === restId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, restId, quantity: 1 }];
    });

    return true;
  }, []);

  const forceAddItem = useCallback((item, restId, restName) => {
    setRestaurants((prev) => ({ ...prev, [restId]: restName }));
    setItems((prev) => {
      const existing = prev.find((i) => i._id === item._id && i.restId === restId);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id && i.restId === restId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, restId, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId, restId) => {
    setItems((prev) => {
      const updated = prev
        .map((i) =>
          i._id === itemId && i.restId === restId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0);

      if (updated.length === 0) {
        restaurantIdRef.current = null;
        setRestaurants({});
      }

      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    restaurantIdRef.current = null;
    setItems([]);
    setRestaurants({});
  }, []);

  // Group items by restaurant for checkout
  const itemsByRestaurant = Object.entries(
    items.reduce((acc, item) => {
      if (!acc[item.restId]) acc[item.restId] = [];
      acc[item.restId].push(item);
      return acc;
    }, {})
  ).map(([restId, restItems]) => ({
    restaurantId: restId,
    restaurantName: restaurants[restId] || "",
    items: restItems,
    total: restItems.reduce((s, i) => s + i.price * i.quantity, 0),
  }));

  return (
    <CartContext.Provider
      value={{
        items,
        restaurants,
        itemsByRestaurant,
        restaurantId,
        restaurantName,
        restaurantIdRef,
        total,
        addItem,
        forceAddItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export default CartContext;
