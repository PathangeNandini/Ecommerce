    import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import Navbar from "../../components/Navbar";
import "./Owner.css";

export default function OwnerDashboard() {
  const socket = useSocket();
  const [stats, setStats]           = useState({ revenue: 0, orders: 0, pending: 0 });
  const [pendingOrders, setPending] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/orders/revenue"),
      api.get("/orders/pending"),
      api.get("/restaurants/mine"),
    ]).then(([rev, pend, rest]) => {
      setStats({
        revenue: rev.data?.total ?? 0,
        orders:  rev.data?.count ?? 0,
        pending: (pend.data ?? []).length,
      });
      setPending(pend.data ?? []);
      setRestaurant(rest.data ?? null);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Live incoming orders via WebSocket
  useEffect(() => {
    if (!socket) return;
    socket.on("order:placed", (order) => {
      setPending((p) => [order, ...p]);
      setStats((s) => ({ ...s, pending: s.pending + 1 }));
    });
    return () => socket.off("order:placed");
  }, [socket]);

  const handleAccept = async (orderId) => {
    await api.patch(`/orders/${orderId}/status`, { status: "preparing" });
    socket?.emit("order:preparing", { orderId });
    setPending((p) => p.filter((o) => o._id !== orderId));
    setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1) }));
  };

  const handleReject = async (orderId) => {
    await api.patch(`/orders/${orderId}/status`, { status: "rejected" });
    setPending((p) => p.filter((o) => o._id !== orderId));
    setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1) }));
  };

  const toggleRestaurantOpen = async () => {
    const { data } = await api.patch("/restaurants/mine/toggle");
    setRestaurant((r) => ({ ...r, isOpen: data.isOpen }));
  };

  if (loading) return <><Navbar /><div className="owner-loading">Loading dashboard…</div></>;

  return (
    <div className="owner-page">
      <Navbar />

      <div className="owner-container">
        {/* ── Header ── */}
        <div className="owner-header">
          <div>
            <h1>{restaurant?.name ?? "My Restaurant"}</h1>
            <p className="owner-sub">{restaurant?.cuisine} · {restaurant?.address}</p>
          </div>
          <button
            className={`open-toggle ${restaurant?.isOpen ? "open" : "closed"}`}
            onClick={toggleRestaurantOpen}
          >
            {restaurant?.isOpen ? "🟢 Open" : "🔴 Closed"} — Click to toggle
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">₹{Number(stats.revenue).toFixed(0)}</div>
            <div className="stat-label">Today's Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Orders Today</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Now</div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="quick-actions">
          <Link to="/owner/menu"     className="action-card">📋 Manage Menu</Link>
          <Link to="/owner/orders"   className="action-card">📦 All Orders</Link>
          <Link to="/owner/settings" className="action-card">⚙️ Restaurant Settings</Link>
        </div>

        {/* ── Incoming Orders ── */}
        <section className="owner-section">
          <h2>
            Incoming Orders
            {pendingOrders.length > 0 && <span className="badge">{pendingOrders.length}</span>}
          </h2>

          {pendingOrders.length === 0 ? (
            <div className="empty-section">✅ No pending orders right now</div>
          ) : (
            <div className="orders-queue">
              {pendingOrders.map((order) => (
                <div key={order._id} className="incoming-card">
                  <div className="incoming-top">
                    <span className="order-ref">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className="order-time">
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="order-total">₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="incoming-items">
                    {order.items?.map((item, i) => (
                      <span key={i} className="item-chip">{item.quantity}× {item.name}</span>
                    ))}
                  </div>
                  <div className="incoming-actions">
                    <button className="btn-accept" onClick={() => handleAccept(order._id)}>✓ Accept</button>
                    <button className="btn-reject" onClick={() => handleReject(order._id)}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}