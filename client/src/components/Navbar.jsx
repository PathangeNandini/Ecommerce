import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── CUSTOMER links ────────────────────────────────────────
  if (user?.role === "consumer") {
    return (
      <nav className="navbar">
        <Link to="/" className="nav-brand">🍽️ FoodRush</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <div className="nav-actions">
          <Link to="/cart" className="nav-cart-btn">
            🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
    );
  }

  // ── RESTAURANT OWNER links ────────────────────────────────
  if (user?.role === "restaurant") {
    return (
      <nav className="navbar navbar--owner">
        <Link to="/owner/dashboard" className="nav-brand">🏪 My Restaurant</Link>
        <div className="nav-links">
          <Link to="/owner/dashboard">Dashboard</Link>
          <Link to="/owner/orders">Orders</Link>
          <Link to="/owner/menu">Menu</Link>
          <Link to="/owner/settings">Settings</Link>
        </div>
        <div className="nav-actions">
          <Link to="/profile" className="nav-profile-link">👤 Profile</Link>
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
    );
  }

  // ── DELIVERY PARTNER links ────────────────────────────────
  if (user?.role === "courier") {
    return (
      <nav className="navbar navbar--courier">
        <Link to="/delivery" className="nav-brand">🛵 DeliverEase</Link>
        <div className="nav-links">
          <Link to="/delivery">Available Orders</Link>
          <Link to="/delivery/history">My Deliveries</Link>
        </div>
        <div className="nav-actions">
          <Link to="/profile" className="nav-profile-link">👤 Profile</Link>
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
    );
  }

  return null;
}