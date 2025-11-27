import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const fetchItem = async () => {
    try {
      const res = await api.get(`/api/items/${id}`);
      setItem(res.data.item);
      setBids(res.data.bids);
    } catch (err) {
      console.error("Error fetching item", err);
    }
  };

  useEffect(() => {
    fetchItem();
    const interval = setInterval(fetchItem, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!item) return <p className="container">Loading...</p>;

  const topBid = bids[0];
  const currentTop = topBid ? topBid.amount : item.startingPrice;

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const bidAmount = Number(amount);
    if (Number.isNaN(bidAmount)) {
      setError("Please enter a valid number");
      return;
    }

    try {
      await api.post(`/api/items/${id}/bids`, {
        userId: user.email,
        userName: user.name,
        amount: bidAmount,
      });
      setAmount("");
      fetchItem();
    } catch (err) {
      console.error("Error placing bid", err);
      setError(err.response?.data?.message || "Error placing bid");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>{item.title}</h1>
        <Link className="btn-secondary" to="/">
          ← Back to items
        </Link>
      </header>

      <div className="detail-layout">
        <div className="card">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} className="detail-img" />
          )}
          <p>{item.description}</p>
          <p>Starting price: ${item.startingPrice}</p>
          <p>
            Current top bid: <b>${currentTop}</b>
          </p>
          {item.isClosed && <p className="badge">Auction closed</p>}
        </div>

        <div className="card">
          <h2>Place a bid</h2>
          {item.isClosed ? (
            <p>This auction is closed.</p>
          ) : (
            <>
              <p>Your bid must be greater than ${currentTop}.</p>
              <form onSubmit={handleBidSubmit} className="form-inline">
                <input
                  type="number"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <button type="submit">Submit bid</button>
              </form>
              {error && <p className="error">{error}</p>}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>History: </h2>
        {bids.length === 0 && <p>No bids yet.</p>}
        <ul className="bid-list">
          {bids.map((b, index) => (
            <li
              key={b._id}
              className={index === 0 ? "bid-item top-bid" : "bid-item"}
            >
              <span>
                ${b.amount} by {b.userName}
              </span>
              <span>{new Date(b.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
