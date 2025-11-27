import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startingPrice: "",
  });

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items");
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/items/add", {
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        startingPrice: Number(form.startingPrice),
      });
      setForm({
        title: "",
        description: "",
        imageUrl: "",
        startingPrice: "",
      });
      fetchItems();
    } catch (err) {
      console.error("Error adding item", err);
    }
  };

  const handleClose = async (id) => {
    try {
      const res = await api.post(`/api/items/${id}/close`);
      console.log("Winner:", res.data.winner);
      fetchItems();
    } catch (err) {
      console.error("Error closing auction", err);
    }
  };

  const handleNotify = async (id) => {
    try {
      const res = await api.post(`/api/items/${id}/notify-winner`);
      alert(res.data.message);
    } catch (err) {
      console.error("Error notifying winner", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/items/delete/${id}`);
      fetchItems();
    } catch (err) {
      console.error("Error deleting item", err);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div className="container admin-hero-inner">
          <h1>Admin Dashboard</h1>
          <Link className="admin-back-link" to="/">
            ← Back to items
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout admin-layout">
          {/* LEFT: CREATE ITEM */}
          <form onSubmit={handleCreate} className="card admin-form">
            <h2>Add new item</h2>

            <label className="admin-label">
              Title
              <input
                name="title"
                placeholder="Enter item title"
                value={form.title}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </label>

            <label className="admin-label">
              Starting price
              <input
                type="number"
                name="startingPrice"
                placeholder="e.g. 10"
                value={form.startingPrice}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </label>

            <label className="admin-label">
              Description
              <textarea
                name="description"
                placeholder="Short description of the item"
                value={form.description}
                onChange={handleChange}
                className="admin-textarea"
                required
              />
            </label>

            <label className="admin-label">
              Image URL
              <input
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </label>

            <button type="submit" className="admin-btn admin-btn-green">
              Create item
            </button>
          </form>

          {/* RIGHT: ALL ITEMS */}
          <div className="card admin-items-card">
            <h2>All items</h2>
            <ul className="admin-items-list">
              {items.map((item) => (
                <li key={item._id} className="admin-item">
                  <div className="admin-item-info">
                    <span className="admin-item-title">{item.title}</span>
                    <span className="admin-item-meta">
                      ${item.currentPrice} ({item.isClosed ? "Closed" : "Open"})
                    </span>
                  </div>
                  <div className="admin-actions">
                    {!item.isClosed && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-green-outline"
                        onClick={() => handleClose(item._id)}
                      >
                        Close auction
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn-orange"
                      onClick={() => handleNotify(item._id)}
                    >
                      Notify winner
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {items.length === 0 && <p>No items created yet.</p>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
