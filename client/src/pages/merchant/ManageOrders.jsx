import { useState, useEffect } from "react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import Navbar from "../../components/Navbar";
import "./Owner.css";

const STATUS_FLOW = ["placed", "preparing", "assigned", "transit", "delivered"];
const STATUS_LABELS = {
  placed:    "🧾 Placed",
  preparing: "👨‍🍳 Preparing",
  assigned:  "🛵 Courier Assigned",
  transit:   "🚀 On the Way",
  delivered: "✅ Delivered",
  rejected:  "❌ Rejected",
};
const STATUS_COLORS = {
  placed:    "#f59e0b",
  preparing: "#3b82f6",
  assigned:  "#8b5cf6",
  transit:   "#06b6d4",
  delivered: "#4ade80",
  rejected:  "#ef4444",
};

export default function ManageOrders() {
  const socket = useSocket();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [updating, setUpdating]   = useState(null);

  useEffect(() => {
    api.get("/orders/restaurant")
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Live new orders
  useEffect(() => {
    if (!socket) return;
    socket.on("order:placed", (order) => setOrders((prev) => [order, ...prev]));
    return () => socket.off("order:placed");
  }, [socket]);

  const advanceStatus = async (order) => {
    const curr = STATUS_FLOW.indexOf(order.status);
    if (curr === -1 || curr >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[curr + 1];
    setUpdating(order._id);
    try {
      await api.patch(`/orders/${order._id}/status`, { status: nextStatus });
      socket?.emit(`order:${nextStatus}`, { orderId: order._id });
      setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, status: nextStatus } : o));
    } catch { /* silent */ } finally { setUpdating(null); }
  };

  const STATUS_OPTIONS = ["all", "placed", "preparing", "assigned", "transit", "delivered", "rejected"];
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <><Navbar /><div className="owner-loading">Loading orders…</div></>;

  return (
    <div className="owner-page">
      <Navbar />
      <div className="owner-container">
        <h1>📦 All Orders</h1>

        {/* ── Status filter tabs ── */}
        <div className="status-tabs">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`status-tab ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
              <span className="tab-count">
                {s === "all" ? orders.length : orders.filter((o) => o.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-section">No orders found.</div>
        ) : (
          <div className="orders-list-full">
            {filtered.map((order) => {
              const nextIdx = STATUS_FLOW.indexOf(order.status) + 1;
              const nextStatus = STATUS_FLOW[nextIdx];
              const canAdvance = nextStatus && order.status !== "rejected";

              return (
                <div key={order._id} className="order-full-card">
                  <div className="order-full-header">
                    <span className="order-ref">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span
                      className="order-status-tag"
                      style={{ color: STATUS_COLORS[order.status] }}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                    <span className="order-total-tag">₹{order.totalPrice?.toFixed(2)}</span>
                  </div>

                  <div className="order-items-row">
                    {order.items?.map((item, i) => (
                      <span key={i} className="item-chip">{item.quantity}× {item.name}</span>
                    ))}
                  </div>

                  {canAdvance && (
                    <button
                      className="btn-advance"
                      disabled={updating === order._id}
                      onClick={() => advanceStatus(order)}
                    >
                      {updating === order._id ? "Updating…" : `Mark as → ${STATUS_LABELS[nextStatus]}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}