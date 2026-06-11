import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "restaurant") navigate("/owner/dashboard");
      else if (user.role === "courier") navigate("/delivery");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">🍽️</span>
          <h1>Welcome back</h1>
          <p>Sign in to continue</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              autoComplete="email" required
              value={form.email} onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              autoComplete="current-password" required
              value={form.password} onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-test-accounts">
          <p className="test-title">TEST ACCOUNTS</p>
          <div className="test-accounts-grid">
            <button className="test-account-btn" onClick={() =>
              setForm({ email: "customer@foodrush.com", password: "owner123" })}>
              🛒 Customer
            </button>
            <button className="test-account-btn" onClick={() =>
              setForm({ email: "owner@foodrush.com", password: "owner123" })}>
              🏪 Restaurant
            </button>
            <button className="test-account-btn" onClick={() =>
              setForm({ email: "courier@test.com", password: "owner123" })}>
              🚴 Courier
            </button>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}