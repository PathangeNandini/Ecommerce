import { useLocation, Link } from "react-router-dom";
import "./PaymentSuccess.css";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const { transactionId, amount, orderId } = state || {};

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h2>Payment Successful!</h2>
        <p className="success-amount">₹{amount?.toFixed(2)} paid</p>

        <div className="success-details">
          <div className="detail-row">
            <span>Transaction ID</span>
            <span>{transactionId || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span>Order ID</span>
            <span>{orderId || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <span className="status-paid">Paid</span>
          </div>
        </div>

        <div className="success-actions">
          <Link to={`/order/${orderId}`} className="track-btn">
            Track Order
          </Link>
          <Link to="/" className="home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}