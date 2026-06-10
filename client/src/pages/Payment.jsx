import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Payment.css";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId, totalPrice } = state || {};

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
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
          transactionId: data.transaction.transactionId,
          amount: data.transaction.amount,
          orderId,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Complete Payment</h2>
        <p className="payment-amount">Total: ₹{totalPrice?.toFixed(2)}</p>

        <div className="payment-methods">
          {["card", "upi", "cod"].map((method) => (
            <button
              key={method}
              className={`method-btn ${paymentMethod === method ? "active" : ""}`}
              onClick={() => setPaymentMethod(method)}
            >
              {method === "card" ? "💳 Card" : method === "upi" ? "📱 UPI" : "💵 Cash on Delivery"}
            </button>
          ))}
        </div>

        {paymentMethod === "card" && (
          <div className="card-form">
            <input
              type="text"
              placeholder="Card Number (16 digits)"
              maxLength={16}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
            />
            <div className="card-row">
              <input
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              <input
                type="text"
                placeholder="CVV"
                maxLength={3}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
        )}

        {paymentMethod === "upi" && (
          <div className="card-form">
            <input type="text" placeholder="Enter UPI ID (e.g. name@upi)" />
          </div>
        )}

        {paymentMethod === "cod" && (
          <p className="cod-note">💵 You will pay ₹{totalPrice?.toFixed(2)} when your order arrives.</p>
        )}

        {error && <p className="payment-error">{error}</p>}

        <button
          className="pay-btn"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay ₹${totalPrice?.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}