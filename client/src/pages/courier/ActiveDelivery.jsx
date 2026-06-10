import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import "./Courier.css";

const STEPS = [
  { status: "placed",    label: "Order Placed",      icon: "🧾" },
  { status: "preparing", label: "Preparing",          icon: "👨‍🍳" },
  { status: "assigned",  label: "Courier Assigned",   icon: "🛵" },
  { status: "transit",   label: "On the Way",         icon: "🚀" },
  { status: "delivered", label: "Delivered",          icon: "✅" },
];

export default function ActiveDelivery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join:order", id);
    socket.on("order:transit", ({ status }) => {
      setOrder((o) => o ? { ...o, status } : o);
    });
    socket.on("order:delivered", ({ status }) => {
      setOrder((o) => o ? { ...o, status } : o);
    });
    return () => {
      socket.off("order:transit");
      socket.off("order:delivered");
    };
  }, [socket, id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status: newStatus });
      setOrder(data);
      if (newStatus === "delivered") {
        setTimeout(() => navigate("/delivery"), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="courier-page"><div className="courier-loading">Loading order…</div></div>;
  if (!order) return <div className="courier-page"><div className="courier-loading">Order not found.</div></div>;

  const currentStep = STEPS.findIndex(s => s.status === order.status);

  const getNextAction = () => {
    if (order.status === "assigned") return { label: "Mark On the Way 🚀", next: "transit" };
    if (order.status === "transit")  return { label: "Mark Delivered ✅", next: "delivered" };
    return null;
  };

  const action = getNextAction();

  return (
    <div className="courier-page">
      <nav className="courier-nav">
        <div className="courier-brand">🚴 Active Delivery</div>
        <button className="courier-home-btn" onClick={() => navigate("/delivery")}>← Back</button>
      </nav>

      <div className="courier-content">

        {/* Order Ref */}
        <div className="active-order-header">
          <h2>Order #{order._id?.slice(-6).toUpperCase()}</h2>
          <span className={`status-badge status-${order.status}`}>
            {STEPS.find(s => s.status === order.status)?.icon} {order.status.toUpperCase()}
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="tracker-bar">
          {STEPS.map((step, i) => (
            <div key={step.status} className="tracker-step">
              <div className={`tracker-circle ${i <= currentStep ? "done" : ""} ${i === currentStep ? "active" : ""}`}>
                {step.icon}
              </div>
              <span className={`tracker-label ${i === currentStep ? "active-label" : ""}`}>
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`tracker-line ${i < currentStep ? "done" : ""}`} />
              )}
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="active-order-details">
          <div className="detail-card">
            <h3>🏪 Pick Up From</h3>
            <p>{order.restaurantId?.name || "Restaurant"}</p>
            <p className="detail-address">{order.restaurantId?.address}</p>
          </div>
          <div className="detail-card">
            <h3>📍 Deliver To</h3>
            <p>{order.deliveryAddress || "Address not provided"}</p>
          </div>
          <div className="detail-card">
            <h3>🛍️ Items</h3>
            {order.items?.map((item, i) => (
              <p key={i}>{item.qty}× {item.name} — ₹{(item.price * item.qty).toFixed(2)}</p>
            ))}
            <p className="order-total-line">Total: ₹{order.totalPrice?.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Button */}
        {action && order.status !== "delivered" && (
          <button
            className="btn-status-update"
            onClick={() => updateStatus(action.next)}
            disabled={updating}
          >
            {updating ? "Updating…" : action.label}
          </button>
        )}

        {order.status === "delivered" && (
          <div className="delivered-banner">
            ✅ Order Delivered! Redirecting…
          </div>
        )}
      </div>
    </div>
  );
}