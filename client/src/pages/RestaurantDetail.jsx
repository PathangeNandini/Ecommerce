import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import CartSidebar from "../components/CartSidebar";
import "./RestaurantDetail.css";

const ITEM_IMAGES = {
  "Idli":            "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Masala Dosa":     "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Plain Dosa":      "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Rava Dosa":       "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Pongal":          "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Medu Vada":       "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Uttapam":         "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Filter Coffee":   "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Full Meals":      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer Dosa":     "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chicken Biryani": "https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Mutton Biryani":  "https://images.pexels.com/photos/12737647/pexels-photo-12737647.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Veg Biryani":     "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Prawn Biryani":   "https://images.pexels.com/photos/1581554/pexels-photo-1581554.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chicken 65":      "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Raita":           "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Pizza":           "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Burger":          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chicken Wings":   "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400",
  "French Fries":    "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Garlic Bread":    "https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Pasta":           "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chocolate Lava":  "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Fried Rice":      "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Noodles":         "https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Manchurian":      "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Spring Rolls":    "https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Dim Sum":         "https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Soup":            "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Butter Chicken":  "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paneer":          "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Dal":             "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Naan":            "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tikka":           "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Kebab":           "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Fish":            "https://images.pexels.com/photos/1581554/pexels-photo-1581554.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Prawn":           "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Crab":            "https://images.pexels.com/photos/3843369/pexels-photo-3843369.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Ice Cream":       "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cake":            "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Coffee":          "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Waffle":          "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Brownie":         "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cheesecake":      "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tiramisu":        "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Croissant":       "https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Bread":           "https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Gulab Jamun":     "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Halwa":           "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Ladoo":           "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=400",
};

const RESTAURANT_IMAGES = {
  "Murugan Idli Shop":        "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Saravana Bhavan":          "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Ratna Cafe":               "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Vasanta Bhavan":           "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Sri Krishna Bhavan":       "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Mylai Karpagambal Mess":   "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Dindigul Thalappakatti":   "https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Buhari Hotel":             "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Junior Kuppanna":          "https://images.pexels.com/photos/12737647/pexels-photo-12737647.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Ponnusamy Hotel":          "https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Paradise Biryani":         "https://images.pexels.com/photos/12737647/pexels-photo-12737647.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Bawarchi Restaurant":      "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Anjappar Chettinad":       "https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Karaikudi Restaurant":     "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Bangala Table":            "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Chettinad Mess":           "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Pizza Hut":                "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Domino's Pizza":           "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800",
  "McDonald's":               "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800",
  "KFC":                      "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Burger King":              "https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Subway":                   "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Mainland China":           "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Wok Express":              "https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Yo China":                 "https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Chinese Hut":              "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Copper Chimney":           "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Punjabi Dhaba":            "https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Tandoor Garden":           "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Rajdhani Thali":           "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Peshawri":                 "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Zaitoon Restaurant":       "https://images.pexels.com/photos/1581554/pexels-photo-1581554.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Marina Fish Corner":       "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Kaaraikudi Fish House":    "https://images.pexels.com/photos/3843369/pexels-photo-3843369.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Hot Breads":               "https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Nilgiris Bakery":          "https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Bread & Circus":           "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800",
  "The Brew Room":            "https://images.pexels.com/photos/509922/pexels-photo-509922.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Adyar Ananda Bhavan":      "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Kalathi Sweets":           "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Cream Stone Ice Cream":    "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800",
  "The Flying Elephant":      "https://images.pexels.com/photos/414235/pexels-photo-414235.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Tuscana Pizzeria":         "https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Savya Rasa":               "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Dakshin":                  "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Southern Spice":           "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Hyderabad Biryani House":  "https://images.pexels.com/photos/12737647/pexels-photo-12737647.jpeg?auto=compress&cs=tinysrgb&w=800",
  "The Great Kabab Factory":  "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Barbeque Nation":          "https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg?auto=compress&cs=tinysrgb&w=800",
  "The Tamil Nadu Restaurant":"https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800",
};

