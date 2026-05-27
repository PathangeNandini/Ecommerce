import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import Navbar from "../../components/Navbar";
import "./Courier.css";

const STEPS = [
  { key: "assigned", label: "Order Accepted",    icon: "✅" },
  { key: "transit",  label: "Picked Up",         icon: "📦" },
  { key: "delivered",label: "Delivered",         icon: "🏁" },
];
const IDX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

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

  const advance = async () => {
    if (!order) return;
    const curr = IDX[order.status] ?? 0;
    if (curr >= STEPS.length - 1) return;
    const next = STEPS[curr + 1].key;
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: next });
      socket?.emit(`order:${next}`, { orderId: id });
      setOrder((o) => ({ ...o, status: next }));
      if (next === "delivered") {
        setTimeout(() => navigate("/delivery/history"), 1500);
      }
    } catch { /* silent */ } finally { setUpdating(false); }
  };

  if (loading) return <><Navbar /><div className="owner-loading">Loading order…</div></>;
  if (!order)  return <><Navbar /><div className="owner-loading">Order not found.</div></>;

  const stepIdx   = IDX[order.status] ?? 0;
  const nextStep  = STEPS[stepIdx + 1];
  const isFinished = order.status === "delivered";

  return (
    <div className="courier-page">
      <Navbar />
      <div className="courier-container" style={{ maxWidth: 560 }}>
        <button className="back-link" onClick={() => navigate("/delivery")}>← Back</button>
        <h1>Active Delivery</h1>
        <p className="courier-sub">Order #{order._id?.slice(-6).toUpperCase()}</p>

        {/* Stepper */}
        <div className="active-stepper">
          {STEPS.map((step, i) => (
            <div key={step.key} className={`a-step ${i <= stepIdx ? "done" : ""} ${i === stepIdx ? "current" : ""}`}>
              <div className="a-step-icon">{step.icon}</div>
              <span className="a-step-label">{step.label}</span>
              {i < STEPS.length - 1 && <div className={`a-step-line ${i < stepIdx ? "filled" : ""}`} />}
            </div>
          ))}
        </div>

        {/* Order details */}
        <div className="active-card">
          <div className="loc-row" style={{ marginBottom: "1rem" }}>
            <span className="loc-dot pickup" />
            <div>
              <p className="loc-label">Pick up from</p>
              <p className="loc-name">{order.restaurantName ?? "Restaurant"}</p>
              <p className="loc-addr">{order.restaurantAddress ?? ""}</p>
            </div>
          </div>
          <div className="loc-row">
            <span className="loc-dot dropoff" />
            <div>
              <p className="loc-label">Deliver to</p>
              <p className="loc-name">{order.customerName ?? "Customer"}</p>
              <p className="loc-addr">{order.deliveryAddress ?? "Address on file"}</p>
            </div>
          </div>

          <div className="active-items">
            {order.items?.map((item, i) => (
              <span key={i} className="item-chip">{item.quantity}× {item.name}</span>
            ))}
          </div>
          <div className="active-total">Total: ₹{order.totalPrice?.toFixed(2)}</div>
        </div>

        {/* CTA */}
        {isFinished ? (
          <div className="delivered-banner">🎉 Delivered! Redirecting…</div>
        ) : (
          <button className="btn-accept-delivery" disabled={updating} onClick={advance}>
            {updating ? "Updating…" : `Mark as ${nextStep?.label}`}
          </button>
        )}
      </div>
    </div>
  );
}