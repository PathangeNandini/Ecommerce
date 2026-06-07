import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartSidebar.css";

export default function CartSidebar({ isOpen, onClose }) {
  const { items, restaurantId, restaurantName, total, addItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/cart");
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}
      <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {restaurantName && (
          <p className="cart-restaurant">From: <strong>{restaurantName}</strong></p>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Your cart is empty</p>
            <small>Add items from a restaurant to get started</small>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">₹{item.price}</span>
                  </div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => removeItem(item._id)}>−</button>
                    <span>{item.quantity}</span>
                    {/* ← FIX: pass restaurantId instead of null */}
                    <button className="qty-btn" onClick={() => addItem(item, restaurantId, restaurantName)}>+</button>
                  </div>
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