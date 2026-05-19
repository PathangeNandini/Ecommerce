import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import CartSidebar from "../components/CartSidebar";
import "./RestaurantDetail.css";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.get(`/restaurants/${id}`).then(({ data }) => {
      setRestaurant(data.restaurant);
      setMenuItems(data.menuItems);
    }).finally(() => setLoading(false));
  }, [id]);

  const categories = ["All", ...new Set(menuItems.map((m) => m.category).filter(Boolean))];

  const displayed = activeCategory === "All"
    ? menuItems
    : menuItems.filter((m) => m.category === activeCategory);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleAdd = (item) => {
    addItem(item, restaurant._id, restaurant.name);
    setCartOpen(true);
  };

  if (loading) return <div className="detail-loading">Loading menu…</div>;
  if (!restaurant) return <div className="detail-loading">Restaurant not found.</div>;

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <button className="cart-float-btn" onClick={() => setCartOpen(true)}>
          🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      <div className="detail-hero">
        <div className="detail-hero-icon">🏪</div>
        <div className="detail-hero-info">
          <h1>{restaurant.name}</h1>
          <p className="detail-meta">
            <span>🍴 {restaurant.cuisine}</span>
            <span>⭐ {restaurant.rating?.toFixed(1) || "New"}</span>
            <span>📍 {restaurant.address}</span>
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        {categories.map((c) => (
          <button
            key={c}
            className={`cat-tab ${activeCategory === c ? "active" : ""}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Menu */}
      <div className="menu-grid">
        {displayed.map((item) => {
          const inCart = items.find((i) => i._id === item._id);
          return (
            <div key={item._id} className={`menu-card ${!item.available ? "unavailable" : ""}`}>
              <div className="menu-card-img">🥘</div>
              <div className="menu-card-body">
                <h3>{item.name}</h3>
                <p className="menu-desc">{item.description}</p>
                <div className="menu-footer">
                  <span className="menu-price">₹{item.price}</span>
                  {item.available ? (
                    <button
                      className="add-btn"
                      onClick={() => handleAdd(item)}
                    >
                      {inCart ? `+ (${inCart.quantity})` : "+ Add"}
                    </button>
                  ) : (
                    <span className="unavail-label">Unavailable</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
