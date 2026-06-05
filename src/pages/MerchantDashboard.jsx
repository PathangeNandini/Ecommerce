import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import "./MerchantDashboard.css";

export default function MerchantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();

  const [menuItems, setMenuItems] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guard: only restaurant owners
  useEffect(() => {
    if (user && user.role !== "restaurant") navigate("/");
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.get("/menu/mine"),
      api.get("/orders/revenue"),
    ]).then(([menuRes, revRes]) => {
      setMenuItems(menuRes.data || []);
      setRevenue(revRes.data?.total ?? 0);
    }).finally(() => setLoading(false));
  }, []);

  // WebSocket: incoming orders
  useEffect(() => {
    if (!socket) return;
    socket.emit("join:restaurant", user?.restaurantId);

    socket.on("order:placed", (order) => {
      setIncomingOrders((prev) => [order, ...prev]);
    });

    return () => socket.off("order:placed");
  }, [socket, user]);

  const toggleAvailability = async (item) => {
    await api.patch(`/menu/${item._id}`, { available: !item.available });
    setMenuItems((prev) =>
      prev.map((m) => m._id === item._id ? { ...m, available: !m.available } : m)
    );
  };

  const handleAccept = async (order) => {
    await api.patch(`/orders/${order._id}/status`, { status: "preparing" });
    socket.emit("order:preparing", { orderId: order._id });
    setIncomingOrders((prev) => prev.filter((o) => o._id !== order._id));
  };

  const handleReject = (order) => {
    setIncomingOrders((prev) => prev.filter((o) => o._id !== order._id));
  };

  if (loading) return <div className="dash-loading">Loading dashboard…</div>;

  return (
    <div className="dash-page">
      <nav className="dash-nav">
        <div className="dash-brand">🏪 Merchant Dashboard</div>
        <button className="dash-home-btn" onClick={() => navigate("/")}>← Home</button>
      </nav>

      {/* Revenue banner */}
      <div className="revenue-banner">
        <div className="rev-card">
          <div className="rev-amount">₹{Number(revenue).toFixed(2)}</div>
          <div className="rev-label">Today's Revenue</div>
        </div>
        <div className="rev-card">
          <div className="rev-amount">{incomingOrders.length}</div>
          <div className="rev-label">Pending Orders</div>
        </div>
        <div className="rev-card">
          <div className="rev-amount">{menuItems.filter((m) => m.available).length}/{menuItems.length}</div>
          <div className="rev-label">Items Available</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Incoming orders */}
        <section className="dash-section">
          <h2>
            Incoming Orders
            {incomingOrders.length > 0 && (
              <span className="badge">{incomingOrders.length}</span>
            )}
          </h2>

          {incomingOrders.length === 0 ? (
            <div className="empty-section">No pending orders right now 🎉</div>
          ) : (
            <div className="orders-queue">
              {incomingOrders.map((order) => (
                <div key={order._id} className="incoming-order-card">
                  <div className="incoming-order-header">
                    <span className="incoming-order-id">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className="incoming-total">₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="incoming-items">
                    {order.items?.map((item, i) => (
                      <span key={i} className="incoming-item-chip">
                        {item.quantity}× {item.name}
                      </span>
                    ))}
                  </div>
                  <div className="incoming-actions">
                    <button className="accept-btn" onClick={() => handleAccept(order)}>✓ Accept</button>
                    <button className="reject-btn" onClick={() => handleReject(order)}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Menu management */}
        <section className="dash-section">
          <h2>Menu Management</h2>
          <div className="menu-list">
            {menuItems.map((item) => (
              <div key={item._id} className="menu-row">
                <div className="menu-row-info">
                  <span className="menu-row-name">{item.name}</span>
                  <span className="menu-row-price">₹{item.price}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={() => toggleAvailability(item)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
