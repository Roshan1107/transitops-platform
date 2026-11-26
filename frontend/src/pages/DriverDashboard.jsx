import { useEffect, useState, useRef } from "react";
import axios from "axios";

function DriverDashboard() {
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live GPS Transmitter State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const broadcastIntervalRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchDriverData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [profileResponse, tripsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/driver/profile", { headers }),
        axios.get("http://localhost:5000/api/driver/trips", { headers }),
      ]);

      setProfile(profileResponse.data);
      setTrips(tripsResponse.data);
    } catch (error) {
      console.error(
        "Error fetching driver dashboard:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
    return () => {
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    };
  }, []);

  const updateTripStatus = async (tripId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/driver/trips/${tripId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Stop broadcasting if trip ends or is cancelled
      if (status === "completed" || status === "cancelled") {
        stopGPSBroadcast();
      }

      fetchDriverData();
    } catch (error) {
      console.error(
        "Error updating trip:",
        error.response?.data || error
      );
    }
  };

  // Broadcast GPS location
  const broadcastLocation = async (lat, lng) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/driver/location",
        { latitude: lat, longitude: lng },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLastLocation({ latitude: lat, longitude: lng });
      setBroadcastCount((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to broadcast GPS location:", error);
    }
  };

  const startGPSBroadcast = () => {
    if (!profile?.assignedBus) {
      alert("No bus assigned to you. Cannot start GPS broadcast.");
      return;
    }

    setIsBroadcasting(true);
    let currentLat = profile.assignedBus.latitude || 9.9252;
    let currentLng = profile.assignedBus.longitude || 78.1198;
    let step = 0;

    // Send initial location
    broadcastLocation(currentLat, currentLng);

    // Broadcast location every 4 seconds with simulated motion along transit route
    broadcastIntervalRef.current = setInterval(() => {
      step++;
      // Simulate realistic bus movement (subtle delta shifts)
      currentLat += (Math.sin(step / 2) * 0.0004 + 0.0002);
      currentLng += (Math.cos(step / 2) * 0.0004 + 0.0003);

      // Round to 5 decimals
      const finalLat = parseFloat(currentLat.toFixed(5));
      const finalLng = parseFloat(currentLng.toFixed(5));

      broadcastLocation(finalLat, finalLng);
    }, 4000);
  };

  const stopGPSBroadcast = () => {
    setIsBroadcasting(false);
    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }
  };

  const ongoingTrips = trips.filter((t) => t.status === "ongoing");

  if (loading) {
    return (
      <div className="driver-dashboard">
        <h1>Driver Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="driver-dashboard">
      <div className="driver-dashboard-header">
        <div>
          <h1>👨‍✈️ Driver Control Center</h1>
          <p>Welcome, {profile?.driverName || "Driver"}</p>
        </div>

        <div className={`driver-status ${profile?.status}`}>
          ● {profile?.status?.toUpperCase() || "N/A"}
        </div>
      </div>

      {/* Live GPS Broadcast Transmitter Widget */}
      {ongoingTrips.length > 0 && (
        <div className={`gps-transmitter-card ${isBroadcasting ? "active-broadcasting" : ""}`}>
          <div className="transmitter-header">
            <div className="transmitter-title">
              <span className="pulse-dot"></span>
              <div>
                <h2>📡 Live GPS Location Broadcaster</h2>
                <p>Transmit real-time telemetry to passenger map</p>
              </div>
            </div>

            {!isBroadcasting ? (
              <button className="start-broadcast-btn" onClick={startGPSBroadcast}>
                ▶ Start Broadcasting GPS
              </button>
            ) : (
              <button className="stop-broadcast-btn" onClick={stopGPSBroadcast}>
                ⏹ Stop GPS Broadcast
              </button>
            )}
          </div>

          {isBroadcasting && (
            <div className="telemetry-info-grid">
              <div className="telemetry-item">
                <span>Transmitter Status:</span>
                <strong className="live-green">🟢 BROADCASTING LIVE</strong>
              </div>
              <div className="telemetry-item">
                <span>Pings Transmitted:</span>
                <strong>{broadcastCount} updates</strong>
              </div>
              <div className="telemetry-item">
                <span>Last Coordinates:</span>
                <strong>
                  {lastLocation
                    ? `${lastLocation.latitude}, ${lastLocation.longitude}`
                    : "Initializing..."}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Driver Profile & Bus */}
      <div className="driver-dashboard-grid">
        <div className="driver-dashboard-card">
          <h2>👤 Driver Profile</h2>

          <div className="driver-details">
            <p>
              <span>Name</span>
              <strong>{profile?.driverName}</strong>
            </p>

            <p>
              <span>License</span>
              <strong>{profile?.licenseNumber}</strong>
            </p>

            <p>
              <span>Phone</span>
              <strong>{profile?.phoneNumber}</strong>
            </p>

            <p>
              <span>Experience</span>
              <strong>{profile?.experience} years</strong>
            </p>
          </div>
        </div>

        {/* Assigned Bus */}
        <div className="driver-dashboard-card">
          <h2>🚌 Assigned Bus</h2>

          {profile?.assignedBus ? (
            <div className="assigned-bus">
              <h3>{profile.assignedBus.busNumber}</h3>

              <p>
                Model: <strong>{profile.assignedBus.model}</strong>
              </p>

              <p>
                Registration: <strong>{profile.assignedBus.registrationNumber}</strong>
              </p>

              <p>
                Capacity: <strong>{profile.assignedBus.capacity} Passengers</strong>
              </p>

              <p>
                Status: <strong className="active-text">{profile.assignedBus.status}</strong>
              </p>
            </div>
          ) : (
            <p>No bus assigned.</p>
          )}
        </div>
      </div>

      {/* Trips Section */}
      <div className="driver-trips-section">
        <div className="section-header">
          <h2>🚌 Assigned Trips Schedule</h2>
          <span>Total Trips: {trips.length}</span>
        </div>

        {trips.length === 0 ? (
          <div className="no-driver-trips">
            <h3>No trips assigned</h3>
            <p>You currently have no assigned trips in the system.</p>
          </div>
        ) : (
          <div className="driver-trips-grid">
            {trips.map((trip) => (
              <div className="driver-trip-card" key={trip._id}>
                <div className="driver-trip-header">
                  <h3>Route {trip.route?.routeNumber || "N/A"}</h3>
                  <span className={`driver-trip-status ${trip.status}`}>{trip.status}</span>
                </div>

                <div className="driver-trip-route">
                  <strong>{trip.route?.startPoint || "N/A"}</strong>
                  <span> → </span>
                  <strong>{trip.route?.endPoint || "N/A"}</strong>
                </div>

                <div className="driver-trip-info">
                  <p>
                    <span>Bus</span>
                    <strong>{trip.bus?.busNumber || "N/A"}</strong>
                  </p>

                  <p>
                    <span>Date</span>
                    <strong>
                      {new Date(trip.tripDate).toLocaleDateString("en-IN")}
                    </strong>
                  </p>

                  <p>
                    <span>Start</span>
                    <strong>{trip.startTime}</strong>
                  </p>

                  <p>
                    <span>End</span>
                    <strong>{trip.endTime}</strong>
                  </p>
                </div>

                {/* Status Controls */}
                <div className="trip-actions">
                  {trip.status === "scheduled" && (
                    <button
                      className="btn-start"
                      onClick={() => updateTripStatus(trip._id, "ongoing")}
                    >
                      ▶ Start Trip
                    </button>
                  )}

                  {trip.status === "ongoing" && (
                    <button
                      className="btn-complete"
                      onClick={() => updateTripStatus(trip._id, "completed")}
                    >
                      ✓ Complete Trip
                    </button>
                  )}

                  {(trip.status === "scheduled" || trip.status === "ongoing") && (
                    <button
                      className="cancel-trip"
                      onClick={() => updateTripStatus(trip._id, "cancelled")}
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;