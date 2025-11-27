import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/douglas-bid-logo.png"; // ajuste o nome se for diferente

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img
          src={logo}
          alt="Douglas College Bid logo"
          className="login-logo"
        />

        <h1 className="login-title">Douglas College Bid</h1>
        <p className="login-subtitle">
          Log in to join the Douglas College silent auction.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Password
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="login-button">
            Login
          </button>

          <p className="login-hint">
            Use <b>admin@auction.com</b> to log in as admin.
          </p>
        </form>
      </div>
    </div>
  );
}


