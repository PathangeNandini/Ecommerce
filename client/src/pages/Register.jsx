import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const ROLES = [
  { value: "consumer",   label: "Customer",        icon: "🛒", desc: "Order food from restaurants" },
  { value: "restaurant", label: "Restaurant Owner", icon: "🏪", desc: "Manage your restaurant & orders" },
  { value: "courier",    label: "Delivery Partner", icon: "🚴", desc: "Deliver orders and earn" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "consumer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      // Match exact routes from App.jsx
      if (user.role === "restaurant") navigate("/owner/dashboard");
      else if (user.role === "courier") navigate("/delivery");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">🍽️</span>
          <h1>Create account</h1>
          <p>Join FoodRush today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role selector */}
          <div className="field-group">
            <label>I am a...</label>
            <div className="role-selector">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-card ${form.role === r.value ? "active" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                >
                  <span className="role-icon">{r.icon}</span>
                  <div>
                    <span className="role-label">{r.label}</span>
                    <span className="role-desc">{r.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" required
              value={form.name} onChange={handleChange} placeholder="John Doe" />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email"
              autoComplete="email" required
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password"
              autoComplete="new-password" required minLength={6}
              value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters" />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}