import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import "./Owner.css";

export default function RestaurantSettings() {
  const [form, setForm]       = useState({ name: "", cuisine: "", address: "", isOpen: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  useEffect(() => {
    api.get("/restaurants/mine")
      .then(({ data }) => setForm({
        name:    data.name    ?? "",
        cuisine: data.cuisine ?? "",
        address: data.address ?? "",
        isOpen:  data.isOpen  ?? true,
      }))
      .catch(() => setError("Failed to load restaurant info"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      await api.put("/restaurants/mine", form);
      setSuccess("✅ Restaurant details saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <><Navbar /><div className="owner-loading">Loading settings…</div></>;

  return (
    <div className="owner-page">
      <Navbar />
      <div className="owner-container" style={{ maxWidth: 640 }}>
        <h1>⚙️ Restaurant Settings</h1>

        {error   && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form className="settings-form" onSubmit={handleSubmit}>

          {/* Open / Closed toggle */}
          <div className="settings-toggle-row">
            <div>
              <p className="toggle-label">Restaurant Status</p>
              <p className="toggle-sub">Customers can only order when you're open</p>
            </div>
            <label className="big-toggle">
              <input
                type="checkbox"
                name="isOpen"
                checked={form.isOpen}
                onChange={handleChange}
              />
              <span className="big-slider" />
            </label>
            <span className={`open-label ${form.isOpen ? "open" : "closed"}`}>
              {form.isOpen ? "🟢 Open" : "🔴 Closed"}
            </span>
          </div>

          <div className="settings-divider" />

          <div className="field">
            <label>Restaurant Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Spice Garden" />
          </div>

          <div className="field">
            <label>Cuisine Type</label>
            <select name="cuisine" value={form.cuisine} onChange={handleChange}>
              {["Indian","Chinese","Italian","Mexican","Burgers","Pizza","Biryani","Multi-Cuisine","Continental"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Full restaurant address" />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}