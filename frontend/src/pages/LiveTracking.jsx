import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Create custom glowing SVG Bus Marker Icon
const createBusIcon = (busNumber, isSelected) => {
  return L.divIcon({
    className: "custom-bus-marker-wrapper",
    html: `
      <div className="custom-bus-marker ${isSelected ? "selected-marker" : ""}">
        <div className="marker-pulse"></div>
        <div className="marker-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path>
            <path d="M16 6v6"></path>
            <path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"></path>
            <path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z"></path>
            <path d="M6 19v2"></path>
            <path d="M18 19v2"></path>
            <circle cx="7.5" cy="15.5" r="1.5"></circle>
            <circle cx="16.5" cy="15.5" r="1.5"></circle>
          </svg>
        </div>
        <div className="marker-label">${busNumber}</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

function MapFocus({ bus }) {
  const map = useMap();

  useEffect(() => {
    if (bus && bus.latitude && bus.longitude) {
      map.flyTo([bus.latitude, bus.longitude], 15, {
        duration: 1.5,
      });
    }
  }, [bus, map]);

  return null;
}

function LiveTracking() {
  const [buses, setBuses] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTrackingData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [busResponse, tripResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/buses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/trips/active", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBuses(busResponse.data);
      setActiveTrips(tripResponse.data);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 3000); // 3-second rapid pings
    return () => clearInterval(interval);
  }, []);

  const activeBusIds = activeTrips.map((trip) => trip.bus?._id);

  const busesWithLocation = buses.filter(
    (bus) =>
      bus.latitude !== null &&
      bus.longitude !== null &&
      bus.status === "active" &&
      activeBusIds.includes(bus._id)
  );

  const filteredBuses = busesWithLocation.filter((bus) => {
    const trip = activeTrips.find((t) => t.bus?._id === bus._id);
    const busNum = bus.busNumber.toLowerCase();
    const routeNum = (trip?.route?.routeNumber || "").toLowerCase();
    const routeName = (trip?.route?.routeName || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    return busNum.includes(query) || routeNum.includes(query) || routeName.includes(query);
  });

  const defaultCenter =
    busesWithLocation.length > 0
      ? [busesWithLocation[0].latitude, busesWithLocation[0].longitude]
      : [9.9252, 78.1198];

  return (
    <div className="live-tracking-page">
      {/* Header */}
      <div className="live-tracking-header">
        <div>
          <h1>📍 Live GPS Fleet Tracker</h1>
          <p>Real-time vehicle positioning and route monitoring system.</p>
        </div>

        <div className="tracking-status">
          <span className="live-ping"></span> 🟢 Live Telemetry (3s Pings)
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Connecting to GPS telemetry feed...</p>
        </div>
      ) : (
        <>
          {/* Statistics Bar */}
          <div className="tracking-info">
            <div className="tracking-stat-card">
              <h3>🚌 Active Operations</h3>
              <h2>{activeTrips.length} Trips</h2>
            </div>

            <div className="tracking-stat-card">
              <h3>📍 Tracked Vehicles</h3>
              <h2>{busesWithLocation.length} Buses</h2>
            </div>

            <div className="tracking-stat-card">
              <h3>⚡ Refresh Frequency</h3>
              <h2>3 Seconds</h2>
            </div>
          </div>

          {/* Search Bar */}
          <div className="tracking-search-bar">
            <input
              type="text"
              placeholder="🔍 Search bus number, route code, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Tracking Layout */}
          <div className="tracking-layout">
            {/* Bus List Sidebar */}
            <div className="bus-list">
              <h2>Active Transit Vehicles ({filteredBuses.length})</h2>

              {filteredBuses.length === 0 ? (
                <div className="no-buses">
                  <p>No active buses match your filter query.</p>
                </div>
              ) : (
                filteredBuses.map((bus) => {
                  const trip = activeTrips.find((t) => t.bus?._id === bus._id);
                  const isSelected = selectedBus?._id === bus._id;

                  return (
                    <div
                      className={`bus-tracking-card ${isSelected ? "selected" : ""}`}
                      key={bus._id}
                      onClick={() => setSelectedBus(bus)}
                    >
                      <div className="bus-card-top">
                        <div className="bus-icon">🚌</div>
                        <div className="bus-card-head">
                          <h3>{bus.busNumber}</h3>
                          <span className="route-pill">
                            {trip?.route?.routeNumber || "Route"}
                          </span>
                        </div>
                      </div>

                      <div className="bus-details">
                        <p className="bus-model-text">{bus.model}</p>
                        <p className="route-endpoints">
                          <strong>{trip?.route?.startPoint || "N/A"}</strong>
                          <span> ➔ </span>
                          <strong>{trip?.route?.endPoint || "N/A"}</strong>
                        </p>
                        <div className="driver-name-tag">
                          <span>Driver:</span> <strong>{trip?.driver?.driverName || "N/A"}</strong>
                        </div>

                        <div className="bus-card-footer">
                          <span className="bus-active">● ONGOING TRIP</span>
                          <button className="focus-btn">Center on Map 📍</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Map Area */}
            <div className="tracking-map">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "650px", width: "100%", borderRadius: "16px" }}
              >
                <MapFocus bus={selectedBus} />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {busesWithLocation.map((bus) => {
                  const trip = activeTrips.find((t) => t.bus?._id === bus._id);
                  const isSelected = selectedBus?._id === bus._id;

                  return (
                    <Marker
                      key={bus._id}
                      position={[bus.latitude, bus.longitude]}
                      icon={createBusIcon(bus.busNumber, isSelected)}
                      eventHandlers={{
                        click: () => setSelectedBus(bus),
                      }}
                    >
                      <Popup>
                        <div className="bus-popup">
                          <div className="popup-header">
                            <h3>🚌 Bus {bus.busNumber}</h3>
                            <span className="popup-route-badge">
                              {trip?.route?.routeNumber || "Route"}
                            </span>
                          </div>

                          <div className="popup-body">
                            <p>
                              <strong>Route Name:</strong> {trip?.route?.routeName || "N/A"}
                            </p>
                            <p>
                              <strong>Origin:</strong> {trip?.route?.startPoint || "N/A"}
                            </p>
                            <p>
                              <strong>Destination:</strong> {trip?.route?.endPoint || "N/A"}
                            </p>
                            <p>
                              <strong>Driver:</strong> {trip?.driver?.driverName || "N/A"}
                            </p>
                            <p>
                              <strong>Vehicle Model:</strong> {bus.model}
                            </p>
                            <p>
                              <strong>Capacity:</strong> {bus.capacity} Seats
                            </p>
                            <p className="popup-coords">
                              <strong>Coordinates:</strong> {bus.latitude.toFixed(4)},{" "}
                              {bus.longitude.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LiveTracking;