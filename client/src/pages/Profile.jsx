import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/auth/me"),
      api.get("/orders/my"),
    ]).then(([profileRes, ordersRes]) => {
      setProfile(profileRes.data);
      setOrders(ordersRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="profile-loading">Loading profile…</div>;

  const STATUS_COLORS = {
    placed: "#888",
    preparing: "#f59e0b",
    assigned: "#3b82f6",
    transit: "#a78bfa",
    delivered: "#4ade80",
  };

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <Link to="/" className="profile-home-link">← Back to Home</Link>
        <button className="profile-logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      {/* User card */}
      <div className="profile-hero">
        <div className="profile-avatar">{(profile?.name || user?.name || "U")[0].toUpperCase()}</div>
        <div className="profile-info">
          <h1>{profile?.name || user?.name}</h1>
          <p className="profile-email">{profile?.email || user?.email}</p>
          <span className="profile-role-badge">{profile?.role || user?.role}</span>
        </div>
        <div className="loyalty-block">
          <div className="loyalty-points">{profile?.loyaltyPoints ?? 0}</div>
          <div className="loyalty-label">Loyalty Points</div>
        </div>
      </div>

      {/* Order history */}
      <div className="profile-section">
        <h2>Order History</h2>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders yet.</p>
            <Link to="/" className="browse-link">Browse Restaurants →</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link to={`/order/${order._id}`} key={order._id} className="order-card">
                <div className="order-card-left">
                  <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="order-restaurant">{order.restaurantName || "Restaurant"}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                <div className="order-card-right">
                  <span className="order-amount">₹{order.totalPrice?.toFixed(2)}</span>
                  <span
                    className="order-status-badge"
                    style={{ color: STATUS_COLORS[order.status] || "#888" }}
                  >
                    {order.status}
                  </span>
                  {order.status === "delivered" && (
                    <Link
                      to={`/review/${order._id}`}
                      className="review-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Rate ⭐
                    </Link>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
