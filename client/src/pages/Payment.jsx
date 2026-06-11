import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Payment.css";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId, totalPrice } = state || {};

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("4111111111111111");
  const [expiry, setExpiry] = useState("12/26");
  const [cvv, setCvv] = useState("123");
  const [upiId, setUpiId] = useState("demo@upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!orderId) {
      setError("No order found. Please place an order first.");
      return;
    }

    if (paymentMethod === "card") {
      if (cardNumber.length < 16) return setError("Enter a valid 16-digit card number");
      if (!expiry) return setError("Enter expiry date");
      if (cvv.length < 3) return setError("Enter a valid CVV");
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/payments/charge", {
        orderId,
        amount: totalPrice,
        paymentMethod,
      });

      navigate("/payment-success", {
        state: {
          transactionId: data.transaction?.transactionId || "DEMO-" + Date.now(),
          amount: data.transaction?.amount || totalPrice,
          orderId,
        },
      });
    } catch (err) {
      // Even if payment API fails, go to success for demo purposes
      navigate("/payment-success", {
        state: {
          transactionId: "DEMO-" + Date.now(),
          amount: totalPrice,
          orderId,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Skip payment — go directly to order tracking
  const handleSkip = () => {
    navigate("/order-status/" + orderId);
  };

  return (
    <div className="payment-page">
      <div className="payment-card">

        {/* Header */}
        <div className="payment-header">
          <h2>💳 Complete Payment</h2>
          <p className="payment-amount">Total: <span>₹{totalPrice?.toFixed(2)}</span></p>
        </div>

        {/* Demo Badge */}
        <div className="demo-badge">
          🧪 Simulated Payment Gateway — No real money charged
        </div>

        {/* Payment Method Tabs */}
        <div className="payment-methods">
          <button
            className={`method-btn ${paymentMethod === "card" ? "active" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            💳 Card
          </button>
          <button
            className={`method-btn ${paymentMethod === "upi" ? "active" : ""}`}
            onClick={() => setPaymentMethod("upi")}
          >
            📱 UPI
          </button>
          <button
            className={`method-btn ${paymentMethod === "cod" ? "active" : ""}`}
            onClick={() => setPaymentMethod("cod")}
          >
            💵 Cash on Delivery
          </button>
        </div>

        {/* Card Form */}
        {paymentMethod === "card" && (
          <div className="card-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={16}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="card-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            <p className="demo-hint">✅ Pre-filled with test card details</p>
          </div>
        )}

        {/* UPI Form */}
        {paymentMethod === "upi" && (
          <div className="card-form">
            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
            <div className="upi-apps">
              <span>Pay via:</span>
              <div className="upi-icons">
                <div className="upi-icon gpay">GPay</div>
                <div className="upi-icon phonepe">PhonePe</div>
                <div className="upi-icon paytm">Paytm</div>
              </div>
            </div>
            <p className="demo-hint">✅ Pre-filled with demo UPI ID</p>
          </div>
        )}

        {/* COD */}
        {paymentMethod === "cod" && (
          <div className="cod-section">
            <div className="cod-icon">💵</div>
            <h3>Pay on Delivery</h3>
            <p>Keep <strong>₹{totalPrice?.toFixed(2)}</strong> ready when your order arrives.</p>
            <ul className="cod-points">
              <li>✅ No advance payment needed</li>
              <li>✅ Pay in cash to delivery partner</li>
              <li>✅ Order confirmed immediately</li>
            </ul>
          </div>
        )}

        {error && <p className="payment-error">⚠️ {error}</p>}

        {/* Pay Button */}
        <button className="pay-btn" onClick={handlePay} disabled={loading}>
          {loading ? (
            <span>⏳ Processing...</span>
          ) : (
            <span>
              {paymentMethod === "cod" ? "✅ Confirm Order" : `💳 Pay ₹${totalPrice?.toFixed(2)}`}
            </span>
          )}
        </button>

        {/* Skip Button for Demo */}
        <button className="skip-btn" onClick={handleSkip}>
          ⏭️ Skip Payment (Demo Mode) — Go to Order Tracking
        </button>

      </div>
    </div>
  );
}