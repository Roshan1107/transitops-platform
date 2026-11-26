import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, tripsResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:5000/api/dashboard/stats",
            { headers }
          ),

          axios.get(
            "http://localhost:5000/api/trips/active",
            { headers }
          ),
        ]);

      setStats(statsResponse.data);
      setActiveTrips(tripsResponse.data);
    } catch (error) {
      console.error(
        "Error fetching dashboard:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(
      fetchDashboardData,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>📊 Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>📊 TransitOps Dashboard</h1>
          <p>
            Real-time overview of your transport operations.
          </p>
        </div>

        <div className="dashboard-live">
          🟢 Live
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="dashboard-stats">

          <div className="dashboard-stat-card">
            <div className="stat-icon">🚌</div>
            <div>
              <span>Total Buses</span>
              <strong>{stats.totalBuses}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">🟢</div>
            <div>
              <span>Active Buses</span>
              <strong>{stats.activeBuses}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">🛣️</div>
            <div>
              <span>Total Routes</span>
              <strong>{stats.totalRoutes}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">👨‍✈️</div>
            <div>
              <span>Active Drivers</span>
              <strong>{stats.activeDrivers}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">🚍</div>
            <div>
              <span>Total Trips</span>
              <strong>{stats.totalTrips}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">📅</div>
            <div>
              <span>Scheduled Trips</span>
              <strong>{stats.scheduledTrips}</strong>
            </div>
          </div>

        </div>
      )}

      {/* Current Operations */}
      <div className="dashboard-section">

        <div className="dashboard-section-header">
          <div>
            <h2>🚍 Current Operations</h2>
            <p>
              Buses currently operating on active trips.
            </p>
          </div>

          <span>
            {activeTrips.length} Ongoing
          </span>
        </div>

        {activeTrips.length === 0 ? (
          <div className="dashboard-empty">
            <h3>No ongoing trips</h3>
            <p>
              There are currently no buses operating.
            </p>
          </div>
        ) : (
          <div className="active-trip-grid">

            {activeTrips.map((trip) => (
              <div
                className="active-trip-card"
                key={trip._id}
              >

                <div className="active-trip-top">
                  <div>
                    <h3>
                      {trip.bus?.busNumber ||
                        "N/A"}
                    </h3>

                    <span>
                      {trip.bus?.model ||
                        "Unknown Bus"}
                    </span>
                  </div>

                  <span className="ongoing-badge">
                    🟢 Ongoing
                  </span>
                </div>

                <div className="active-trip-route">
                  <strong>
                    {trip.route?.startPoint ||
                      "N/A"}
                  </strong>

                  <span> → </span>

                  <strong>
                    {trip.route?.endPoint ||
                      "N/A"}
                  </strong>
                </div>

                <div className="active-trip-details">

                  <div>
                    <span>Route</span>
                    <strong>
                      {trip.route?.routeNumber ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Driver</span>
                    <strong>
                      {trip.driver?.driverName ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Start</span>
                    <strong>
                      {trip.startTime}
                    </strong>
                  </div>

                  <div>
                    <span>End</span>
                    <strong>
                      {trip.endTime}
                    </strong>
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

export default Dashboard;