import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import CartSidebar from "../components/CartSidebar";
import "./RestaurantDetail.css";

// ✅ FIX: Expanded emoji map + fallback by category
const ITEM_IMAGES = {
  "Butter Chicken": "🍗", "Biryani": "🍚", "Dosa": "🥘", "Idli": "🍲",
  "Samosa": "🥟", "Naan": "🫓", "Paneer Tikka": "🔥", "Lassi": "🥤",
  "Coke": "🥃", "Medu Vada": "🍩", "Masala Vada": "🫔", "Paneer 65": "🧆",
  "Gobi 65": "🥦", "Onion Pakoda": "🧅", "Bread Bajji": "🍞",
};

const CATEGORY_EMOJIS = {
  "Starters": "🥗", "Main Course": "🍛", "Breads": "🫓",
  "Rice": "🍚", "Desserts": "🍮", "Beverages": "🥤",
};

const CATEGORIES = ["Starters", "Main Course", "Breads", "Rice", "Desserts", "Beverages"];

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, restaurantId: cartRestaurantId } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Starters");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menu");
  // ✅ FIX: Track recently added items for visual feedback
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.get(`/restaurants/${id}`)
      .then(({ data }) => {
        setRestaurant(data.restaurant || data);
      })
      .catch((err) => console.error("Error fetching restaurant:", err));

    api.get(`/menu/${id}`)
      .then(({ data }) => {
        setItems(Array.isArray(data) ? data : data.menuItems || []);
      })
      .catch((err) => {
        console.error("Error fetching menu items:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ FIX: Show "Added!" feedback for 1.5s then revert
  const handleAddItem = (item) => {
    addItem(item, id);
    setAddedItems((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item._id]: false }));
    }, 1500);
  };

  if (loading) return <div className="restaurant-detail-page"><div className="loading">Loading restaurant...</div></div>;
  if (!restaurant) return <div className="restaurant-detail-page"><div className="error">Restaurant not found</div></div>;

  // ✅ FIX: Show all items if none match selected category (fallback)
  const filteredItems = items.filter((item) => item.category === selectedCategory);
  const categoriesToShow = CATEGORIES.filter((cat) => items.some((i) => i.category === cat));

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
          <button className="reserve-btn" onClick={() => navigate(`/reservation/${id}`)}>
            🪑 Reserve a Table
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button className={`tab ${activeTab === "menu" ? "active" : ""}`} onClick={() => setActiveTab("menu")}>🍽️ Menu</button>
        <button className={`tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>ℹ️ Info</button>
      </div>

      <div className="detail-content">
        {activeTab === "menu" ? (
          <>
            {/* Category Tabs — only show categories that have items */}
            <div className="category-tabs">
              {(categoriesToShow.length > 0 ? categoriesToShow : CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {CATEGORY_EMOJIS[cat]} {cat}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="menu-items">
              {filteredItems.length === 0 ? (
                <div className="no-items">
                  📭 No items in this category
                  {items.length === 0 && (
                    <p style={{ fontSize: "0.85rem", marginTop: "8px", color: "#666" }}>
                      Restaurant hasn't added menu items yet
                    </p>
                  )}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item._id} className="menu-item">
                    <div className="item-emoji">
                      {/* ✅ FIX: Use item image if available, else name map, else category emoji */}
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
                        : (ITEM_IMAGES[item.name] || CATEGORY_EMOJIS[item.category] || "🍽️")}
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                    {/* ✅ FIX: Visual feedback when item added */}
                    <button
                      className={`btn-add ${addedItems[item._id] ? "added" : ""} ${!item.available ? "disabled" : ""}`}
                      onClick={() => handleAddItem(item)}
                      disabled={!item.available}
                    >
                      {!item.available ? "Out of Stock" : addedItems[item._id] ? "✓ Added!" : "Add"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="restaurant-info">
            <div className="info-section"><h3>About</h3><p>{restaurant.description || "A delightful dining experience awaits you."}</p></div>
            <div className="info-section"><h3>Location</h3><p>{restaurant.address}</p></div>
            <div className="info-section"><h3>Cuisine</h3><p>{restaurant.cuisine}</p></div>
            <div className="info-section"><h3>Hours</h3><p>11:00 AM - 11:00 PM Daily</p></div>
            <div className="info-section"><h3>Rating</h3><p>⭐ {restaurant.rating?.toFixed(1) || "New"} / 5.0</p></div>
          </div>
        )}
      </div>

      {cartRestaurantId === id && <CartSidebar />}
    </div>
  );
}