import { createContext, useState, useContext, useCallback, useRef } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");

  const restaurantIdRef = useRef(null);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const addItem = useCallback((item, restId, restName) => {
    const currentRestId = restaurantIdRef.current;

    // Different restaurant detected
    if (currentRestId && currentRestId !== restId) {
      return "CONFLICT";
    }

    restaurantIdRef.current = restId;
    setRestaurantId(restId);
    setRestaurantName(restName);

    setItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);

      if (existing) {
        return prev.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });

    return true;
  }, []);

  // Called after the user confirms switching restaurants — clears the old
  // cart and adds the new item in one shot, no conflict check needed.
  const forceAddItem = useCallback((item, restId, restName) => {
    restaurantIdRef.current = restId;
    setRestaurantId(restId);
    setRestaurantName(restName);
    setItems([{ ...item, quantity: 1 }]);
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => {
      const updated = prev
        .map((i) =>
          i._id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
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
    <CartContext.Provider
      value={{
        items,
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
