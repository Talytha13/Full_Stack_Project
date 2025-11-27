import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/douglas-bid-logo.png"; // garante que o nome está igual

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="nav-bar">
      <div className="nav-container">
        {/* LEFT - LOGO + TITLE */}
        <div className="nav-left">
          <img src={logo} alt="Douglas College Bid logo" className="nav-logo" />
          <span className="nav-title">Douglas College Bid</span>
        </div>

        {/* RIGHT - BUTTONS */}
        <div className="nav-right">
          {user?.role === "admin" && (
            <Link to="/admin" className="btn-nav-admin">
              Admin Panel
            </Link>
          )}

          {user && (
            <button className="btn-nav-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
