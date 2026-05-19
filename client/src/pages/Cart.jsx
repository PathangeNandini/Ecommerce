import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { items, restaurantId, restaurantName, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        restaurantId,
        items: items.map((i) => ({ menuItemId: i._id, quantity: i.quantity, price: i.price })),
        totalPrice: total,
      };
      const { data } = await api.post("/orders", payload);
      clearCart();
      navigate(`/order/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <h2>Your cart is empty 🛒</h2>
        <button onClick={() => navigate("/")}>Browse Restaurants</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
        <h1>Checkout</h1>
      </div>

      <div className="cart-page-content">
        {/* Order summary */}
        <div className="order-summary">
          <h2>Order from <span>{restaurantName}</span></h2>

          <div className="order-items">
            {items.map((item) => (
              <div key={item._id} className="order-item-row">
                <div className="order-item-left">
                  <span className="order-item-qty">{item.quantity}×</span>
                  <span className="order-item-name">{item.name}</span>
                </div>
                <span className="order-item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="order-divider" />

          <div className="order-row">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="order-row">
            <span>Delivery fee</span>
            <span className="free-label">FREE</span>
          </div>
          <div className="order-row total-row">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment mock */}
        <div className="payment-section">
          <h2>Payment</h2>
          <div className="payment-mock">
            <div className="payment-icon">💳</div>
            <div>
              <p>Simulated Payment Gateway</p>
              <small>No real payment required — this is a demo</small>
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Placing Order…" : `Place Order · ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
