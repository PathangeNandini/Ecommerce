import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CartSidebar from "../components/CartSidebar";
import "./Home.css";

const CUISINES = ["All", "Indian", "Chinese", "Italian", "Mexican", "Burgers", "Pizza", "Biryani"];

// ─── emoji food backgrounds for cards ───────────────────────────────────────
const FOOD_EMOJIS = ["🍛", "🍕", "🍜", "🌮", "🍔", "🥘", "🍱", "🥗", "🍣", "🫕"];

export default function Home() {
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [locating, setLocating]       = useState(true);   // ← NEW: waiting for browser GPS
  const [error, setError]             = useState("");
  const [coords, setCoords]           = useState(null);
  const [filters, setFilters]         = useState({ cuisine: "All", minRating: 0, radius: 5 });
  const [page, setPage]               = useState(0);
  const [hasMore, setHasMore]         = useState(false);
  const [cartOpen, setCartOpen]       = useState(false);
  const [fetched, setFetched]         = useState(false);  // ← NEW: did we try fetching at least once?

  // ── fetch restaurants from backend ────────────────────────────────────────
  const fetchRestaurants = useCallback(async (position, f, p = 0) => {
    if (!position) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        lat:    position.lat,
        lng:    position.lng,
        radius: f.radius,
        page:   p,
        limit:  8,
      };
      if (f.cuisine !== "All") params.cuisine  = f.cuisine;
      if (f.minRating > 0)     params.minRating = f.minRating;

      const { data } = await api.get("/restaurants/nearby", { params });
      setRestaurants(p === 0 ? data : (prev) => [...prev, ...data]);
      setHasMore(data.length === 8);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : "Could not load restaurants. Check your connection and try again."
      );
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  // ── request geolocation on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setLocating(false);
        fetchRestaurants(c, filters, 0);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("📍 Location access denied. Please allow location in your browser and refresh.");
        } else {
          setError("Could not detect your location. Please try again.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── filter change ─────────────────────────────────────────────────────────
  const handleFilterChange = (key, val) => {
    if (!coords) return;                       // don't fetch before location is known
    const newFilters = { ...filters, [key]: val };
    setFilters(newFilters);
    setPage(0);
    setFetched(false);
    fetchRestaurants(coords, newFilters, 0);
  };

  // ── pagination ────────────────────────────────────────────────────────────
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(coords, filters, nextPage);
  };

  // ── what to show in the main content area ─────────────────────────────────
  const renderContent = () => {
    // 1. Waiting for the browser location popup
    if (locating) {
      return (
        <div className="locating-state">
          <div className="locating-spinner" />
          <p>Detecting your location…</p>
          <small>Please allow location access when your browser asks.</small>
        </div>
      );
    }

    // 2. Error (location denied, network error, etc.)
    if (error) {
      return <div className="error-banner">{error}</div>;
    }

    // 3. Loading first page → show skeletons
    if (loading && page === 0) {
      return (
        <div className="skeleton-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      );
    }

    // 4. Fetched, no results
    if (fetched && restaurants.length === 0 && !loading) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No restaurants found nearby</h3>
          <p>Try increasing the radius or changing the cuisine filter.</p>
          <button
            className="retry-btn"
            onClick={() => { setFetched(false); fetchRestaurants(coords, filters, 0); }}
          >
            Retry
          </button>
        </div>
      );
    }

    // 5. Results grid
    return (
      <>
        <div className="restaurant-grid">
          {restaurants.map((r, idx) => (
            <Link to={`/restaurant/${r._id}`} key={r._id} className="restaurant-card">
              <div className="card-img" style={{ background: `hsl(${(idx * 37) % 360}, 20%, 14%)` }}>
                <span className="card-cuisine-badge">{r.cuisine}</span>
                <div className="card-img-placeholder">
                  {FOOD_EMOJIS[idx % FOOD_EMOJIS.length]}
                </div>
              </div>
              <div className="card-body">
                <h3>{r.name}</h3>
                <div className="card-meta">
                  <span className="rating">⭐ {r.rating?.toFixed(1) || "New"}</span>
                  <span className="distance">
                    📍 {r.distance ? (r.distance / 1000).toFixed(1) + " km" : "Nearby"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {loading && page > 0 && (
          <div className="skeleton-grid" style={{ marginTop: "1.25rem" }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
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

  // ── cart item count for badge ──────────────────────────────────────────────
  const cartCount = 0; // CartContext provides this — import useCart if needed

  return (
    <div className="home">

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-brand">🍽️ FoodRush</div>
        <div className="nav-actions">
          {user && <span className="nav-user">Hey, {user.name?.split(" ")[0] || "there"} 👋</span>}
          <Link to="/profile" className="nav-link">Profile</Link>
          {user?.role === "restaurant" && (
            <Link to="/merchant" className="nav-link">Dashboard</Link>
          )}
          <button className="nav-cart" onClick={() => setCartOpen(true)}>
            🛒 Cart
          </button>
          <button className="nav-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="hero">
        <h1>What are you craving?</h1>
        <p>Fresh food from restaurants near you, delivered fast.</p>
      </div>

      {/* ── Filters ── */}
      <div className="filters-bar">
        <div className="cuisine-pills">
          {CUISINES.map((c) => (
            <button
              key={c}
              className={`pill ${filters.cuisine === c ? "active" : ""}`}
              onClick={() => handleFilterChange("cuisine", c)}
              disabled={locating}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filter-controls">
          <label>
            Min rating
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange("minRating", Number(e.target.value))}
              disabled={locating}
            >
              <option value={0}>Any</option>
              <option value={3}>3★+</option>
              <option value={4}>4★+</option>
              <option value={4.5}>4.5★+</option>
            </select>
          </label>
          <label>
            Radius
            <select
              value={filters.radius}
              onChange={(e) => handleFilterChange("radius", Number(e.target.value))}
              disabled={locating}
            >
              <option value={1}>1 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
            </select>
          </label>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="restaurant-grid-container">
        {renderContent()}
      </main>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
