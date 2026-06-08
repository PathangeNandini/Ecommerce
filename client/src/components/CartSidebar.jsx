import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartSidebar.css";

export default function CartSidebar({ isOpen, onClose }) {
  const { itemsByRestaurant, total, addItem, removeItem, clearCart, restaurants } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/cart");
  };

  const totalItems = itemsByRestaurant.reduce((s, g) => s + g.items.reduce((ss, i) => ss + i.quantity, 0), 0);

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}
      <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {itemsByRestaurant.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Your cart is empty</p>
            <small>Add items from a restaurant to get started</small>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {itemsByRestaurant.map(({ restaurantId, restaurantName, items }) => (
                <div key={restaurantId} className="cart-restaurant-group">
                  <p className="cart-restaurant-label">🏪 {restaurantName}</p>
                  {items.map((item) => (
                    <div key={`${item._id}-${restaurantId}`} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">₹{item.price}</span>
                      </div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => removeItem(item._id, restaurantId)}>−</button>
                        <span>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => addItem(item, restaurantId, restaurantName)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span className="total-amount">₹{total.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
