import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function RouteFinder() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startStop, setStartStop] = useState("");
  const [endStop, setEndStop] = useState("");
  const [matchingRoutes, setMatchingRoutes] = useState([]);
  const [searched, setSearched] = useState(false);
  const [passengerType, setPassengerType] = useState("adult"); // adult, student, senior
  const [selectedTicketRoute, setSelectedTicketRoute] = useState(null);

  // Extract all unique stops across active routes
  const [allStops, setAllStops] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/routes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const activeRoutes = response.data.filter((r) => r.status === "active");
        setRoutes(activeRoutes);

        // Collect unique stop list
        const stopsSet = new Set();
        activeRoutes.forEach((route) => {
          if (route.startPoint) stopsSet.add(route.startPoint);
          if (route.endPoint) stopsSet.add(route.endPoint);
          if (Array.isArray(route.stops)) {
            route.stops.forEach((s) => stopsSet.add(s));
          }
        });

        setAllStops(Array.from(stopsSet).sort());
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!startStop && !endStop) {
      setMatchingRoutes(routes);
      setSearched(true);
      return;
    }

    setSearched(true);

    const matches = routes.filter((route) => {
      const routeStops = [
        route.startPoint,
        ...(Array.isArray(route.stops) ? route.stops : []),
        route.endPoint,
      ].map((s) => s.toLowerCase());

      const startMatch = !startStop || routeStops.some((s) => s.includes(startStop.toLowerCase()));
      const endMatch = !endStop || routeStops.some((s) => s.includes(endStop.toLowerCase()));

      return startMatch && endMatch;
    });

    setMatchingRoutes(matches);
  };

  const handleSwapStops = () => {
    const temp = startStop;
    setStartStop(endStop);
    setEndStop(temp);
  };

  const calculateFare = (route) => {
    const totalStops = (route.stops?.length || 0) + 2;
    let baseFare = Math.max(10, totalStops * 5);

    if (passengerType === "student") {
      return Math.round(baseFare * 0.5); // 50% Student Discount
    } else if (passengerType === "senior") {
      return Math.round(baseFare * 0.3); // 70% Senior Discount
    }
    return baseFare;
  };

  const estimateTravelTime = (route) => {
    const totalStops = (route.stops?.length || 0) + 2;
    return `${totalStops * 6 - 2} mins`;
  };

  const selectQuickRoute = (route) => {
    setStartStop(route.startPoint);
    setEndStop(route.endPoint);
    setMatchingRoutes([route]);
    setSearched(true);
  };

  return (
    <div className="route-finder-page">
      {/* Official Header */}
      <div className="finder-header">
        <div>
          <span className="sub-tag">PASSENGER SERVICES PORTAL</span>
          <h1>🔍 Metropolitan Route & Fare Finder</h1>
          <p>Search TransitOps corridors, view stop timelines, calculate fares & issue digital travel passes.</p>
        </div>
        <Link to="/tracking" className="live-track-btn">
          📍 Open Live GPS Bus Map ➔
        </Link>
      </div>

      {/* Main Search Panel */}
      <div className="finder-card glass-panel">
        <form onSubmit={handleSearch} className="finder-form-advanced">
          <div className="search-inputs-row">
            <div className="form-group flex-1">
              <label>📍 Boarding Stop (Origin)</label>
              <input
                type="text"
                list="stops-list-start"
                placeholder="Select or type boarding stop..."
                value={startStop}
                onChange={(e) => setStartStop(e.target.value)}
              />
              <datalist id="stops-list-start">
                {allStops.map((stop, i) => (
                  <option key={i} value={stop} />
                ))}
              </datalist>
            </div>

            <button type="button" className="swap-btn" onClick={handleSwapStops} title="Swap Origin & Destination">
              ⇄
            </button>

            <div className="form-group flex-1">
              <label>🏁 Destination Stop</label>
              <input
                type="text"
                list="stops-list-end"
                placeholder="Select or type destination stop..."
                value={endStop}
                onChange={(e) => setEndStop(e.target.value)}
              />
              <datalist id="stops-list-end">
                {allStops.map((stop, i) => (
                  <option key={i} value={stop} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>🎟️ Fare Category</label>
              <select value={passengerType} onChange={(e) => setPassengerType(e.target.value)}>
                <option value="adult">Standard Adult</option>
                <option value="student">Student Pass (50% Off)</option>
                <option value="senior">Senior Citizen (70% Off)</option>
              </select>
            </div>
          </div>

          <div className="search-actions-row">
            <div className="popular-quick-pills">
              <span>Quick Corridors:</span>
              {routes.slice(0, 3).map((r) => (
                <button type="button" key={r._id} onClick={() => selectQuickRoute(r)}>
                  {r.routeNumber} ({r.startPoint} ➔ {r.endPoint})
                </button>
              ))}
            </div>

            <button type="submit" className="find-routes-btn">
              🔍 Find Transit Routes
            </button>
          </div>
        </form>
      </div>

      {/* Search Results Display */}
      {searched && (
        <div className="finder-results-section">
          <div className="results-header-bar">
            <h2>
              Matching Transit Corridors ({matchingRoutes.length})
            </h2>
            <span className="fare-type-indicator">
              Category Rate: <strong>{passengerType.toUpperCase()}</strong>
            </span>
          </div>

          {matchingRoutes.length === 0 ? (
            <div className="no-routes-found">
              <h3>No direct transit route found matching selected stops</h3>
              <p>Try searching using one of the quick corridor pills above or clear your filters.</p>
            </div>
          ) : (
            <div className="routes-results-list">
              {matchingRoutes.map((route) => {
                const fare = calculateFare(route);
                const estTime = estimateTravelTime(route);
                const allRouteStops = [
                  route.startPoint,
                  ...(Array.isArray(route.stops) ? route.stops : []),
                  route.endPoint,
                ];

                return (
                  <div className="route-detailed-card" key={route._id}>
                    <div className="rd-card-top">
                      <div className="rd-route-info">
                        <span className="route-badge-large">{route.routeNumber}</span>
                        <div>
                          <h3>{route.routeName}</h3>
                          <p>{route.startPoint} ➔ {route.endPoint}</p>
                        </div>
                      </div>

                      <div className="rd-fare-box">
                        <span className="fare-label">TICKET FARE</span>
                        <span className="fare-amount">₹{fare}</span>
                        {passengerType !== "adult" && <span className="discount-tag">Discounted</span>}
                      </div>
                    </div>

                    {/* Stop-by-Stop Visual Timeline */}
                    <div className="stop-timeline-container">
                      <span className="timeline-title">📍 Transit Itinerary ({allRouteStops.length} Stops):</span>
                      <div className="timeline-track">
                        {allRouteStops.map((stop, idx) => {
                          const isStart = idx === 0;
                          const isEnd = idx === allRouteStops.length - 1;

                          return (
                            <div className={`timeline-node ${isStart ? "start" : ""} ${isEnd ? "end" : ""}`} key={idx}>
                              <div className="node-dot"></div>
                              <span className="node-name">{stop}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rd-card-footer">
                      <div className="rd-meta">
                        <span>⏱️ Est. Duration: <strong>{estTime}</strong></span>
                        <span>🌱 CO₂ Saved: <strong>1.4 kg</strong></span>
                        <span> Frequency: <strong>Every 15 mins</strong></span>
                      </div>

                      <div className="rd-buttons">
                        <button
                          className="btn-pass"
                          onClick={() => setSelectedTicketRoute({ route, fare, estTime })}
                        >
                          🎫 Issue Digital Travel Pass
                        </button>
                        <Link to="/tracking" className="btn-track-route">
                          📍 Track Bus Live ➔
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Digital Pass Ticket Modal */}
      {selectedTicketRoute && (
        <div className="modal-backdrop" onClick={() => setSelectedTicketRoute(null)}>
          <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-header">
              <span className="ticket-logo">🏛️ METROPOLITAN TRANSIT</span>
              <button className="close-modal" onClick={() => setSelectedTicketRoute(null)}>✕</button>
            </div>

            <div className="ticket-body">
              <div className="ticket-route-badge">{selectedTicketRoute.route.routeNumber}</div>
              <h2>{selectedTicketRoute.route.routeName}</h2>
              <p className="ticket-points">
                {selectedTicketRoute.route.startPoint} ➔ {selectedTicketRoute.route.endPoint}
              </p>

              <div className="ticket-grid">
                <div>
                  <span>PASSENGER CATEGORY</span>
                  <strong>{passengerType.toUpperCase()}</strong>
                </div>
                <div>
                  <span>VALID DATE</span>
                  <strong>TODAY</strong>
                </div>
                <div>
                  <span>ESTIMATED TIME</span>
                  <strong>{selectedTicketRoute.estTime}</strong>
                </div>
                <div>
                  <span>TOTAL FARE</span>
                  <strong className="ticket-fare-text">₹{selectedTicketRoute.fare}</strong>
                </div>
              </div>

              {/* Barcode graphic */}
              <div className="ticket-barcode">
                <div className="barcode-lines"></div>
                <span>TICKET ID: MT-2026-984210</span>
              </div>
            </div>

            <div className="ticket-footer">
              <button className="btn-print" onClick={() => window.print()}>🖨️ Print Ticket</button>
              <button className="btn-done" onClick={() => setSelectedTicketRoute(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* All Available Network Routes Overview */}
      <div className="all-network-routes">
        <h2>🌐 All Metropolitan Transit Network Corridors ({routes.length})</h2>
        {loading ? (
          <p>Loading network routes...</p>
        ) : (
          <div className="all-routes-grid">
            {routes.map((route) => (
              <div key={route._id} className="mini-route-card">
                <div className="mini-header">
                  <strong className="route-badge-sm">{route.routeNumber}</strong>
                  <span>{route.routeName}</span>
                </div>
                <p className="mini-points">
                  {route.startPoint} → {route.endPoint}
                </p>
                <div className="mini-footer">
                  <span>Standard Fare ₹{calculateFare(route)}</span>
                  <span>{route.stops?.length || 0} Intermediate Stops</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteFinder;
