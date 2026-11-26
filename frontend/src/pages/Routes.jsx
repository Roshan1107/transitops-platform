import { useEffect, useState } from "react";
import axios from "axios";

function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const [formData, setFormData] = useState({
    routeNumber: "",
    routeName: "",
    startPoint: "",
    endPoint: "",
    stops: "",
    status: "active",
  });

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/routes",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRoutes(response.data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/routes",
        {
          ...formData,
          stops: formData.stops
            .split(",")
            .map((stop) => stop.trim())
            .filter((stop) => stop !== ""),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Route added successfully!");

      resetForm();
      fetchRoutes();
    } catch (error) {
      console.error("Error adding route:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add route"
      );
    }
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);

    setFormData({
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      stops: route.stops.join(", "),
      status: route.status,
    });

    setShowForm(true);
  };

  const handleUpdateRoute = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/routes/${editingRoute._id}`,
        {
          ...formData,
          stops: formData.stops
            .split(",")
            .map((stop) => stop.trim())
            .filter((stop) => stop !== ""),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Route updated successfully!");

      resetForm();
      fetchRoutes();
    } catch (error) {
      console.error("Error updating route:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update route"
      );
    }
  };

  const handleDeleteRoute = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this route?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/routes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Route deleted successfully!");

      fetchRoutes();
    } catch (error) {
      console.error("Error deleting route:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete route"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      routeNumber: "",
      routeName: "",
      startPoint: "",
      endPoint: "",
      stops: "",
      status: "active",
    });

    setEditingRoute(null);
    setShowForm(false);
  };

  return (
    <div className="routes-page">
      <div className="routes-header">
        <div>
          <h1>Route Management</h1>
          <p>Manage and monitor TransitOps routes.</p>
        </div>

        <button
          className="add-route-btn"
          onClick={() => {
            setEditingRoute(null);
            setShowForm(!showForm);
          }}
        >
          + Add Route
        </button>
      </div>

      {showForm && (
        <div className="route-form-container">
          <h2>
            {editingRoute ? "Edit Route" : "Add New Route"}
          </h2>

          <form
            onSubmit={
              editingRoute
                ? handleUpdateRoute
                : handleAddRoute
            }
            className="route-form"
          >
            <input
              type="text"
              name="routeNumber"
              placeholder="Route Number"
              value={formData.routeNumber}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="routeName"
              placeholder="Route Name"
              value={formData.routeName}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="startPoint"
              placeholder="Start Point"
              value={formData.startPoint}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="endPoint"
              placeholder="End Point"
              value={formData.endPoint}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="stops"
              placeholder="Stops (comma separated)"
              value={formData.stops}
              onChange={handleChange}
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button type="submit">
              {editingRoute
                ? "Update Route"
                : "Add Route"}
            </button>

            {editingRoute && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading routes...</p>
      ) : routes.length === 0 ? (
        <p>No routes found.</p>
      ) : (
        <div className="route-table-container">
          <table className="route-table">
            <thead>
              <tr>
                <th>Route Number</th>
                <th>Route Name</th>
                <th>Start Point</th>
                <th>End Point</th>
                <th>Stops</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {routes.map((route) => (
                <tr key={route._id}>
                  <td>{route.routeNumber}</td>

                  <td>{route.routeName}</td>

                  <td>{route.startPoint}</td>

                  <td>{route.endPoint}</td>

                  <td>
                    {route.stops.length > 0
                      ? route.stops.join(", ")
                      : "No stops"}
                  </td>

                  <td>
                    <span
                      className={`route-status ${route.status}`}
                    >
                      {route.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() =>
                        handleEditRoute(route)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDeleteRoute(route._id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RoutesPage;