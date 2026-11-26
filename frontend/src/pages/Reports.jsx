import { useEffect, useState } from "react";
import axios from "axios";

function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/reports/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setStats(response.data);
      } catch (error) {
        console.error(
          "Error fetching reports:",
          error.response?.data || error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="reports-page">
        <h1>📊 Operations & Analytical Reports</h1>
        <p>Generating fleet performance reports...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="reports-page">
        <h1>📊 Operations & Analytical Reports</h1>
        <p>Unable to load report statistics.</p>
      </div>
    );
  }

  // Calculate percentages for visual progress charts
  const busActivePct = stats.buses.total ? Math.round((stats.buses.active / stats.buses.total) * 100) : 0;
  const busMaintPct = stats.buses.total ? Math.round((stats.buses.maintenance / stats.buses.total) * 100) : 0;
  
  const tripCompletedPct = stats.trips.total ? Math.round((stats.trips.completed / stats.trips.total) * 100) : 0;
  const tripOngoingPct = stats.trips.total ? Math.round((stats.trips.ongoing / stats.trips.total) * 100) : 0;
  const tripScheduledPct = stats.trips.total ? Math.round((stats.trips.scheduled / stats.trips.total) * 100) : 0;

  const driverActivePct = stats.drivers.total ? Math.round((stats.drivers.active / stats.drivers.total) * 100) : 0;

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>📊 System Telemetry & Operational Analytics</h1>
          <p>Official performance reports and graphical distribution analytics.</p>
        </div>
        <button onClick={() => window.print()} className="print-report-btn">
          🖨️ Export Official Report
        </button>
      </div>

      {/* Visual Analytics Summary Section */}
      <section className="reports-visual-dashboard">
        <h2>📈 Graphical Performance Gauges</h2>
        <div className="charts-grid-two">
          {/* Trip Execution Breakdown Bar Graph */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>🚍 Trip Execution Distribution</h3>
              <p>Breakdown of total {stats.trips.total} scheduled & active trips</p>
            </div>

            <div className="horizontal-bar-group">
              <div className="bar-item">
                <div className="bar-label">
                  <span>Ongoing Operations</span>
                  <strong>{stats.trips.ongoing} ({tripOngoingPct}%)</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill green" style={{ width: `${Math.max(10, tripOngoingPct)}%` }}></div>
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-label">
                  <span>Scheduled Trips</span>
                  <strong>{stats.trips.scheduled} ({tripScheduledPct}%)</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill blue" style={{ width: `${Math.max(10, tripScheduledPct)}%` }}></div>
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-label">
                  <span>Completed Trips</span>
                  <strong>{stats.trips.completed} ({tripCompletedPct}%)</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill purple" style={{ width: `${Math.max(10, tripCompletedPct)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Operational Health Meter */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>🚌 Fleet Operational Health Index</h3>
              <p>Fleet ratio active vs maintenance across {stats.buses.total} buses</p>
            </div>

            <div className="health-gauge-box">
              <div className="gauge-metric">
                <span className="huge-text">{busActivePct}%</span>
                <span className="sub-text">Fleet Availability Rate</span>
              </div>
              <div className="stacked-progress-bar">
                <div className="segment green" style={{ width: `${busActivePct}%` }} title="Active"></div>
                <div className="segment orange" style={{ width: `${busMaintPct}%` }} title="Maintenance"></div>
                <div className="segment red" style={{ width: `${100 - busActivePct - busMaintPct}%` }} title="Inactive"></div>
              </div>
              <div className="gauge-legend">
                <span>🟢 {stats.buses.active} Active</span>
                <span>🟠 {stats.buses.maintenance} Maintenance</span>
                <span>🔴 {stats.buses.inactive} Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bus Statistics */}
      <section className="report-section">
        <h2>🚌 Bus Inventory Metrics</h2>
        <div className="report-cards">
          <div className="report-card">
            <span>Total Registered Buses</span>
            <strong>{stats.buses.total}</strong>
          </div>
          <div className="report-card">
            <span>Active Operational</span>
            <strong className="active-text">{stats.buses.active}</strong>
          </div>
          <div className="report-card">
            <span>In Maintenance</span>
            <strong className="warning-text">{stats.buses.maintenance}</strong>
          </div>
          <div className="report-card">
            <span>Inactive / Out of Service</span>
            <strong className="danger-text">{stats.buses.inactive}</strong>
          </div>
        </div>
      </section>

      {/* Route Statistics */}
      <section className="report-section">
        <h2>🛣️ Transit Corridors & Routes</h2>
        <div className="report-cards">
          <div className="report-card">
            <span>Total Configured Routes</span>
            <strong>{stats.routes.total}</strong>
          </div>
          <div className="report-card">
            <span>Active Corridors</span>
            <strong className="active-text">{stats.routes.active}</strong>
          </div>
          <div className="report-card">
            <span>Inactive Routes</span>
            <strong>{stats.routes.inactive}</strong>
          </div>
        </div>
      </section>

      {/* Driver Statistics */}
      <section className="report-section">
        <h2>👨‍✈️ Driver Workforce Telemetry</h2>
        <div className="report-cards">
          <div className="report-card">
            <span>Total Drivers</span>
            <strong>{stats.drivers.total}</strong>
          </div>
          <div className="report-card">
            <span>Active On-Duty</span>
            <strong className="active-text">{stats.drivers.active}</strong>
          </div>
          <div className="report-card">
            <span>Inactive / Standby</span>
            <strong>{stats.drivers.inactive}</strong>
          </div>
          <div className="report-card">
            <span>On Leave</span>
            <strong className="warning-text">{stats.drivers.onLeave}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Reports;