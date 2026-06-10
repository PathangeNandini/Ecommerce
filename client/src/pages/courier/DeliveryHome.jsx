import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import "./Courier.css";

export default function DeliveryHome() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [orders, setOrders]       = useState([]);
  const [myOrders, setMyOrders]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [online, setOnline]       = useState(true);
  const [earnings, setEarnings]   = useState({
    today: 0, week: 0, totalDeliveries: 0, todayDeliveries: 0,
  });

  useEffect(() => {
    Promise.all([
      api.get("/orders/available-deliveries"),
      api.get("/orders/my-deliveries"),
      api.get("/orders/my-earnings"),
    ]).then(([avail, mine, earn]) => {
      setOrders(Array.isArray(avail.data) ? avail.data : []);
      setMyOrders(Array.isArray(mine.data) ? mine.data : []);
      setEarnings(earn.data ?? { today: 0, week: 0, totalDeliveries: 0, todayDeliveries: 0 });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("order:assigned", (order) => {
      setOrders((prev) => prev.filter((o) => o._id !== order.orderId));
    });
    return () => socket.off("order:assigned");
  }, [socket]);

  const acceptDelivery = async (orderId) => {
    setAccepting(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "assigned" });
      navigate(`/delivery/active/${orderId}`);
    } catch {
      setAccepting(null);
    }
  };

  const continueDelivery = (orderId) => {
    navigate(`/delivery/active/${orderId}`);
  };

  return (
    <div className="courier-page">
      <nav className="courier-nav">
        <div className="courier-brand">🚴 Courier Dashboard</div>
        <div className="courier-nav-right">
          <button
            className={`online-toggle ${online ? "online" : "offline"}`}
            onClick={() => setOnline(!online)}
          >
            {online ? "🟢 Online" : "🔴 Offline"}
          </button>
          <button className="courier-home-btn" onClick={() => navigate("/")}>← Home</button>
        </div>
      </nav>

      <div className="courier-content">

        {/* ── Earnings Tracker ── */}
        <section className="courier-section">
          <h2>💰 Your Earnings</h2>
          <div className="earnings-grid">
            <div className="earnings-card primary">
              <div className="earnings-value">₹{earnings.today?.toFixed(0)}</div>
              <div className="earnings-label">Today's Earnings</div>
              <div className="earnings-sub">{earnings.todayDeliveries} deliveries</div>
            </div>
            <div className="earnings-card">
              <div className="earnings-value">₹{earnings.week?.toFixed(0)}</div>
              <div className="earnings-label">This Week</div>
              <div className="earnings-sub">Last 7 days</div>
            </div>
            <div className="earnings-card">
              <div className="earnings-value">{earnings.totalDeliveries}</div>
              <div className="earnings-label">Total Deliveries</div>
              <div className="earnings-sub">All time</div>
            </div>
          </div>
        </section>

        {/* ── Active Deliveries ── */}
        {myOrders.length > 0 && (
          <section className="courier-section">
            <h2>🚚 My Active Deliveries</h2>
            <div className="orders-list">
              {myOrders.map((order) => (
                <div key={order._id} className="delivery-card active-delivery">
                  <div className="delivery-top">
                    <span className="order-ref">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className="delivery-status">{order.status.toUpperCase()}</span>
                    <span className="order-total">₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="delivery-info">
                    <p>🏪 {order.restaurantName || order.restaurantId?.name}</p>
                    <p>📍 {order.deliveryAddress || "Address not provided"}</p>
                  </div>
                  <div className="delivery-items">
                    {order.items?.map((item, i) => (
                      <span key={i} className="item-chip">{item.qty}× {item.name}</span>
                    ))}
                  </div>
                  <button
                    className="btn-continue-delivery"
                    onClick={() => continueDelivery(order._id)}
                  >
                    Continue Delivery →
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Available Deliveries ── */}
        <section className="courier-section">
          <h2>
            📦 Available Deliveries
            {orders.length > 0 && <span className="badge">{orders.length}</span>}
          </h2>

          {loading ? (
            <div className="courier-loading">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="empty-section">✅ No available deliveries right now</div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="delivery-card">
                  <div className="delivery-top">
                    <span className="order-ref">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className="order-time">
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="order-total">₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="delivery-info">
                    <p>🏪 {order.restaurantName || order.restaurantId?.name}</p>
                    <p>📍 {order.deliveryAddress || "Address not provided"}</p>
                    <p>👤 {order.customerName || order.userId?.name}</p>
                  </div>
                  <div className="delivery-items">
                    {order.items?.map((item, i) => (
                      <span key={i} className="item-chip">{item.qty}× {item.name}</span>
                    ))}
                  </div>
                  <button
                    className="btn-accept-delivery"
                    disabled={accepting === order._id || !online}
                    onClick={() => acceptDelivery(order._id)}
                  >
                    {accepting === order._id ? "Accepting…" : "Accept Delivery"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}