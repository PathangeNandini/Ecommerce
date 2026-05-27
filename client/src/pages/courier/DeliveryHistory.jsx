import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import "./Courier.css";

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    api.get("/orders/my-deliveries")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setDeliveries(list);
        setTotalEarned(list.reduce((s, o) => s + (o.totalPrice ?? 0) * 0.1, 0));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="courier-page">
      <Navbar />
      <div className="courier-container">
        <h1>📋 My Deliveries</h1>

        {/* Earnings summary */}
        <div className="earnings-card">
          <div className="earnings-amount">₹{totalEarned.toFixed(0)}</div>
          <div className="earnings-label">Total Earned ({deliveries.length} deliveries)</div>
        </div>

        {loading ? (
          <div className="courier-skeletons">
            {[...Array(4)].map((_, i) => <div key={i} className="courier-skeleton" />)}
          </div>
        ) : deliveries.length === 0 ? (
          <div className="courier-empty">
            <div className="courier-empty-icon">📭</div>
            <h3>No deliveries yet</h3>
            <p>Accept orders from the home screen to start earning</p>
          </div>
        ) : (
          <div className="history-list">
            {deliveries.map((order) => (
              <div key={order._id} className="history-card">
                <div className="history-left">
                  <span className="delivery-ref">#{order._id?.slice(-6).toUpperCase()}</span>
                  <span className="history-restaurant">{order.restaurantName ?? "Restaurant"}</span>
                  <span className="history-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                <div className="history-right">
                  <span className="history-order-val">₹{order.totalPrice?.toFixed(2)}</span>
                  <span className="history-earn">+₹{(order.totalPrice * 0.1).toFixed(0)} earned</span>
                  <span className="delivered-tag">✅ Delivered</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}