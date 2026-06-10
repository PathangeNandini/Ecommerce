import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./MyReservations.css";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api
      .get("/reservations/my")
      .then(({ data }) => setReservations(data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    setCancelling(id);
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "cancelled" } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel reservation");
    } finally {
      setCancelling(null);
    }
  };

  const statusColor = {
    pending: "#f59e0b",
    confirmed: "#22c55e",
    cancelled: "#ef4444",
    completed: "#6366f1",
  };

  if (loading) return <div className="myres-loading">Loading reservations...</div>;

  return (
    <div className="myres-page">
      <div className="myres-container">
        <div className="myres-header">
          <h2>My Reservations</h2>
          <Link to="/" className="myres-back">← Back to Home</Link>
        </div>

        {reservations.length === 0 ? (
          <div className="myres-empty">
            <p>🍽️ No reservations yet.</p>
            <Link to="/" className="myres-cta">Find a Restaurant</Link>
          </div>
        ) : (
          <div className="myres-list">
            {reservations.map((r) => (
              <div key={r._id} className="myres-card">
                <div className="myres-card-header">
                  <div>
                    <h3>{r.restaurantId?.name || "Restaurant"}</h3>
                    <p className="myres-address">{r.restaurantId?.address}</p>
                  </div>
                  <span
                    className="myres-status"
                    style={{ color: statusColor[r.status] }}
                  >
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>

                <div className="myres-details">
                  <div className="myres-detail">
                    <span>📅</span>
                    <span>{new Date(r.date).toDateString()}</span>
                  </div>
                  <div className="myres-detail">
                    <span>🕐</span>
                    <span>{r.timeSlot}</span>
                  </div>
                  <div className="myres-detail">
                    <span>👥</span>
                    <span>{r.partySize} people</span>
                  </div>
                  <div className="myres-detail">
                    <span>🪑</span>
                    <span>Table #{r.tableNumber}</span>
                  </div>
                </div>

                {r.specialRequests && (
                  <p className="myres-requests">
                    💬 {r.specialRequests}
                  </p>
                )}

                {r.status === "confirmed" || r.status === "pending" ? (
                  <button
                    className="myres-cancel-btn"
                    onClick={() => handleCancel(r._id)}
                    disabled={cancelling === r._id}
                  >
                    {cancelling === r._id ? "Cancelling..." : "Cancel Reservation"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}