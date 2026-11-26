import { useEffect, useState, useRef } from "react";
import axios from "axios";

// Helper to parse dates in multiple flexible formats (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, etc.)
const parseFlexibleDate = (rawStr) => {
  if (!rawStr || !rawStr.trim()) {
    return { valid: false, iso: "", display: "", message: "Please enter or select a date" };
  }
  const str = rawStr.trim();

  // Pattern 1: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
        const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return {
          valid: true,
          iso,
          display: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
          message: "Valid date format",
        };
      }
    }
  }

  // Pattern 2: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
        const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return {
          valid: true,
          iso,
          display: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
          message: "Valid date format",
        };
      }
    }
  }

  // Pattern 3: standard date parsing fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = parsed.getMonth() + 1;
    const day = parsed.getDate();
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return {
      valid: true,
      iso,
      display: parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      message: "Valid date",
    };
  }

  return { valid: false, iso: "", display: "", message: "Invalid date. Use YYYY-MM-DD or DD/MM/YYYY" };
};

function Trips() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    bus: "",
    route: "",
    driver: "",
    tripDate: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
  });

  // Dual Date Input states (Manual Text + Calendar Picker)
  const [manualDateInput, setManualDateInput] = useState("");
  const [datePickerValue, setDatePickerValue] = useState("");
  const [dateValidation, setDateValidation] = useState({
    valid: false,
    iso: "",
    display: "",
    message: "",
    touched: false,
  });

  const dateInputRef = useRef(null);

  // Trips Filtering states
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateInput, setFilterDateInput] = useState("");
  const [filterDatePickerValue, setFilterDatePickerValue] = useState("");
  const [filterIsoDate, setFilterIsoDate] = useState("");
  const [filterActivePreset, setFilterActivePreset] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filterDateRef = useRef(null);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchTrips = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/trips", { headers });
      setTrips(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [busResponse, routeResponse, driverResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/buses", { headers }),
        axios.get("http://localhost:5000/api/routes", { headers }),
        axios.get("http://localhost:5000/api/drivers", { headers }),
      ]);

      setBuses(busResponse.data);
      setRoutes(routeResponse.data);
      setDrivers(driverResponse.data);
    } catch (error) {
      console.error("Error fetching trip form data:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handler for manual keyboard date entry
  const handleManualDateChange = (val) => {
    setManualDateInput(val);
    const res = parseFlexibleDate(val);
    setDateValidation({
      ...res,
      touched: Boolean(val.trim()),
    });

    if (res.valid) {
      setFormData((prev) => ({ ...prev, tripDate: res.iso }));
      setDatePickerValue(res.iso);
    } else {
      setFormData((prev) => ({ ...prev, tripDate: "" }));
      setDatePickerValue("");
    }
  };

  // Handler for calendar popup selection
  const handlePickerDateChange = (val) => {
    if (!val) return;
    const res = parseFlexibleDate(val);
    setManualDateInput(val);
    setDatePickerValue(val);
    setDateValidation({
      ...res,
      touched: true,
    });
    setFormData((prev) => ({ ...prev, tripDate: val }));
  };

  // Trigger browser native date picker
  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  // Preset buttons (Today, Tomorrow, +2 Days)
  const setDatePreset = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const iso = d.toISOString().split("T")[0];
    handlePickerDateChange(iso);
  };

  const resetForm = () => {
    setFormData({
      bus: "",
      route: "",
      driver: "",
      tripDate: "",
      startTime: "",
      endTime: "",
      status: "scheduled",
    });
    setManualDateInput("");
    setDatePickerValue("");
    setDateValidation({
      valid: false,
      iso: "",
      display: "",
      message: "",
      touched: false,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dateResult = parseFlexibleDate(manualDateInput);
    if (!dateResult.valid) {
      alert("Please enter a valid trip date (e.g. YYYY-MM-DD or DD/MM/YYYY) or select one from the calendar.");
      return;
    }

    try {
      const data = {
        ...formData,
        tripDate: dateResult.iso,
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/trips/${editingId}`, data, { headers });
      } else {
        await axios.post("http://localhost:5000/api/trips", data, { headers });
      }

      resetForm();
      fetchTrips();
    } catch (error) {
      console.error("Error saving trip:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to save trip. Please check your inputs.");
    }
  };

  const handleEdit = (trip) => {
    setEditingId(trip._id);

    const formattedDate = trip.tripDate
      ? new Date(trip.tripDate).toISOString().split("T")[0]
      : "";

    setFormData({
      bus: trip.bus?._id || "",
      route: trip.route?._id || "",
      driver: trip.driver?._id || "",
      tripDate: formattedDate,
      startTime: trip.startTime || "",
      endTime: trip.endTime || "",
      status: trip.status || "scheduled",
    });

    setManualDateInput(formattedDate);
    setDatePickerValue(formattedDate);
    if (formattedDate) {
      const res = parseFlexibleDate(formattedDate);
      setDateValidation({
        ...res,
        touched: true,
      });
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/trips/${id}`, { headers });
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error.response?.data || error);
    }
  };

  const getStatusClass = (status) => {
    return `trip-status ${status}`;
  };

  // --- Filter handlers ---
  const handleFilterDateManualChange = (val) => {
    setFilterDateInput(val);
    setFilterActivePreset("custom");
    if (!val.trim()) {
      setFilterIsoDate("");
      setFilterDatePickerValue("");
      return;
    }
    const res = parseFlexibleDate(val);
    if (res.valid) {
      setFilterIsoDate(res.iso);
      setFilterDatePickerValue(res.iso);
    } else {
      setFilterIsoDate("");
    }
  };

  const handleFilterDatePickerChange = (val) => {
    setFilterDatePickerValue(val);
    setFilterDateInput(val);
    setFilterIsoDate(val);
    setFilterActivePreset("custom");
  };

  const handleFilterPreset = (preset) => {
    setFilterActivePreset(preset);
    if (preset === "all") {
      setFilterDateInput("");
      setFilterDatePickerValue("");
      setFilterIsoDate("");
    } else if (preset === "today") {
      const todayIso = new Date().toISOString().split("T")[0];
      setFilterDateInput(todayIso);
      setFilterDatePickerValue(todayIso);
      setFilterIsoDate(todayIso);
    } else if (preset === "tomorrow") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const tomorrowIso = d.toISOString().split("T")[0];
      setFilterDateInput(tomorrowIso);
      setFilterDatePickerValue(tomorrowIso);
      setFilterIsoDate(tomorrowIso);
    }
  };

  const handleResetFilters = () => {
    setFilterSearch("");
    setFilterDateInput("");
    setFilterDatePickerValue("");
    setFilterIsoDate("");
    setFilterActivePreset("all");
    setFilterStatus("all");
  };

  // Filtered trips
  const filteredTrips = trips.filter((trip) => {
    // Date filter
    if (filterIsoDate) {
      const tripDateIso = trip.tripDate
        ? new Date(trip.tripDate).toISOString().split("T")[0]
        : "";
      if (tripDateIso !== filterIsoDate) {
        return false;
      }
    }

    // Status filter
    if (filterStatus !== "all" && trip.status !== filterStatus) {
      return false;
    }

    // Search query
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const routeNum = trip.route?.routeNumber?.toLowerCase() || "";
      const routeName = trip.route?.routeName?.toLowerCase() || "";
      const startPoint = trip.route?.startPoint?.toLowerCase() || "";
      const endPoint = trip.route?.endPoint?.toLowerCase() || "";
      const busNum = trip.bus?.busNumber?.toLowerCase() || "";
      const driverName = trip.driver?.driverName?.toLowerCase() || "";
      const matches =
        routeNum.includes(q) ||
        routeName.includes(q) ||
        startPoint.includes(q) ||
        endPoint.includes(q) ||
        busNum.includes(q) ||
        driverName.includes(q);
      if (!matches) return false;
    }

    return true;
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="trips-page">
      {/* Header */}
      <div className="trips-header">
        <div>
          <h1>🚌 Transit Trips & Dispatch</h1>
          <p>Schedule, manage, and track public transit services across active corridors.</p>
        </div>

        <div className="trip-count">
          <span>Active Schedules:</span>
          <strong>{trips.length}</strong>
        </div>
      </div>

      {/* Admin Trip Form */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="trip-form">
          <h2>
            {editingId ? "✏️ Edit Trip Schedule" : "➕ Dispatch New Trip"}
          </h2>

          <div className="trip-form-grid">
            {/* Bus selector */}
            <div className="form-group-field">
              <label>Select Bus</label>
              <select
                name="bus"
                value={formData.bus}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Assigned Bus --</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.busNumber} • {bus.model} ({bus.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            {/* Route selector */}
            <div className="form-group-field">
              <label>Select Route</label>
              <select
                name="route"
                value={formData.route}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Route Corridor --</option>
                {routes.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.routeNumber}: {route.startPoint} ➔ {route.endPoint}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver selector */}
            <div className="form-group-field">
              <label>Select Driver</label>
              <select
                name="driver"
                value={formData.driver}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Assigned Driver --</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.driverName} ({driver.licenseNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* DUAL DATE INPUT: Manual Entry + Calendar Selection */}
            <div className="form-group-field trip-date-field-group">
              <div className="trip-date-header">
                <label htmlFor="manualTripDate">
                  📅 Trip Date <span>(Type or Select)</span>
                </label>
                <div className="date-quick-presets">
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => setDatePreset(0)}
                    title="Set to Today"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => setDatePreset(1)}
                    title="Set to Tomorrow"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => setDatePreset(2)}
                    title="Set to Day After Tomorrow"
                  >
                    +2 Days
                  </button>
                </div>
              </div>

              <div className="dual-date-control">
                <input
                  id="manualTripDate"
                  type="text"
                  className={`dual-date-text-input ${
                    dateValidation.touched
                      ? dateValidation.valid
                        ? "is-valid"
                        : "is-invalid"
                      : ""
                  }`}
                  placeholder="e.g. 2026-09-18 or 18/09/2026"
                  value={manualDateInput}
                  onChange={(e) => handleManualDateChange(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="date-picker-trigger-btn"
                  onClick={handleOpenDatePicker}
                  title="Open Calendar Date Picker"
                >
                  📅 Select
                </button>

                <input
                  ref={dateInputRef}
                  type="date"
                  className="native-date-hidden-input"
                  value={datePickerValue}
                  onChange={(e) => handlePickerDateChange(e.target.value)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              {/* Real-time Validation Message */}
              <div className="date-helper-row">
                {dateValidation.touched ? (
                  dateValidation.valid ? (
                    <span className="date-validation-pill valid">
                      ✓ {dateValidation.display}
                    </span>
                  ) : (
                    <span className="date-validation-pill invalid">
                      ⚠️ Format: YYYY-MM-DD or DD/MM/YYYY
                    </span>
                  )
                ) : (
                  <span className="date-hint">
                    Type manually (YYYY-MM-DD / DD-MM-YYYY) or click 📅 Select
                  </span>
                )}
              </div>
            </div>

            {/* Start Time */}
            <div className="form-group-field">
              <label>Departure Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* End Time */}
            <div className="form-group-field">
              <label>Arrival Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* Status */}
            <div className="form-group-field">
              <label>Service Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="trip-form-actions">
            <button type="submit" className="save-trip-btn">
              {editingId ? "💾 Update Schedule" : "🚀 Dispatch Trip"}
            </button>

            {editingId && (
              <button type="button" className="cancel-trip-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* FILTER & SEARCH PANEL (Available to both Admin and Passengers) */}
      <div className="trips-filter-panel">
        <div className="filter-search-box">
          <span className="filter-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Route #, stop name, bus, or driver..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
          {filterSearch && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setFilterSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-date-box">
          <label>Filter Date:</label>
          <div className="filter-date-input-wrap">
            <input
              type="text"
              placeholder="YYYY-MM-DD or DD/MM/YYYY"
              value={filterDateInput}
              onChange={(e) => handleFilterDateManualChange(e.target.value)}
            />
            <button
              type="button"
              className="filter-date-picker-btn"
              onClick={() => {
                if (filterDateRef.current) {
                  if (typeof filterDateRef.current.showPicker === "function") {
                    filterDateRef.current.showPicker();
                  } else {
                    filterDateRef.current.focus();
                    filterDateRef.current.click();
                  }
                }
              }}
              title="Pick date from calendar"
            >
              📅
            </button>
            <input
              ref={filterDateRef}
              type="date"
              className="native-date-hidden-input"
              value={filterDatePickerValue}
              onChange={(e) => handleFilterDatePickerChange(e.target.value)}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          <div className="filter-preset-chips">
            <button
              type="button"
              className={`filter-chip ${filterActivePreset === "all" ? "active" : ""}`}
              onClick={() => handleFilterPreset("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-chip ${filterActivePreset === "today" ? "active" : ""}`}
              onClick={() => handleFilterPreset("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`filter-chip ${filterActivePreset === "tomorrow" ? "active" : ""}`}
              onClick={() => handleFilterPreset("tomorrow")}
            >
              Tomorrow
            </button>
          </div>
        </div>

        <div className="filter-status-box">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {(filterSearch || filterDateInput || filterStatus !== "all") && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleResetFilters}
            title="Clear all filters"
          >
            ↺ Clear
          </button>
        )}
      </div>

      {/* Results Header Count */}
      <div className="trips-results-meta">
        <span>Showing {filteredTrips.length} of {trips.length} trip schedules</span>
        {filterIsoDate && (
          <span className="filtered-date-badge">
            📅 Date: {new Date(filterIsoDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="no-trips">
          <h2>No matching trips found</h2>
          <p>Try adjusting your search criteria, selecting a different date, or clearing active filters.</p>
          {(filterSearch || filterDateInput || filterStatus !== "all") && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              style={{ marginTop: "16px" }}
            >
              ↺ Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="trips-grid">
          {filteredTrips.map((trip) => (
            <div className="trip-card" key={trip._id}>
              <div className="trip-card-header">
                <h2>{trip.route?.routeNumber || "R-XXX"}</h2>
                <span className={getStatusClass(trip.status)}>
                  {trip.status}
                </span>
              </div>

              <div className="trip-route">
                <strong>{trip.route?.startPoint || "Origin"}</strong>
                <span> ➔ </span>
                <strong>{trip.route?.endPoint || "Destination"}</strong>
              </div>

              <div className="trip-info">
                <div>
                  <span>🚌 Bus</span>
                  <strong>{trip.bus?.busNumber || "N/A"}</strong>
                </div>

                <div>
                  <span>🚍 Model</span>
                  <strong>{trip.bus?.model || "Standard"}</strong>
                </div>

                <div>
                  <span>👨‍✈️ Driver</span>
                  <strong>{trip.driver?.driverName || "Assigned"}</strong>
                </div>

                <div>
                  <span>📅 Date</span>
                  <strong>
                    {trip.tripDate
                      ? new Date(trip.tripDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </strong>
                </div>

                <div>
                  <span>🕐 Departure</span>
                  <strong>{trip.startTime}</strong>
                </div>

                <div>
                  <span>🕐 Arrival</span>
                  <strong>{trip.endTime}</strong>
                </div>
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="trip-admin-actions">
                  <button onClick={() => handleEdit(trip)}>
                    ✏️ Edit
                  </button>

                  <button onClick={() => handleDelete(trip._id)}>
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trips;