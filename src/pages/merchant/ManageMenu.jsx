import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import "./Owner.css";

const CATEGORIES = ["Starters", "Main Course", "Breads", "Rice", "Desserts", "Beverages", "Sides"];

const EMPTY_FORM = { name: "", description: "", price: "", category: "Main Course" };

export default function ManageMenu() {
  const [items, setItems]       = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    api.get("/menu/mine")
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load menu items"))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...CATEGORIES];
  const displayed  = activeTab === "All" ? items : items.filter((i) => i.category === activeTab);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError("Name and price are required"); return; }
    setError(""); setSaving(true);
    try {
      if (editId) {
        // Update existing
        const { data } = await api.put(`/menu/${editId}`, form);
        setItems((prev) => prev.map((i) => i._id === editId ? data : i));
        setEditId(null);
      } else {
        // Create new
        const { data } = await api.post("/menu", form);
        setItems((prev) => [...prev, data]);
      }
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setForm({ name: item.name, description: item.description || "", price: item.price, category: item.category || "Main Course" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditId(null); setForm(EMPTY_FORM); };

  const toggleStock = async (item) => {
    try {
      const { data } = await api.patch(`/menu/${item._id}`);
      setItems((prev) => prev.map((i) => i._id === item._id ? { ...i, available: data.item.available } : i));
    } catch { setError("Failed to update stock"); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch { setError("Failed to delete item"); }
  };

  if (loading) return <><Navbar /><div className="owner-loading">Loading menu…</div></>;

  return (
    <div className="owner-page">
      <Navbar />
      <div className="owner-container">
        <h1>{editId ? "✏️ Edit Item" : "📋 Manage Menu"}</h1>

        {/* ── Add / Edit Form ── */}
        <div className="menu-form-card">
          <h2>{editId ? "Edit Menu Item" : "Add New Item"}</h2>
          {error && <div className="form-error">{error}</div>}

          <form className="menu-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label>Item Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Butter Chicken" required />
              </div>
              <div className="field">
                <label>Price (₹) *</label>
                <input name="price" type="number" min="1" value={form.price} onChange={handleChange} placeholder="e.g. 280" required />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Short description of the item" />
            </div>
            <div className="field">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : editId ? "Update Item" : "Add to Menu"}
              </button>
              {editId && <button type="button" className="btn-ghost" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* ── Category Tabs ── */}
        <div className="cat-tabs">
          {categories.map((c) => (
            <button key={c} className={`cat-tab ${activeTab === c ? "active" : ""}`} onClick={() => setActiveTab(c)}>
              {c}
              <span className="tab-count">
                {c === "All" ? items.length : items.filter((i) => i.category === c).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Menu Items List ── */}
        {displayed.length === 0 ? (
          <div className="empty-section">No items in this category yet.</div>
        ) : (
          <div className="menu-items-list">
            {displayed.map((item) => (
              <div key={item._id} className={`menu-item-row ${!item.available ? "out-of-stock" : ""}`}>
                <div className="menu-item-info">
                  <span className="menu-item-name">{item.name}</span>
                  <span className="menu-item-cat">{item.category}</span>
                  <span className="menu-item-desc">{item.description}</span>
                </div>

                <div className="menu-item-right">
                  <span className="menu-item-price">₹{item.price}</span>

                  {/* Stock toggle */}
                  <div className="stock-toggle" onClick={() => toggleStock(item)}>
                    <div className={`stock-indicator ${item.available ? "in-stock" : "oos"}`}>
                      {item.available ? "✅ In Stock" : "❌ Out of Stock"}
                    </div>
                  </div>

                  <div className="menu-item-actions">
                    <button className="btn-edit"   onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn-delete" onClick={() => deleteItem(item._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}