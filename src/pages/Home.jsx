import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CartSidebar from "../components/CartSidebar";
import "./Home.css";

const CUISINES = ["All", "South Indian", "Biryani", "Chinese", "Fast Food", "North Indian", "Seafood", "Chettinad", "Cafe", "Desserts", "Italian"];

// Using Foodish API (free, no auth, reliable food images) + fallbacks
// Per-restaurant images (matched by name keywords)
const RESTAURANT_IMAGES = {
  "Murugan Idli Shop":       "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Saravana Bhavan":         "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Ratna Cafe":              "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Vasanta Bhavan":          "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Sri Krishna Bhavan":      "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Mylai Karpagambal Mess":  "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Dindigul Thalappakatti":  "https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Buhari Hotel":            "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Junior Kuppanna":         "https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Ponnusamy Hotel":         "https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Paradise Biryani":        "https://images.pexels.com/photos/12737647/pexels-photo-12737647.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Bawarchi Restaurant":     "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Anjappar Chettinad":      "https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Karaikudi Restaurant":    "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Bangala Table":           "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chettinad Mess":          "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Pizza Hut":               "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Domino's Pizza":          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400",
  "McDonald's":              "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
  "KFC":                     "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Burger King":             "https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Subway":                  "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Mainland China":          "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Wok Express":             "https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Yo China":                "https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chinese Hut":             "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Copper Chimney":          "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Punjabi Dhaba":           "https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tandoor Garden":          "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Rajdhani Thali":          "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Peshawri":                "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Zaitoon Restaurant":      "https://images.pexels.com/photos/1581554/pexels-photo-1581554.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Marina Fish Corner":      "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Kaaraikudi Fish House":   "https://images.pexels.com/photos/3843369/pexels-photo-3843369.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Hot Breads":              "https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Nilgiris Bakery":         "https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Bread & Circus":          "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
  "The Brew Room":           "https://images.pexels.com/photos/509922/pexels-photo-509922.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Adyar Ananda Bhavan":     "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Kalathi Sweets":          "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Cream Stone Ice Cream":   "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
  "The Flying Elephant":     "https://images.pexels.com/photos/414235/pexels-photo-414235.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tuscana Pizzeria":        "https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Savya Rasa":              "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Dakshin":                 "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Southern Spice":          "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Hyderabad Biryani House": "https://images.pexels.com/photos/12737647/pexels-photo-12737647.jpeg?auto=compress&cs=tinysrgb&w=400",
  "The Great Kabab Factory": "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Barbeque Nation":         "https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg?auto=compress&cs=tinysrgb&w=400",
  "The Tamil Nadu Restaurant":"https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400",
};

const FALLBACK_IMAGE = "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=400";

function getDeliveryTime(distanceKm) {
  if (!distanceKm) return "20–30 min";
  if (distanceKm <= 2) return "15–20 min";
  if (distanceKm <= 5) return "25–35 min";
  if (distanceKm <= 10) return "35–45 min";
  if (distanceKm <= 50) return "45–60 min";
  return "60–90 min";
}

function getPriceRange(cuisine) {
  const expensive = ["Continental", "Italian", "Seafood"];
  const moderate = ["North Indian", "Chinese", "Chettinad", "Cafe", "Multi Cuisine"];
  if (expensive.includes(cuisine)) return "₹₹₹";
  if (moderate.includes(cuisine)) return "₹₹";
  return "₹";
}

