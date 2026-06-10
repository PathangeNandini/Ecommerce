import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Reservation.css";

export default function Reservation() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Load available slots when date changes
  useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    setSelectedSlot("");
    api
      .get(`/reservations/slots/${restaurantId}?date=${date}`)
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [date, restaurantId]);

  const handleSubmit = async () => {
    if (!date) return setError("Please select a date");
    if (!selectedSlot) return setError("Please select a time slot");
    if (!partySize) return setError("Please enter party size");

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/reservations", {
        restaurantId,
        date,
        timeSlot: selectedSlot,
        partySize,
        specialRequests,
      });

      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to make reservation");
    } finally {
      setLoading(false);
    }
  };

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <div className="reservation-page">
        <div className="reservation-card">
          <div className="res-success-icon">🎉</div>
          <h2>Reservation Confirmed!</h2>
          <p className="res-success-msg">{success.message}</p>
          <div className="res-details">
            <div className="res-detail-row">
              <span>Table</span>
              <span>#{success.reservation.tableNumber}</span>
            </div>
            <div className="res-detail-row">
              <span>Date</span>
              <span>{new Date(success.reservation.date).toDateString()}</span>
            </div>
            <div className="res-detail-row">
              <span>Time</span>
              <span>{success.reservation.timeSlot}</span>
            </div>
            <div className="res-detail-row">
              <span>Party Size</span>
              <span>{success.reservation.partySize} people</span>
            </div>
          </div>
          <button className="res-btn" onClick={() => navigate("/my-reservations")}>
            View My Reservations
          </button>
          <button className="res-btn-outline" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <div className="reservation-card">
        <h2>Book a Table</h2>

        {/* Date picker */}
        <div className="res-field">
          <label>Select Date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="res-input"
          />
        </div>

        {/* Time slots */}
        {date && (
          <div className="res-field">
            <label>Select Time Slot</label>
            {slotsLoading ? (
              <p className="res-loading">Loading slots...</p>
            ) : (
              <div className="slots-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    className={`slot-btn ${selectedSlot === slot.time ? "active" : ""} ${slot.available <= 0 ? "unavailable" : ""}`}
                    onClick={() => slot.available > 0 && setSelectedSlot(slot.time)}
                    disabled={slot.available <= 0}
                  >
                    <span>{slot.time}</span>
                    <span className="slot-available">
                      {slot.available <= 0 ? "Full" : `${slot.available} left`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Party size */}
        <div className="res-field">
          <label>Party Size</label>
          <div className="party-size-row">
            <button
              className="size-btn"
              onClick={() => setPartySize((p) => Math.max(1, p - 1))}
            >
              −
            </button>
            <span className="party-size-num">{partySize}</span>
            <button
              className="size-btn"
              onClick={() => setPartySize((p) => Math.min(20, p + 1))}
            >
              +
            </button>
            <span className="size-label">people</span>
          </div>
        </div>

        {/* Special requests */}
        <div className="res-field">
          <label>Special Requests (optional)</label>
          <textarea
            className="res-textarea"
            placeholder="e.g. window seat, birthday celebration..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
          />
        </div>

        {error && <p className="res-error">{error}</p>}

        <button
          className="res-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Booking..." : "Confirm Reservation"}
        </button>
      </div>
    </div>
  );
}