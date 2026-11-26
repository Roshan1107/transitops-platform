import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [stats, setStats] = useState({
    activeBuses: 4,
    totalRoutes: 4,
    scheduledTrips: 2,
    activeDrivers: 3,
  });

  const [activeTab, setActiveTab] = useState("hourly");

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:5000/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setStats(response.data);
        }
      } catch (err) {
        // Keep fallback stats
      }
    };

    fetchQuickStats();
  }, []);

  return (
    <main className="official-home">
      {/* Official Alert / Ticker Banner */}
      <div className="official-ticker-bar">
        <div className="ticker-badge">📢 SYSTEM NOTICE</div>
        <div className="ticker-text">
          Live GPS Telemetry Broadcasting across all Metropolitan Routes • System Status: 🟢 100% Operational • On-Time Transit Index: 96.4%
        </div>
        <div className="ticker-date">{new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>

      {/* Hero Section */}
      <section className="official-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="authority-emblem">
            <span>🏛️ TransitOps Platform</span>
          </div>

          <h1>TransitOps: Smart Public Bus Management and Real-Time Tracking System</h1>

          <p>
            The comprehensive intelligent platform for city public bus fleet dispatching, automated real-time GPS vehicle tracking, route network management, driver telemetry, and passenger fare finding.
          </p>

          <div className="hero-action-group">
            <Link to="/tracking" className="btn-official-primary">
              📍 Open Live Bus Map
            </Link>
            <Link to="/route-finder" className="btn-official-secondary">
              🔍 Passenger Route & Fare Finder
            </Link>
          </div>

          {/* Key Metrics Quick Panel */}
          <div className="official-metrics-strip">
            <div className="metric-box">
              <span className="metric-value">{stats.activeBuses || 4}</span>
              <span className="metric-label">Active Buses On-Road</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-box">
              <span className="metric-value">{stats.totalRoutes || 4}</span>
              <span className="metric-label">Operational Routes</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-box">
              <span className="metric-value">{stats.activeDrivers || 3}</span>
              <span className="metric-label">On-Duty Drivers</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-box">
              <span className="metric-value">96.4%</span>
              <span className="metric-label">On-Time Performance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Live Fleet Charts Section */}
      <section className="official-analytics-section">
        <div className="section-container">
          <div className="section-header-text">
            <span className="sub-tag">ANALYTICAL TELEMETRY</span>
            <h2>Real-Time Transit Operational Graphs & Visual Analytics</h2>
            <p>Live automated metrics monitoring passenger congestion, fleet health distribution, and peak hour departure velocity.</p>
          </div>

          {/* Interactive Chart Container */}
          <div className="analytics-grid">
            {/* Main Hourly Passenger Density Graph */}
            <div className="chart-card large-chart">
              <div className="chart-header">
                <div>
                  <h3>📈 Passenger Congestion & Trip Frequency (Hourly)</h3>
                  <p>Daily volume trends across all city transit corridors</p>
                </div>
                <div className="chart-tabs">
                  <button className={activeTab === "hourly" ? "active" : ""} onClick={() => setActiveTab("hourly")}>Hourly Peak</button>
                  <button className={activeTab === "weekly" ? "active" : ""} onClick={() => setActiveTab("weekly")}>Weekly Trend</button>
                </div>
              </div>

              {/* Visual SVG Line Chart */}
              <div className="svg-chart-wrapper">
                <svg viewBox="0 0 700 220" className="analytics-svg-graph">
                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="680" y2="30" stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1="40" y1="80" x2="680" y2="80" stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1="40" y1="130" x2="680" y2="130" stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1="40" y1="180" x2="680" y2="180" stroke="#cbd5e1" />

                  {/* Gradient Area under line */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <polygon points="50,180 50,140 120,120 190,40 260,70 330,130 400,110 470,30 540,60 610,120 660,170 660,180" fill="url(#chartGradient)" />

                  {/* Line Graph */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="50,140 120,120 190,40 260,70 330,130 400,110 470,30 540,60 610,120 660,170"
                  />

                  {/* Data Points */}
                  <circle cx="50" cy="140" r="5" fill="#1d4ed8" />
                  <circle cx="120" cy="120" r="5" fill="#1d4ed8" />
                  <circle cx="190" cy="40" r="6" fill="#059669" stroke="#fff" strokeWidth="2" />
                  <circle cx="260" cy="70" r="5" fill="#1d4ed8" />
                  <circle cx="330" cy="130" r="5" fill="#1d4ed8" />
                  <circle cx="400" cy="110" r="5" fill="#1d4ed8" />
                  <circle cx="470" cy="30" r="6" fill="#059669" stroke="#fff" strokeWidth="2" />
                  <circle cx="540" cy="60" r="5" fill="#1d4ed8" />
                  <circle cx="610" cy="120" r="5" fill="#1d4ed8" />
                  <circle cx="660" cy="170" r="5" fill="#1d4ed8" />

                  {/* Labels */}
                  <text x="45" y="198" fontSize="11" fill="#64748b">06:00</text>
                  <text x="115" y="198" fontSize="11" fill="#64748b">08:00</text>
                  <text x="185" y="198" fontSize="11" fill="#059669" fontWeight="bold">09:00 (Peak)</text>
                  <text x="255" y="198" fontSize="11" fill="#64748b">11:00</text>
                  <text x="325" y="198" fontSize="11" fill="#64748b">13:00</text>
                  <text x="395" y="198" fontSize="11" fill="#64748b">15:00</text>
                  <text x="465" y="198" fontSize="11" fill="#059669" fontWeight="bold">18:00 (Peak)</text>
                  <text x="535" y="198" fontSize="11" fill="#64748b">20:00</text>
                  <text x="605" y="198" fontSize="11" fill="#64748b">22:00</text>
                </svg>
              </div>

              <div className="chart-footer-stats">
                <div>
                  <span>Morning Peak Load</span>
                  <strong>08:30 AM - 10:00 AM</strong>
                </div>
                <div>
                  <span>Evening Rush Hours</span>
                  <strong>05:30 PM - 07:30 PM</strong>
                </div>
                <div>
                  <span>Avg Speed</span>
                  <strong>28.4 km/h</strong>
                </div>
              </div>
            </div>

            {/* Donut Chart: Fleet Readiness */}
            <div className="chart-card donut-chart">
              <div className="chart-header">
                <h3>📊 Fleet Vehicle Readiness</h3>
                <p>Status breakdown of bus inventory</p>
              </div>

              <div className="donut-wrapper">
                <svg viewBox="0 0 160 160" className="svg-donut">
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#e2e8f0" strokeWidth="20" />
                  {/* Active (75%) */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#10b981" strokeWidth="20"
                    strokeDasharray="282 376" strokeDashoffset="0" />
                  {/* Maintenance (15%) */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f59e0b" strokeWidth="20"
                    strokeDasharray="56 376" strokeDashoffset="-282" />
                  {/* Inactive (10%) */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#ef4444" strokeWidth="20"
                    strokeDasharray="38 376" strokeDashoffset="-338" />
                </svg>
                <div className="donut-center-text">
                  <strong>75%</strong>
                  <span>Active</span>
                </div>
              </div>

              <div className="donut-legend">
                <div className="legend-item">
                  <span className="dot green"></span>
                  <span>Active Fleet (75%)</span>
                </div>
                <div className="legend-item">
                  <span className="dot orange"></span>
                  <span>In Maintenance (15%)</span>
                </div>
                <div className="legend-item">
                  <span className="dot red"></span>
                  <span>Inactive (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Fleet Showcase Section */}
      <section className="official-fleet-showcase">
        <div className="showcase-content">
          <div className="showcase-text">
            <span className="badge-light">OFFICIAL TRANSIT INFRASTRUCTURE</span>
            <h2>State-of-the-Art Eco-Friendly Transit Fleet</h2>
            <p>
              TransitOps operates a modern fleet of zero-emission electric buses and low-floor accessible vehicles equipped with real-time GPS sensors, automated stop announcements, and contactless fare validation.
            </p>

            <div className="showcase-features-list">
              <div className="sc-item">
                <div className="sc-icon">⚡</div>
                <div>
                  <h4>100% Electric & Low-Emission Vehicles</h4>
                  <p>Reducing urban carbon emissions while offering quiet commuter comfort.</p>
                </div>
              </div>
              <div className="sc-item">
                <div className="sc-icon">📡</div>
                <div>
                  <h4>High-Precision Cellular GPS Pings</h4>
                  <p>3-second telemetry pings feeding live bus position maps for passengers.</p>
                </div>
              </div>
              <div className="sc-item">
                <div className="sc-icon">♿</div>
                <div>
                  <h4>Universal ADA Accessibility</h4>
                  <p>Kneeling suspension ramps and dedicated wheelchair spaces across all buses.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-image-card">
            <img
              src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80"
              alt="Official Public Transit Bus Fleet"
              className="web-transport-img"
            />
            <div className="image-caption">
              <span>📷 TransitOps Smart Public Bus Management & Real-Time Tracking System</span>
            </div>
          </div>
        </div>
      </section>

      {/* Official Services Grid */}
      <section className="official-services-grid">
        <div className="section-container">
          <div className="section-header-text">
            <span className="sub-tag">CENTRALIZED PORTALS</span>
            <h2>Official TransitOps Portals & Services</h2>
            <p>Direct access to administrative command tools, driver telemetry, and public rider resources.</p>
          </div>

          <div className="services-flex">
            <div className="service-card">
              <div className="service-bg-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80')" }}></div>
              <div className="service-card-body">
                <div className="service-icon">📍</div>
                <h3>Live Bus Tracking</h3>
                <p>Interactive OpenStreetMap tracking active bus locations, pings, and estimated arrival times.</p>
                <Link to="/tracking" className="service-link">View Live Map ➔</Link>
              </div>
            </div>

            <div className="service-card">
              <div className="service-bg-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80')" }}></div>
              <div className="service-card-body">
                <div className="service-icon">🔍</div>
                <h3>Passenger Route & Fare Finder</h3>
                <p>Search origin & destination stops, view full stop itineraries, and calculate ticket fares instantly.</p>
                <Link to="/route-finder" className="service-link">Search Routes ➔</Link>
              </div>
            </div>

            <div className="service-card">
              <div className="service-bg-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=800&q=80')" }}></div>
              <div className="service-card-body">
                <div className="service-icon">👨‍✈️</div>
                <h3>Driver Operations Panel</h3>
                <p>Dedicated control dashboard for drivers to manage trips, log updates, and broadcast GPS telemetry.</p>
                <Link to="/driver-dashboard" className="service-link">Driver Portal ➔</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Footer Banner */}
      <footer className="official-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🏛️</span>
            <div>
              <h3>TransitOps</h3>
              <p>Smart Public Bus Management and Real-Time Tracking System</p>
            </div>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/route-finder">Route Finder</Link>
            <Link to="/tracking">Live Map</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/login">Official Login</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 TransitOps: Smart Public Bus Management and Real-Time Tracking System. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}

export default Home;