import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../hooks/useSocket";
import "./OrderStatus.css";

const STEPS = [
  { key: "placed", label: "Order Placed", icon: "🧾" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "assigned", label: "Courier Assigned", icon: "🛵" },
  { key: "transit", label: "On the Way", icon: "🚀" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

export default function OrderStatus() {
  const { id } = useParams();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch initial order — NO /api prefix, axios already has it as baseURL
    api.get(`/orders/${id}`)
      .then(({ data }) => {
        setOrder(data);
        const stepIndex = STEPS.findIndex((s) => s.key === data.status);
        setCurrentStep(Math.max(0, stepIndex));
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));

    // Listen for order updates via WebSocket
    if (socket) {
      socket.emit("join:order", id);
      socket.on(`order:placed`, handleStatusUpdate);
      socket.on(`order:preparing`, handleStatusUpdate);
      socket.on(`order:assigned`, handleStatusUpdate);
      socket.on(`order:transit`, handleStatusUpdate);
      socket.on(`order:delivered`, handleStatusUpdate);

      return () => {
        socket.off(`order:placed`, handleStatusUpdate);
        socket.off(`order:preparing`, handleStatusUpdate);
        socket.off(`order:assigned`, handleStatusUpdate);
        socket.off(`order:transit`, handleStatusUpdate);
        socket.off(`order:delivered`, handleStatusUpdate);
      };
    }
  }, [id, socket]);

  const handleStatusUpdate = (data) => {
    if (data.orderId === id) {
      setOrder((prev) => ({ ...prev, ...data }));
      const stepIndex = STEPS.findIndex((s) => s.key === data.status);
      setCurrentStep(Math.max(0, stepIndex));
    }
  };

  if (loading) {
    return (
      <div className="order-status-page">
        <div className="status-loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-status-page">
        <div className="status-error">Order not found</div>
      </div>
    );
  }

  const restaurantId = order.restaurantId?._id || order.restaurantId;

  return (
    <div className="order-status-page">
      <div className="status-container">
        <div className="status-header">
          <h2>Order Tracking</h2>
          <p className="order-id">Order #{order._id?.slice(-8).toUpperCase()}</p>
        </div>

        {/* Status Timeline */}
        <div className="status-timeline">
          {STEPS.map((step, i) => (
            <div key={step.key} className={`timeline-step ${i <= currentStep ? "active" : ""}`}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="order-details-card">
          <h3>Order Details</h3>

          <div className="detail-section">
            <span className="detail-label">Restaurant</span>
            <span className="detail-value">
              {order.restaurantId?.name || order.restaurantName || "N/A"}
            </span>
          </div>

          <div className="detail-section">
            <span className="detail-label">Delivery Address</span>
            <span className="detail-value">{order.deliveryAddress || "Not specified"}</span>
          </div>

          <div className="detail-section">
            <span className="detail-label">Order Time</span>
            <span className="detail-value">
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="detail-section">
            <span className="detail-label">Status</span>
            <span className={`status-badge ${order.status}`}>
              {order.status?.toUpperCase()}
            </span>
          </div>

          {order.courierId && (
            <div className="detail-section">
              <span className="detail-label">Courier</span>
              <span className="detail-value">
                {order.courierId?.name || "Assigned"}
              </span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="order-items-card">
          <h3>Items</h3>
          <div className="items-list">
            {order.items?.map((item, i) => (
              <div key={i} className="item-row">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta">× {item.qty || item.quantity}</span>
                </div>
                <span className="item-price">
                  ₹{(item.totalPrice ?? (item.price * (item.qty || item.quantity)) ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{(order.totalPrice * 0.9).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹50.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="payment-status-card">
          <h3>Payment</h3>
          <div className="payment-row">
            <span className="detail-label">Status</span>
            <span className={`payment-badge ${order.paymentStatus}`}>
              {order.paymentStatus?.toUpperCase()}
            </span>
          </div>
          {order.paymentDetails?.transactionId && (
            <div className="payment-row">
              <span className="detail-label">Transaction ID</span>
              <span className="detail-value">{order.paymentDetails.transactionId}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="status-actions">
          <Link to="/" className="btn-back-home">
            ← Back
          </Link>
          {order.status === "delivered" && restaurantId && (
            <Link to={`/review/${restaurantId}`} className="btn-review">
              ⭐ Review
            </Link>
          )}
          {restaurantId && (
            <Link to={`/restaurant/${restaurantId}`} className="btn-reorder">
              🔄 Order Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}