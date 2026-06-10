import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import CartSidebar from "../components/CartSidebar";
import "./RestaurantDetail.css";

const ITEM_IMAGES = {
  "Butter Chicken": "🍗",
  "Biryani": "🍚",
  "Dosa": "🥘",
  "Idli": "🍲",
  "Samosa": "🥟",
  "Naan": "🫓",
  "Paneer Tikka": "🔥",
  "Lassi": "🥤",
  "Coke": "🥃",
};

const CATEGORIES = [
  "Starters",
  "Main Course",
  "Breads",
  "Rice",
  "Desserts",
  "Beverages",
];

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, restaurantId: cartRestaurantId } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Starters");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menu");

  useEffect(() => {
    if (!id) return;

    // ✅ FIXED: Remove /api prefix - axios already has it as baseURL
    api
      .get(`/restaurants/${id}`)
      .then(({ data }) => {
        setRestaurant(data.restaurant);
        setItems(data.menuItems || []);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddItem = (item) => {
    addItem(item, id);
  };

  if (loading) {
    return (
      <div className="restaurant-detail-page">
        <div className="loading">Loading restaurant...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-detail-page">
        <div className="error">Restaurant not found</div>
      </div>
    );
  }

  const filteredItems = items.filter((item) => item.category === selectedCategory);

  return (
    <div className="restaurant-detail-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image">
          <span className="hero-emoji">🏪</span>
        </div>
        <div className="hero-content">
          <span className="hero-cuisine-badge">{restaurant.cuisine}</span>
          <h1>{restaurant.name}</h1>
          <div className="detail-meta">
            <span>⭐ {restaurant.rating?.toFixed(1) || "New"}</span>
            <span>·</span>
            <span>📍 {restaurant.address}</span>
            <span>·</span>
            <span className="hero-open">🟢 Open</span>
          </div>

          {/* Reserve a Table Button */}
          <button
            className="reserve-btn"
            onClick={() => navigate(`/reservation/${id}`)}
          >
            🪑 Reserve a Table
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => setActiveTab("menu")}
        >
          🍽️ Menu
        </button>
        <button
          className={`tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          ℹ️ Info
        </button>
      </div>

      {/* Content */}
      <div className="detail-content">
        {activeTab === "menu" ? (
          <>
            {/* Category Tabs */}
            <div className="category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="menu-items">
              {filteredItems.length === 0 ? (
                <div className="no-items">No items in this category</div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item._id} className="menu-item">
                    <div className="item-emoji">
                      {ITEM_IMAGES[item.name] || "🍲"}
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                    <button
                      className={`btn-add ${!item.available ? "disabled" : ""}`}
                      onClick={() => handleAddItem(item)}
                      disabled={!item.available}
                    >
                      {item.available ? "Add" : "Out of Stock"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Info Tab */
          <div className="restaurant-info">
            <div className="info-section">
              <h3>About</h3>
              <p>{restaurant.description || "A delightful dining experience awaits you."}</p>
            </div>

            <div className="info-section">
              <h3>Location</h3>
              <p>{restaurant.address}</p>
            </div>

            <div className="info-section">
              <h3>Cuisine</h3>
              <p>{restaurant.cuisine}</p>
            </div>

            <div className="info-section">
              <h3>Hours</h3>
              <p>11:00 AM - 11:00 PM Daily</p>
            </div>

            <div className="info-section">
              <h3>Rating</h3>
              <p>⭐ {restaurant.rating?.toFixed(1) || "New"} / 5.0</p>
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {cartRestaurantId === id && <CartSidebar />}
    </div>
  );
}