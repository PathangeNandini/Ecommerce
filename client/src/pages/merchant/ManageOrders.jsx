import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import "./Owner.css";

const STATUS_LABELS = {
  placed:    "🧾 Placed",
  preparing: "👨‍🍳 Preparing",
  assigned:  "🛵 Courier Assigned",
  transit:   "🚀 On the Way",
  delivered: "✅ Delivered",
  rejected:  "❌ Rejected",
};

const STATUS_COLORS = {
  placed:    "#ff9800",
  preparing: "#2196f3",
  assigned:  "#9c27b0",
  transit:   "#00bcd4",
  delivered: "#4caf50",
  rejected:  "#f44336",
};

export default function ManageOrders() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeStatus, setActive]   = useState("all");
  const [error, setError]           = useState("");

  useEffect(() => {
    // Fetch ALL orders for this restaurant
    Promise.all([
      api.get("/orders/pending"),
      api.get("/orders/revenue"),
    ]).then(async ([pendingRes]) => {
      try {
        const allRes = await api.get("/orders/all");
        setOrders(Array.isArray(allRes.data) ? allRes.data : []);
      } catch {
        // Fallback to just pending orders
        setOrders(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      }
    }).catch(() => {
      setError("Failed to load orders");
    }).finally(() => setLoading(false));
  }, []);

  // ✅ FIX: Added socket.emit("join:owner") so this page joins the restaurant room
  useEffect(() => {
    if (!socket) return;

    // Join the restaurant room so we receive order events
    socket.emit("join:owner");

    socket.on("order:placed", (order) => {
      setOrders((prev) => {
        // Avoid duplicates
        if (prev.find((o) => o._id === order._id)) return prev;
        return [order, ...prev];
      });
    });

    socket.on("order:status", ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    });

    return () => {
      socket.off("order:placed");
      socket.off("order:status");
    };
  }, [socket]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch {
      setError("Failed to update order status");
    }
  };

  const allStatuses = ["all", "placed", "preparing", "assigned", "transit", "delivered", "rejected"];
  const filtered = activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus);

  if (loading) return (
    <div className="owner-page">
      <nav className="owner-nav">
        <div className="owner-brand">🏪 Owner Dashboard</div>
        <button className="owner-home-btn" onClick={() => navigate("/owner/dashboard")}>← Dashboard</button>
      </nav>
      <div className="owner-loading">Loading orders…</div>
    </div>
  );

  return (
    <div className="owner-page">
      <nav className="owner-nav">
        <div className="owner-brand">🏪 Owner Dashboard</div>
        <button className="owner-home-btn" onClick={() => navigate("/owner/dashboard")}>← Dashboard</button>
      </nav>

      <div className="owner-container">
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.75rem", fontWeight: 800, marginBottom: "1rem" }}>
          📦 All Orders
        </h1>

        {error && <div className="form-error">{error}</div>}

        {/* Status filter tabs */}
        <div className="cat-tabs" style={{ marginBottom: "1.5rem" }}>
          {allStatuses.map((s) => (
            <button
              key={s}
              className={`cat-tab ${activeStatus === s ? "active" : ""}`}
              onClick={() => setActive(s)}
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
          <div className="orders-queue">
            {filtered.map((order) => (
              <div key={order._id} className="incoming-card">
                <div className="incoming-top">
                  <span className="order-ref">#{order._id?.slice(-6).toUpperCase()}</span>
                  <span className="order-time">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                  <span
                    className="order-status-badge"
                    style={{
                      background: STATUS_COLORS[order.status] + "22",
                      color: STATUS_COLORS[order.status],
                      border: `1px solid ${STATUS_COLORS[order.status]}44`,
                      borderRadius: 100,
                      padding: "0.2rem 0.75rem",
                      fontSize: "0.78rem",
                      fontWeight: 700
                    }}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="order-total">₹{order.totalPrice?.toFixed(2)}</span>
                </div>

                <div className="incoming-items">
                  {order.items?.map((item, i) => (
                    <span key={i} className="item-chip">
                      {item.qty || item.quantity}× {item.name}
                    </span>
                  ))}
                </div>

                {/* Action buttons based on status */}
                {order.status === "placed" && (
                  <div className="incoming-actions">
                    <button className="btn-accept" onClick={() => handleStatusChange(order._id, "preparing")}>
                      ✓ Accept
                    </button>
                    <button className="btn-reject" onClick={() => handleStatusChange(order._id, "rejected")}>
                      ✕ Reject
                    </button>
                  </div>
                )}
                {order.status === "preparing" && (
                  <div className="incoming-actions">
                    <button className="btn-accept" onClick={() => handleStatusChange(order._id, "transit")}>
                      🚀 Mark Ready for Pickup
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}