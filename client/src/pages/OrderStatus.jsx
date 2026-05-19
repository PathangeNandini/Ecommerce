import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../hooks/useSocket";
import "./OrderStatus.css";

const STEPS = [
  { key: "placed",    label: "Order Placed",      icon: "🧾" },
  { key: "preparing", label: "Preparing",          icon: "👨‍🍳" },
  { key: "assigned",  label: "Courier Assigned",   icon: "🛵" },
  { key: "transit",   label: "On the Way",         icon: "🚀" },
  { key: "delivered", label: "Delivered",          icon: "✅" },
];

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

export default function OrderStatus() {
  const { id } = useParams();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join:order", id);

    const update = (data) => {
      if (data.orderId === id) {
        setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
      }
    };

    socket.on("order:preparing", update);
    socket.on("order:courier_assigned", update);
    socket.on("order:delivered", update);

    return () => {
      socket.off("order:preparing", update);
      socket.off("order:courier_assigned", update);
      socket.off("order:delivered", update);
    };
  }, [socket, id]);

  if (loading) return <div className="status-loading">Loading order…</div>;
  if (!order) return <div className="status-loading">Order not found.</div>;

  const currentStep = STEP_INDEX[order.status] ?? 0;

  return (
    <div className="status-page">
      <div className="status-header">
        <Link to="/" className="status-back">← Home</Link>
        <h1>Order Status</h1>
        <span className="status-id">#{order._id?.slice(-6).toUpperCase()}</span>
      </div>

      {/* Stepper */}
      <div className="stepper-wrap">
        <div className="stepper">
          {STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={step.key} className={`step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                <div className="step-icon-wrap">
                  <div className="step-icon">{step.icon}</div>
                  {i < STEPS.length - 1 && (
                    <div className={`step-line ${done ? "filled" : ""}`} />
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {order.status !== "delivered" && (
          <div className="live-badge">🔴 Live tracking</div>
        )}
      </div>

      {/* Order details */}
      <div className="status-details">
        <h2>Order Summary</h2>
        <div className="status-items">
          {order.items?.map((item, i) => (
            <div key={i} className="status-item-row">
              <span>{item.quantity}× {item.name || "Item"}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="status-total">
          <span>Total Paid</span>
          <span>₹{order.totalPrice?.toFixed(2)}</span>
        </div>

        {order.status === "delivered" && (
          <Link to={`/review/${order._id}`} className="review-cta">
            ⭐ Rate your order & earn loyalty points
          </Link>
        )}
      </div>
    </div>
  );
}
