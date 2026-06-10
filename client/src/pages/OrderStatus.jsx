import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../hooks/useSocket";
import "./OrderStatus.css";

const STEPS = [
  { key: "placed",    label: "Order Placed",    icon: "🧾" },
  { key: "preparing", label: "Preparing",        icon: "👨‍🍳" },
  { key: "assigned",  label: "Courier Assigned", icon: "🛵" },
  { key: "transit",   label: "On the Way",       icon: "🚀" },
  { key: "delivered", label: "Delivered",        icon: "✅" },
];

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

export default function OrderStatus() {
  const { id } = useParams();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join:order", id);

    const update = (data) => {
      if (data.orderId === id || data.orderId?.toString() === id) {
        setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
      }
    };

    socket.on("order:preparing",        update);
    socket.on("order:assigned",         update);
    socket.on("order:transit",          update);
    socket.on("order:courier_assigned", update);
    socket.on("order:delivered",        update);

    return () => {
      socket.off("order:preparing",        update);
      socket.off("order:assigned",         update);
      socket.off("order:transit",          update);
      socket.off("order:courier_assigned", update);
      socket.off("order:delivered",        update);
    };
  }, [socket, id]);

  if (loading) return <div className="status-loading">Loading order…</div>;
  if (!order)  return <div className="status-loading">Order not found.</div>;

  const currentStep = STEP_INDEX[order.status] ?? 0;
  const restaurantId = order.restaurantId?._id || order.restaurantId;

  return (
    <div className="status-page">
      <div className="status-card">

        {/* Header */}
        <div className="status-header">
          <Link to="/" className="status-back">← Back to Home</Link>
          <h2 className="status-title">Order Tracking</h2>
          <p className="status-order-id">#{id.slice(-8).toUpperCase()}</p>
        </div>

        {/* Progress Tracker */}
        <div className="status-tracker">
          {STEPS.map((step, idx) => {
            const done    = idx < currentStep;
            const active  = idx === currentStep;
            return (
              <div key={step.key} className="status-step-wrapper">
                <div className={`status-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-label">{step.label}</div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`status-connector ${done ? "done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Status Banner */}
        <div className="status-banner">
          <span className="status-badge">
            {STEPS[currentStep]?.icon} {STEPS[currentStep]?.label}
          </span>
          {order.status === "delivered" && (
            <p className="status-delivered-msg">Your order has been delivered. Enjoy your meal! 🎉</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="status-summary">
          <h3>Order Summary</h3>
          <ul className="status-items">
            {order.items?.map((item, i) => (
              <li key={i} className="status-item">
                <span className="item-name">{item.name}</span>
                <span className="item-meta">× {item.quantity}</span>
                <span className="item-price">₹{(item.totalPrice ?? item.price * item.quantity ?? 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="status-total">
            <span>Total</span>
            <span>₹{order.totalPrice?.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="status-address">
            <span>📍</span>
            <span>{order.deliveryAddress}</span>
          </div>
        )}

        {/* Actions */}
        <div className="status-actions">
          <Link to="/" className="btn-back-home">Back to Home</Link>
          {restaurantId && (
            <Link to={`/restaurant/${restaurantId}`} className="btn-reorder">
              Order Again
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}