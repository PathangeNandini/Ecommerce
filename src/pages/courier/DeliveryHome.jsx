import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import Navbar from "../../components/Navbar";
import "./Courier.css";

export default function DeliveryHome() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [online, setOnline]     = useState(true);

  useEffect(() => {
    api.get("/orders/available-deliveries")
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Live: new order ready for pickup
  useEffect(() => {
    if (!socket) return;
    socket.on("order:assigned", (order) => {
      setOrders((prev) => prev.filter((o) => o._id !== order._id)); // remove if claimed
    });
    return () => socket.off("order:assigned");
  }, [socket]);

  const acceptDelivery = async (orderId) => {
    setAccepting(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "assigned" });
      socket?.emit("order:courier_assigned", { orderId });
      navigate(`/delivery/active/${orderId}`);
    } catch {
      setAccepting(null);
    }
  };

  return (
    <div className="courier-page">
      <Navbar />
      <div className="courier-container">

        {/* ── Status bar ── */}
        <div className="courier-status-bar">
          <div>
            <h1>Available Deliveries</h1>
            <p className="courier-sub">Orders ready for pickup near you</p>
          </div>
          <label className="online-toggle">
            <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} />
            <span className="online-slider" />
            <span className={`online-label ${online ? "on" : "off"}`}>
              {online ? "🟢 Online" : "⚫ Offline"}
            </span>
          </label>
        </div>

        {!online && (
          <div className="offline-banner">
            You're offline. Turn on to see and accept delivery orders.
          </div>
        )}

        {loading ? (
          <div className="courier-skeletons">
            {[...Array(4)].map((_, i) => <div key={i} className="courier-skeleton" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="courier-empty">
            <div className="courier-empty-icon">🛵</div>
            <h3>No deliveries available right now</h3>
            <p>New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="delivery-list">
            {orders.map((order) => (
              <div key={order._id} className="delivery-card">
                <div className="delivery-card-header">
                  <span className="delivery-ref">#{order._id?.slice(-6).toUpperCase()}</span>
                  <span className="delivery-earn">Earn ₹{Math.round(order.totalPrice * 0.1)}</span>
                </div>

                <div className="delivery-locations">
                  <div className="loc-row">
                    <span className="loc-dot pickup" />
                    <div>
                      <p className="loc-label">Pickup</p>
                      <p className="loc-name">{order.restaurantName ?? "Restaurant"}</p>
                      <p className="loc-addr">{order.restaurantAddress ?? ""}</p>
                    </div>
                  </div>
                  <div className="loc-line" />
                  <div className="loc-row">
                    <span className="loc-dot dropoff" />
                    <div>
                      <p className="loc-label">Drop-off</p>
                      <p className="loc-name">{order.customerName ?? "Customer"}</p>
                      <p className="loc-addr">{order.deliveryAddress ?? "Address on file"}</p>
                    </div>
                  </div>
                </div>

                <div className="delivery-meta">
                  <span>🛍️ {order.items?.length} item(s)</span>
                  <span>💰 ₹{order.totalPrice?.toFixed(2)}</span>
                  <span>📍 ~{order.distanceKm ?? "?"} km</span>
                </div>

                <button
                  className="btn-accept-delivery"
                  disabled={accepting === order._id}
                  onClick={() => acceptDelivery(order._id)}
                >
                  {accepting === order._id ? "Accepting…" : "Accept Delivery"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}