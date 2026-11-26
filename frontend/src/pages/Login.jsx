import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "driver") {
        navigate("/driver-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🚌</div>
          <h2>Welcome Back to TransitOps</h2>
          <p>Login to your TransitOps operations account</p>
        </div>

        {errorMessage && <div className="auth-error-banner">⚠️ {errorMessage}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. admin@transitops.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Login to TransitOps ➔"}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="demo-accounts-box">
          <span>⚡ Quick Demo Logins:</span>
          <div className="demo-buttons">
            <button type="button" onClick={() => fillQuickLogin("admin@transitops.com", "admin123")}>
              👑 Admin
            </button>
            <button type="button" onClick={() => fillQuickLogin("driver1@transitops.com", "driver123")}>
              👨‍✈️ Driver
            </button>
            <button type="button" onClick={() => fillQuickLogin("user@transitops.com", "user123")}>
              👤 Passenger
            </button>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;