import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { itemsByRestaurant, total, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrders = async () => {
    setError("");
    setLoading(true);
    try {
      // Place one order per restaurant
      const orderPromises = itemsByRestaurant.map(({ restaurantId, items }) =>
        api.post("/orders", {
          restaurantId,
          items: items.map((i) => ({
            menuItemId: i.menuItemId || i._id,
            qty: i.quantity,
          })),
        })
      );

      const results = await Promise.all(orderPromises);
      clearCart();

      // Navigate to first order tracking page
      if (results.length === 1) {
        navigate(`/order/${results[0].data._id}`);
      } else {
        navigate("/profile"); // multiple orders → go to profile/orders page
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Failed to place order. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (itemsByRestaurant.length === 0) {
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
        {/* Order summary — grouped by restaurant */}
        <div className="order-summary">
          {itemsByRestaurant.map(({ restaurantId, restaurantName, items, total: restTotal }) => (
            <div key={restaurantId} className="restaurant-order-group">
              <h2>Order from <span>{restaurantName}</span></h2>

              <div className="order-items">
                {items.map((item) => (
                  <div key={`${item._id}-${restaurantId}`} className="order-item-row">
                    <div className="order-item-left">
                      <span className="order-item-qty">{item.quantity}×</span>
                      <span className="order-item-name">{item.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="order-item-subtotal">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item._id, restaurantId)}
                        style={{
                          background: "#FEE2E2", color: "#DC2626", border: "none",
                          borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 16
                        }}
                      >−</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-divider" />
              <div className="order-row">
                <span>Subtotal</span>
                <span>₹{restTotal.toFixed(2)}</span>
              </div>
              <div className="order-row">
                <span>Delivery fee</span>
                <span className="free-label">FREE</span>
              </div>
            </div>
          ))}

          <div className="order-divider" style={{ marginTop: "1rem" }} />
          <div className="order-row total-row">
            <span>Total ({itemsByRestaurant.length} {itemsByRestaurant.length > 1 ? "restaurants" : "restaurant"})</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="payment-section">
          <h2>Payment</h2>
          <div className="payment-mock">
            <div className="payment-icon">💳</div>
            <div>
              <p>Simulated Payment Gateway</p>
              <small>No real payment required — this is a demo</small>
            </div>
          </div>

          {itemsByRestaurant.length > 1 && (
            <div className="multi-order-note">
              📦 {itemsByRestaurant.length} separate orders will be placed
            </div>
          )}

          {error && <div className="checkout-error">{error}</div>}

          <button
            className="place-order-btn"
            onClick={handlePlaceOrders}
            disabled={loading}
          >
            {loading ? "Placing Orders…" : `Place Order${itemsByRestaurant.length > 1 ? "s" : ""} · ₹${total.toFixed(2)}`}
          </button>

          <button
            onClick={clearCart}
            style={{
              width: "100%", marginTop: 10, padding: "0.6rem",
              background: "transparent", color: "#DC2626",
              border: "1px solid #FCA5A5", borderRadius: 8, cursor: "pointer", fontSize: 14
            }}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}