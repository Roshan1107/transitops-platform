import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "nav-link active" : "nav-link");

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <span className="logo-icon">🚌</span>
          <span className="logo-text">Transit<span className="accent">Ops</span></span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/" className={isActive("/")}>
          Home
        </Link>

        <Link to="/route-finder" className={isActive("/route-finder")}>
          🔍 Route Finder
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" className={isActive("/dashboard")}>
              📊 Dashboard
            </Link>

            {user.role === "driver" && (
              <Link to="/driver-dashboard" className={isActive("/driver-dashboard")}>
                👨‍✈️ Driver Dashboard
              </Link>
            )}

            <Link to="/tracking" className={isActive("/tracking")}>
              📍 Live Tracking
            </Link>

            <Link to="/trips" className={isActive("/trips")}>
              🚍 Trips
            </Link>

            {user.role === "admin" && (
              <>
                <Link to="/buses" className={isActive("/buses")}>
                  🚌 Buses
                </Link>

                <Link to="/routes" className={isActive("/routes")}>
                  🛣️ Routes
                </Link>

                <Link to="/drivers" className={isActive("/drivers")}>
                  👨‍✈️ Drivers
                </Link>

                <Link to="/reports" className={isActive("/reports")}>
                  📈 Reports
                </Link>
              </>
            )}

            <Link to="/profile" className={isActive("/profile")}>
              ⚙️ Settings
            </Link>

            <Link to="/profile" className="user-profile-badge" title="View & Edit Profile Settings">
              <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <div className="user-meta">
                <span className="user-name">{user.name}</span>
                <span className={`user-role role-${user.role}`}>{user.role}</span>
              </div>
            </Link>

            <button className="logout-btn" onClick={handleLogout}>
              Logout ➔
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive("/login")}>
              Login
            </Link>

            <Link to="/register" className="register-nav-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;