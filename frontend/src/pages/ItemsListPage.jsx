import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function ItemsListPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

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
    const interval = setInterval(fetchItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      {/* GREEN HERO HEADER */}
      <header className="hero">
        <div className="hero-left">
          <h1 className="hero-title">Douglas College Bid</h1>
          <p className="hero-subtitle">
            Place your bids in real time and track the most popular auction items.
          </p>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search item by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button>Search</button>
          </div>

          <p className="hero-user">
            Logged in as: <strong>{user?.email}</strong>{" "}
            <span className="hero-role">({user?.role})</span>
          </p>
        </div>

        <div className="hero-right">
          {user?.role === "admin" && (
            <Link to="/admin" className="btn-hero-admin">
              Admin Panel
            </Link>
          )}
        </div>
      </header>

      {/* ITEMS GRID */}
      <main className="content">
        {filteredItems.length === 0 ? (
          <p className="no-items">No items found.</p>
        ) : (
          <div className="card-grid">
            {filteredItems.map((item) => {
              const topAmount =
                item.topBidAmount !== undefined
                  ? item.topBidAmount
                  : item.currentPrice ?? item.startingPrice;

              return (
                <article key={item._id} className="auction-card">
                  <div className="auction-card-img-wrapper">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="auction-card-img"
                      />
                    ) : (
                      <div className="auction-card-img placeholder">
                        No image
                      </div>
                    )}
                    {item.isClosed && (
                      <span className="status-badge closed">Closed</span>
                    )}
                    {!item.isClosed && (
                      <span className="status-badge open">Open</span>
                    )}
                  </div>

                  <div className="auction-card-body">
                    <h2 className="auction-card-title">{item.title}</h2>
                    <p className="auction-card-desc">{item.description}</p>

                    <div className="auction-card-info">
                      <div className="info-block">
                        <span className="info-label">Starting bid</span>
                        <span className="info-value">
                          ${item.startingPrice}
                        </span>
                      </div>
                      <div className="info-block">
                        <span className="info-label">Top bid</span>
                        <span className="info-value highlight">
                          ${topAmount}
                        </span>
                        {item.topBidUserName && (
                          <span className="info-extra">
                            by {item.topBidUserName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="auction-card-footer">
                      <Link
                        to={`/items/${item._id}`}
                        className="btn-bid-primary"
                      >
                        View details & bid
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