const FALLBACK_IMAGE = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400";

function getItemImage(name) {
  for (const [key, url] of Object.entries(ITEM_IMAGES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return FALLBACK_IMAGE;
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, forceAddItem, items, restaurantName } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [conflictItem, setConflictItem] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const { data } = await api.get(`/restaurants/${id}`);
        setRestaurant(data.restaurant ?? data);  // ← THE FIX
        setMenuItems(data.menuItems || []);
      } catch (error) {
        console.error("Failed to load restaurant:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  const categories = ["All", ...new Set(menuItems.map((m) => m.category).filter(Boolean))];
  const displayed = activeCategory === "All" ? menuItems : menuItems.filter((m) => m.category === activeCategory);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAdd = (item) => {
    if (!restaurant?._id) return;
    const result = addItem(item, restaurant._id, restaurant.name);
    if (result === "CONFLICT") {
      setConflictItem(item);
    } else {
      setCartOpen(true);
    }
  };

  const handleConfirmSwitch = () => {
    forceAddItem(conflictItem, restaurant._id, restaurant.name);
    setConflictItem(null);
    setCartOpen(true);
  };

  if (loading) return (
    <div className="detail-loading">
      <div className="detail-spinner"></div>
      <p>Loading menu...</p>
    </div>
  );

  if (!restaurant) return <div className="detail-loading">Restaurant not found.</div>;

  const heroImg = RESTAURANT_IMAGES[restaurant.name] || FALLBACK_IMAGE;

  return (
    <div className="detail-page">
      {/* STICKY HEADER */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <button className="cart-float-btn" onClick={() => setCartOpen(true)}>
          🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      {/* HERO BANNER */}
      <div className="detail-hero">
        <img src={heroImg} alt={restaurant.name} className="hero-bg"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-cuisine-badge">{restaurant.cuisine}</span>
          <h1>{restaurant.name}</h1>
          <div className="detail-meta">
            <span>⭐ {restaurant.rating?.toFixed(1) || "New"}</span>
            <span>·</span>
            <span>📍 {restaurant.address}</span>
            <span>·</span>
            <span className="hero-open">🟢 Open Now</span>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="category-tabs">
        {categories.map((category) => (
          <button key={category}
            className={`cat-tab ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}>
            {category}
          </button>
        ))}
      </div>

      {/* MENU GRID */}
      <div className="menu-grid">
        {displayed.map((item) => {
          const inCart = items.find((c) => c._id === item._id);
          const itemImg = getItemImage(item.name);
          return (
            <div key={item._id} className={`menu-card ${!item.available ? "unavailable" : ""}`}>
              <div className="menu-card-img">
                <img src={itemImg} alt={item.name} loading="lazy"
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                {!item.available && <div className="unavail-overlay">Unavailable</div>}
                {inCart && <span className="in-cart-badge">{inCart.quantity} in cart</span>}
              </div>
              <div className="menu-card-body">
                <h3>{item.name}</h3>
                <p className="menu-desc">{item.description}</p>
                <div className="menu-footer">
                  <span className="menu-price">₹{item.price}</span>
                  {item.available ? (
                    <button className="add-btn" onClick={() => handleAdd(item)}>
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

      {/* CUSTOM CONFLICT MODAL */}
      {conflictItem && (
        <div className="conflict-overlay">
          <div className="conflict-modal">
            <div className="conflict-icon">🛒</div>
            <h3>Start a new cart?</h3>
            <p>
              Your cart has items from <strong>{restaurantName}</strong>.
              Adding this item will clear your current cart.
            </p>
            <div className="conflict-actions">
              <button className="conflict-cancel" onClick={() => setConflictItem(null)}>
                Keep Current Cart
              </button>
              <button className="conflict-confirm" onClick={handleConfirmSwitch}>
                Start New Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
