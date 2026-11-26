import { useEffect, useState } from "react";
import axios from "axios";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);

  const [formData, setFormData] = useState({
    driverName: "",
    licenseNumber: "",
    phoneNumber: "",
    experience: "",
    assignedBus: "",
    status: "active",
  });

  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/drivers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/buses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBuses(response.data);
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchBuses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        experience: Number(formData.experience),
        assignedBus: formData.assignedBus || null,
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/drivers/${editingId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/drivers",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setFormData({
        driverName: "",
        licenseNumber: "",
        phoneNumber: "",
        experience: "",
        assignedBus: "",
        status: "active",
      });

      setEditingId(null);

      fetchDrivers();
    } catch (error) {
      console.error(
        "Error saving driver:",
        error.response?.data || error
      );
    }
  };

  const handleEdit = (driver) => {
    setEditingId(driver._id);

    setFormData({
      driverName: driver.driverName,
      licenseNumber: driver.licenseNumber,
      phoneNumber: driver.phoneNumber,
      experience: driver.experience,
      assignedBus: driver.assignedBus?._id || "",
      status: driver.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/drivers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchDrivers();
    } catch (error) {
      console.error(
        "Error deleting driver:",
        error.response?.data || error
      );
    }
  };

  return (
    <div className="drivers-page">
      {/* Header */}
      <div className="drivers-header">
        <div>
          <h1>👨‍✈️ Driver Workforce Management</h1>
          <p>Register, monitor, and assign buses to certified transit drivers.</p>
        </div>
        <div className="driver-count">
          👨‍✈️ Total Drivers: {drivers.length}
        </div>
      </div>

      {/* Driver Form */}
      <form onSubmit={handleSubmit} className="driver-form">
        <h2>
          {editingId ? "✏️ Edit Driver Profile" : "➕ Register New Driver"}
        </h2>

        <div className="driver-form-grid">
          <input
            type="text"
            name="driverName"
            placeholder="Driver Full Name"
            value={formData.driverName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="licenseNumber"
            placeholder="License Number (e.g. DL-TN58-2020)"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number (+91 ...)"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="experience"
            placeholder="Experience in Years"
            value={formData.experience}
            onChange={handleChange}
            min="0"
            required
          />

          <select
            name="assignedBus"
            value={formData.assignedBus}
            onChange={handleChange}
          >
            <option value="">Select Assigned Bus</option>

            {buses.map((bus) => (
              <option key={bus._id} value={bus._id}>
                {bus.busNumber} - {bus.model}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>

        <div className="driver-form-actions">
          <button type="submit">
            {editingId ? "Update Driver" : "Register Driver"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);

                setFormData({
                  driverName: "",
                  licenseNumber: "",
                  phoneNumber: "",
                  experience: "",
                  assignedBus: "",
                  status: "active",
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Drivers List */}
      {drivers.length === 0 ? (
        <div className="no-drivers">
          <h2>No drivers found</h2>
          <p>There are currently no registered drivers in the system.</p>
        </div>
      ) : (
        <div className="drivers-grid">
          {drivers.map((driver) => (
            <div className="driver-card" key={driver._id}>
              <div className="driver-card-header">
                <h2>
                  <span className="driver-avatar-icon">👨‍✈️</span>
                  {driver.driverName}
                </h2>
                <span className={`driver-status-badge ${driver.status}`}>
                  {driver.status === "on_leave" ? "On Leave" : driver.status}
                </span>
              </div>

              <div className="driver-info-list">
                <p>
                  <span>License:</span>
                  <strong>{driver.licenseNumber}</strong>
                </p>

                <p>
                  <span>Phone:</span>
                  <strong>{driver.phoneNumber}</strong>
                </p>

                <p>
                  <span>Experience:</span>
                  <strong>{driver.experience} Years</strong>
                </p>

                <p>
                  <span>Assigned Bus:</span>
                  <strong className="assigned-bus-pill">
                    {driver.assignedBus?.busNumber || "None Assigned"}
                  </strong>
                </p>
              </div>

              <div className="driver-card-actions">
                <button onClick={() => handleEdit(driver)}>
                  ✏️ Edit
                </button>

                <button onClick={() => handleDelete(driver._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Drivers;