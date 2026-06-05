import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CartSidebar from "../components/CartSidebar";
import "./Home.css";

const CUISINES = [
  "All",
  "Indian",
  "Chinese",
  "Italian",
  "Mexican",
  "Burgers",
  "Pizza",
  "Biryani"
];

const FOOD_EMOJIS = [
  "🍛",
  "🍕",
  "🍜",
  "🌮",
  "🍔",
  "🥘",
  "🍱",
  "🥗",
  "🍣",
  "🫕"
];

export default function Home() {

  const { user, logout } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);

  const [filters, setFilters] = useState({
    cuisine: "All",
    minRating: 0,
    radius: 5
  });

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [fetched, setFetched] = useState(false);

  // ───────────────── FETCH RESTAURANTS ─────────────────
  const fetchRestaurants = useCallback(async (position, f, p = 0) => {

    if (!position) return;

    setLoading(true);
    setError("");

    try {

      const params = {
        lat: position.lat,
        lng: position.lng,
        radius: f.radius,
        page: p,
        limit: 8
      };

      if (f.cuisine !== "All") {
        params.cuisine = f.cuisine;
      }

      if (f.minRating > 0) {
        params.minRating = f.minRating;
      }

      const response = await api.get(
        "/restaurants/nearby",
        { params }
      );

      const raw = response.data;

      // ✅ FIXED HERE
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw?.restaurants)
        ? raw.restaurants
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      setRestaurants(
        p === 0
          ? list
          : [...restaurants, ...list]
      );

      setHasMore(raw?.hasMore || false);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.status === 401
          ? "Session expired. Please login again."
          : "Could not load restaurants."
      );

    } finally {

      setLoading(false);
      setFetched(true);

    }

  }, [restaurants]);

  // ───────────────── GET USER LOCATION ─────────────────
  useEffect(() => {

    if (!navigator.geolocation) {

      setError("Geolocation not supported");
      setLocating(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        setCoords(c);
        setLocating(false);

        fetchRestaurants(c, filters, 0);

      },

      (err) => {

        setLocating(false);

        if (err.code === err.PERMISSION_DENIED) {

          setError(
            "Please allow location access and refresh."
          );

        } else {

          setError(
            "Could not detect your location."
          );

        }

      },

      {
        timeout: 10000,
        maximumAge: 60000
      }

    );

  }, []);

  // ───────────────── FILTER CHANGE ─────────────────
  const handleFilterChange = (key, value) => {

    if (!coords) return;

    const updatedFilters = {
      ...filters,
      [key]: value
    };

    setFilters(updatedFilters);
    setPage(0);
    setFetched(false);

    fetchRestaurants(
      coords,
      updatedFilters,
      0
    );
  };

  // ───────────────── LOAD MORE ─────────────────
  const loadMore = () => {

    const nextPage = page + 1;

    setPage(nextPage);

    fetchRestaurants(
      coords,
      filters,
      nextPage
    );
  };

  // ───────────────── UI STATES ─────────────────
  const renderContent = () => {

    // Location loading
    if (locating) {

      return (
        <div className="locating-state">

          <div className="locating-spinner"></div>

          <p>Detecting your location...</p>

          <small>
            Please allow location access
          </small>

        </div>
      );
    }

    // Error
    if (error) {

      return (
        <div className="error-banner">
          {error}
        </div>
      );
    }

    // Loading skeleton
    if (loading && page === 0) {

      return (
        <div className="skeleton-grid">

          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="skeleton-card"
            ></div>
          ))}

        </div>
      );
    }

    // Empty state
    if (
      fetched &&
      restaurants.length === 0 &&
      !loading
    ) {

      return (
        <div className="empty-state">

          <div className="empty-icon">
           🍜❤️
          </div>

          <h3>
            No restaurants found nearby
          </h3>

          <p>
            Try increasing the radius
            or changing cuisine filter.
          </p>

          <button
            className="retry-btn"
            onClick={() =>
              fetchRestaurants(coords, filters, 0)
            }
          >
            Retry
          </button>

        </div>
      );
    }

    // Restaurant grid
    return (
      <>

        <div className="restaurant-grid">

          {restaurants.map((r, idx) => (

            <Link
              to={`/restaurant/${r._id}`}
              key={r._id}
              className="restaurant-card"
            >

              <div
                className="card-img"
                style={{
                  background: `hsl(${(idx * 37) % 360}, 20%, 14%)`
                }}
              >

                <span className="card-cuisine-badge">
                  {r.cuisine}
                </span>

                <div className="card-img-placeholder">
                  {
                    FOOD_EMOJIS[
                      idx % FOOD_EMOJIS.length
                    ]
                  }
                </div>

              </div>

              <div className="card-body">

                <h3>{r.name}</h3>

                <div className="card-meta">

                  <span className="rating">
                    ⭐ {r.rating?.toFixed(1) || "New"}
                  </span>

                  <span className="distance">
                    📍 {
                      r.distanceKm
                        ? `${r.distanceKm} km`
                        : "Nearby"
                    }
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

        {loading && page > 0 && (

          <div
            className="skeleton-grid"
            style={{ marginTop: "1.25rem" }}
          >

            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="skeleton-card"
              ></div>
            ))}

          </div>

        )}

        {hasMore && !loading && (

          <div className="load-more-wrap">

            <button
              className="load-more-btn"
              onClick={loadMore}
            >
              Load More
            </button>

          </div>

        )}

      </>
    );
  };

  // ───────────────── MAIN UI ─────────────────
  return (

    <div className="home">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="nav-brand">
          🍽️ FoodRush
        </div>

        <div className="nav-actions">

          {user && (
            <span className="nav-user">
              Hey, {user.name?.split(" ")[0] || "there"} 👋
            </span>
          )}

          <Link
            to="/profile"
            className="nav-link"
          >
            Profile
          </Link>

          {user?.role === "restaurant" && (
            <Link
              to="/merchant"
              className="nav-link"
            >
              Dashboard
            </Link>
          )}

          <button
            className="nav-cart"
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart
          </button>

          <button
            className="nav-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* HERO */}
      <div className="hero">

        <h1>
          What are you craving?
        </h1>

        <p>
          Fresh food from restaurants near you,
          delivered fast.
        </p>

      </div>

      {/* FILTERS */}
      <div className="filters-bar">

        <div className="cuisine-pills">

          {CUISINES.map((c) => (

            <button
              key={c}
              className={`pill ${
                filters.cuisine === c
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleFilterChange(
                  "cuisine",
                  c
                )
              }
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
              onChange={(e) =>
                handleFilterChange(
                  "minRating",
                  Number(e.target.value)
                )
              }
            >

              <option value={0}>
                Any
              </option>

              <option value={3}>
                3★+
              </option>

              <option value={4}>
                4★+
              </option>

              <option value={4.5}>
                4.5★+
              </option>

            </select>

          </label>

          <label>

            Radius

            <select
              value={filters.radius}
              onChange={(e) =>
                handleFilterChange(
                  "radius",
                  Number(e.target.value)
                )
              }
            >

              <option value={1}>
                1 km
              </option>

              <option value={3}>
                3 km
              </option>

              <option value={5}>
                5 km
              </option>

              <option value={10}>
                10 km
              </option>

              <option value={50}>
                50 km
              </option>

              <option value={500}>
                500 km
              </option>

            </select>

          </label>

        </div>

      </div>

      {/* CONTENT */}
      <main className="restaurant-grid-container">
        {renderContent()}
      </main>

      {/* CART */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

    </div>
  );
}
