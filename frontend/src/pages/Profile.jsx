import { useState, useEffect } from "react";
import axios from "axios";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");

  // Form states
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI feedback states
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Preference toggles
  const [mapStyle, setMapStyle] = useState("standard");
  const [notifications, setNotifications] = useState(true);
  const [livePings, setLivePings] = useState(true);

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(response.data);
      setName(response.data.user.name || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
      // Fallback to local storage if API error
      const cached = JSON.parse(localStorage.getItem("user"));
      if (cached) {
        setProfileData({ user: cached });
        setName(cached.name || "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg("New passwords do not match.");
        return;
      }
      if (!currentPassword) {
        setErrorMsg("Current password is required to change password.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = { name };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await axios.put("http://localhost:5000/api/auth/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local storage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.name = response.data.user.name;
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMsg("Profile settings updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      fetchProfile();
    } catch (err) {
      console.error("Update profile error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <h1>⚙️ Account Profile & Settings</h1>
          <p>Loading your profile credentials...</p>
        </div>
      </div>
    );
  }

  const user = profileData?.user || JSON.parse(localStorage.getItem("user")) || {};
  const driver = profileData?.driverProfile;

  return (
    <div className="profile-page">
      {/* Header Banner */}
      <div className="profile-header">
        <div>
          <span className="profile-badge-sub">TRANSITOPS USER ACCOUNT</span>
          <h1>⚙️ Account Profile & Settings</h1>
          <p>Manage your account credentials, operational preferences, and security settings.</p>
        </div>
        <div className="profile-role-pill">
          <span className="role-dot"></span>
          Role: <strong className={`role-text role-${user.role}`}>{user.role?.toUpperCase()}</strong>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="profile-card-top">
        <div className="profile-avatar-box">
          <span className="avatar-letter">{user.name?.charAt(0).toUpperCase() || "U"}</span>
        </div>
        <div className="profile-main-meta">
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-tags">
            <span className="tag-pill">TransitOps Official Member</span>
            <span className={`tag-pill role-${user.role}`}>
              {user.role === "admin" && "👑 System Administrator"}
              {user.role === "driver" && "👨‍✈️ Fleet Vehicle Operator"}
              {user.role === "user" && "👤 Passenger Commuter"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs-nav">
        <button
          className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          👤 Account & Security
        </button>

        <button
          className={`tab-btn ${activeTab === "role_details" ? "active" : ""}`}
          onClick={() => setActiveTab("role_details")}
        >
          {user.role === "admin" && "🏛️ Admin Console Overview"}
          {user.role === "driver" && "🚌 Driver Fleet Credentials"}
          {user.role === "user" && "🎫 Commuter Travel Preferences"}
        </button>

        <button
          className={`tab-btn ${activeTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          🛠️ System Preferences
        </button>
      </div>

      {/* Messages */}
      {successMsg && <div className="alert-box success-alert">✓ {successMsg}</div>}
      {errorMsg && <div className="alert-box error-alert">⚠️ {errorMsg}</div>}

      {/* Tab 1: Account & Security */}
      {activeTab === "account" && (
        <div className="profile-tab-content">
          <form onSubmit={handleUpdateAccount} className="profile-form">
            <div className="form-section-title">
              <h3>Basic Profile Details</h3>
              <p>Update your personal account display information.</p>
            </div>

            <div className="profile-inputs-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="profile-field">
                <label>Registered Email</label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  title="Email cannot be modified directly"
                />
                <span className="field-hint">Email is linked to your primary account identifier.</span>
              </div>
            </div>

            <div className="form-section-title" style={{ marginTop: "28px" }}>
              <h3>Security & Password Management</h3>
              <p>Leave blank if you do not wish to change your password.</p>
            </div>

            <div className="profile-inputs-grid">
              <div className="profile-field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="profile-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="profile-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="profile-form-footer">
              <button type="submit" className="save-profile-btn" disabled={saving}>
                {saving ? "Saving Changes..." : "💾 Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Role-Specific Console Details */}
      {activeTab === "role_details" && (
        <div className="profile-tab-content">
          {user.role === "admin" && (
            <div className="role-panel admin-panel">
              <div className="panel-header">
                <h3>👑 Metropolitan Transit Administration Console</h3>
                <p>System security parameters and fleet administrative rights</p>
              </div>

              <div className="admin-status-grid">
                <div className="status-item">
                  <span>API Telemetry Server</span>
                  <strong className="status-online">🟢 ONLINE (Port 5000)</strong>
                </div>
                <div className="status-item">
                  <span>MongoDB Database</span>
                  <strong className="status-online">🟢 CONNECTED</strong>
                </div>
                <div className="status-item">
                  <span>System Environment</span>
                  <strong>DEVELOPMENT / PRODUCTION</strong>
                </div>
                <div className="status-item">
                  <span>Administrative Role</span>
                  <strong>FULL PRIVILEGES (RBAC)</strong>
                </div>
              </div>

              <div className="admin-quick-actions">
                <h4>System Management Shortcuts</h4>
                <div className="quick-actions-row">
                  <a href="/buses" className="admin-link-card">🚌 Manage Buses</a>
                  <a href="/routes" className="admin-link-card">🛣️ Manage Routes</a>
                  <a href="/drivers" className="admin-link-card">👨‍✈️ Manage Drivers</a>
                  <a href="/trips" className="admin-link-card">🚍 Manage Trips</a>
                  <a href="/reports" className="admin-link-card">📈 View Reports</a>
                </div>
              </div>
            </div>
          )}

          {user.role === "driver" && (
            <div className="role-panel driver-panel">
              <div className="panel-header">
                <h3>👨‍✈️ Driver Professional Certification & Assigned Vehicle</h3>
                <p>Workforce credentials verified by the Transit Authority</p>
              </div>

              {driver ? (
                <div className="driver-credentials-card">
                  <div className="cred-row">
                    <span>Driver Name:</span>
                    <strong>{driver.driverName}</strong>
                  </div>
                  <div className="cred-row">
                    <span>License Number:</span>
                    <strong>{driver.licenseNumber}</strong>
                  </div>
                  <div className="cred-row">
                    <span>Contact Phone:</span>
                    <strong>{driver.phoneNumber}</strong>
                  </div>
                  <div className="cred-row">
                    <span>Experience:</span>
                    <strong>{driver.experience} Years</strong>
                  </div>
                  <div className="cred-row">
                    <span>Assigned Vehicle:</span>
                    <strong className="bus-highlight">
                      {driver.assignedBus
                        ? `${driver.assignedBus.busNumber} (${driver.assignedBus.model})`
                        : "No Bus Assigned Currently"}
                    </strong>
                  </div>
                  <div className="cred-row">
                    <span>Duty Status:</span>
                    <strong className="status-active">● {driver.status?.toUpperCase()}</strong>
                  </div>
                </div>
              ) : (
                <div className="no-driver-record">
                  <p>Your account is registered as Driver. Link your driver profile with your system admin.</p>
                </div>
              )}

              <div className="driver-quick-links">
                <a href="/driver-dashboard" className="driver-action-btn">
                  👨‍✈️ Open Driver Telemetry Dashboard ➔
                </a>
              </div>
            </div>
          )}

          {user.role === "user" && (
            <div className="role-panel passenger-panel">
              <div className="panel-header">
                <h3>🎫 Commuter Travel Profile & Carbon Savings</h3>
                <p>Track your public transit footprint and favorite daily routes</p>
              </div>

              <div className="commuter-stats-grid">
                <div className="commuter-card">
                  <div className="commuter-icon">🌱</div>
                  <h4>Total CO₂ Offset</h4>
                  <p className="commuter-num">24.8 kg</p>
                  <span>By choosing public electric bus transit</span>
                </div>

                <div className="commuter-card">
                  <div className="commuter-icon">🎟️</div>
                  <h4>Fare Pass Tier</h4>
                  <p className="commuter-num">Standard Adult</p>
                  <span>Eligible for daily metropolitan network</span>
                </div>

                <div className="commuter-card">
                  <div className="commuter-icon">📍</div>
                  <h4>Primary Transit Hub</h4>
                  <p className="commuter-num">Central Station</p>
                  <span>Frequent boarding location</span>
                </div>
              </div>

              <div className="commuter-actions">
                <a href="/route-finder" className="commuter-link-btn">
                  🔍 Find Routes & Estimate Fares ➔
                </a>
                <a href="/tracking" className="commuter-link-btn outline">
                  📍 Track Live Buses on Map ➔
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Preferences */}
      {activeTab === "preferences" && (
        <div className="profile-tab-content">
          <div className="preferences-card">
            <div className="pref-item">
              <div>
                <h4>Interactive Map View Mode</h4>
                <p>Choose the default rendering theme for Leaflet maps.</p>
              </div>
              <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)}>
                <option value="standard">Standard OpenStreetMap</option>
                <option value="satellite">Detailed Terrain / Satellite</option>
              </select>
            </div>

            <div className="pref-item">
              <div>
                <h4>Live Telemetry GPS Refresh Pings</h4>
                <p>Poll bus locations automatically every 3 seconds.</p>
              </div>
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={livePings}
                onChange={(e) => setLivePings(e.target.checked)}
              />
            </div>

            <div className="pref-item">
              <div>
                <h4>Transit Schedule Alerts</h4>
                <p>Receive notifications regarding bus delays and route deviations.</p>
              </div>
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