export default function Home() {
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [filters, setFilters] = useState({ cuisine: "All", minRating: 0, radius: 1000 });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [fetched, setFetched] = useState(false);
  const restaurantsRef = useRef([]);

  const fetchRestaurants = useCallback(async (position, f, p = 0) => {
    if (!position) return;
    setLoading(true);
    setError("");
    try {
      const params = { lat: position.lat, lng: position.lng, radius: f.radius, page: p, limit: 8 };
      if (f.cuisine !== "All") params.cuisine = f.cuisine;
      if (f.minRating > 0) params.minRating = f.minRating;

      const response = await api.get("/restaurants/nearby", { params });
      const raw = response.data;
      const list = Array.isArray(raw) ? raw
        : Array.isArray(raw?.results) ? raw.results
        : Array.isArray(raw?.restaurants) ? raw.restaurants
        : [];

      const updated = p === 0 ? list : [...restaurantsRef.current, ...list];
      restaurantsRef.current = updated;
      setRestaurants(updated);
      setHasMore(raw?.hasMore || false);
    } catch (err) {
      setError(err.response?.status === 401 ? "Session expired. Please login again." : "Could not load restaurants.");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setLocating(false);
        fetchRestaurants(c, { cuisine: "All", minRating: 0, radius: 1000 }, 0);
      },
      () => { setLocating(false); setError("Could not detect your location. Please allow location access."); },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleFilterChange = (key, value) => {
    if (!coords) return;
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    setPage(0);
    restaurantsRef.current = [];
    fetchRestaurants(coords, updatedFilters, 0);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(coords, filters, nextPage);
  };

  const renderContent = () => {
    if (locating) return (
      <div className="locating-state">
        <div className="locating-spinner"></div>
        <p>Detecting your location...</p>
        <small>Please allow location access</small>
      </div>
    );

    if (error) return <div className="error-banner">{error}</div>;

    if (loading && page === 0) return (
      <div className="restaurant-grid">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
      </div>
    );

    if (fetched && restaurants.length === 0 && !loading) return (
      <div className="empty-state">
        <div className="empty-icon">🍜</div>
        <h3>No restaurants found nearby</h3>
        <p>Try increasing the radius or changing cuisine filter.</p>
        <button className="retry-btn" onClick={() => fetchRestaurants(coords, filters, 0)}>Retry</button>
      </div>
    );

    return (
      <>
        <div className="restaurant-grid">
          {restaurants.map((r) => {
            const img = RESTAURANT_IMAGES[r.name] || FALLBACK_IMAGE;
            return (
              <Link to={`/restaurant/${r._id}`} key={r._id} className="restaurant-card">
                <div className="card-img">
                  <img
                    src={img}
                    alt={r.cuisine}
                    loading="lazy"
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  />
                  <div className="card-img-overlay" />
                  <span className="card-cuisine-badge">{r.cuisine}</span>
                  {r.distanceKm && r.distanceKm <= 5 && (
                    <span className="card-nearby-badge">🔥 Nearby</span>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-name">{r.name}</h3>
                  <p className="card-address">📍 {r.address}</p>
                  <div className="card-meta">
                    <span className="card-rating">⭐ {r.rating?.toFixed(1) || "New"}</span>
                    <span className="card-dot">·</span>
                    <span className="card-delivery">🕐 {getDeliveryTime(r.distanceKm)}</span>
                    <span className="card-dot">·</span>
                    <span className="card-price">{getPriceRange(r.cuisine)}</span>
                  </div>
                  <div className="card-footer">
                    <span className="card-distance">
                      {r.distanceKm ? `${r.distanceKm} km away` : "Nearby"}
                    </span>
                    <span className="card-free-delivery">Free delivery</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {loading && page > 0 && (
          <div className="restaurant-grid" style={{ marginTop: "1.25rem" }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
          </div>
        )}

        {hasMore && !loading && (
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={loadMore}>Load More</button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-brand">🍽️ FoodRush</div>
        <div className="nav-actions">
          {user && <span className="nav-user">Hey, {user.name?.split(" ")[0] || "there"} 👋</span>}
          <Link to="/profile" className="nav-link">Profile</Link>
          {user?.role === "restaurant" && <Link to="/merchant" className="nav-link">Dashboard</Link>}
          <button className="nav-cart" onClick={() => setCartOpen(true)}>🛒 Cart</button>
          <button className="nav-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="hero">
        <h1>What are you craving?</h1>
        <p>Fresh food from restaurants near you, delivered fast.</p>
      </div>

      <div className="filters-bar">
        <div className="cuisine-pills">
          {CUISINES.map((c) => (
            <button key={c} className={`pill ${filters.cuisine === c ? "active" : ""}`}
              onClick={() => handleFilterChange("cuisine", c)} disabled={locating}>
              {c}
            </button>
          ))}
        </div>
        <div className="filter-controls">
          <label>
            Min rating
            <select value={filters.minRating} onChange={(e) => handleFilterChange("minRating", Number(e.target.value))}>
              <option value={0}>Any</option>
              <option value={3}>3★+</option>
              <option value={4}>4★+</option>
              <option value={4.5}>4.5★+</option>
            </select>
          </label>
          <label>
            Radius
            <select value={filters.radius} onChange={(e) => handleFilterChange("radius", Number(e.target.value))}>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={500}>500 km</option>
              <option value={1000}>1000 km</option>
            </select>
          </label>
        </div>
      </div>

      <main className="restaurant-grid-container">{renderContent()}</main>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}