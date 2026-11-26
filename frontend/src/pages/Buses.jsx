import { useEffect,useState } from "react";
import axios from "axios";
function Buses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [formData, setFormData] = useState({
    busNumber: "",
    registrationNumber: "",
    model: "",
    capacity: "",
    status: "active",
  });

  const fetchBuses = async() => {
    try{
      const response=await axios.get("http://localhost:5000/api/buses",{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBuses(response.data);
    }
    catch(error){
      console.error("Error fetching buses",error);
    }
    finally{
      setLoading(false);
    }
  };
  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
  };

  const handleAddBus = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/buses",
        {
          ...formData,
          capacity: Number(formData.capacity),
        },
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Bus added successfully!");

      setFormData({
        busNumber: "",
        registrationNumber: "",
        model: "",
        capacity: "",
        status: "active",
      });

      setShowForm(false);

      fetchBuses();
    } catch (error) {
      console.error("Error adding bus:", error);

      alert(
        error.response?.data?.message ||
        "Failed to add bus"
      );
    }
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      model: bus.model,
      capacity: bus.capacity,
      status: bus.status,
    });
    setShowForm(true);
  };

  const handleUpdateBus = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/buses/${editingBus._id}`,
        {
          ...formData,
          capacity: Number(formData.capacity),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    alert("Bus updated successfully!");
    setEditingBus(null);
    setFormData({
      busNumber: "",
      registrationNumber: "",
      model: "",
      capacity: "",
      status: "active",
    });
    setShowForm(false);
    fetchBuses();
    } catch (error) {
    console.error("Error updating bus:", error);
    alert(
      error.response?.data?.message ||
      "Failed to update bus"
    );
    }
  };

  const handleDeleteBus = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bus?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/buses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Bus deleted successfully!");
      fetchBuses();
    } catch (error) {
      console.error("Error deleting bus:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete bus"
      );
    }
  };



  useEffect(()=>{
    fetchBuses();
  },[]);
  return (
    <div className="buses-page">
      <div className="buses-header">
        <div>
          <h1>Bus Management</h1>
          <p>Manage and monitor TransitOps buses.</p>
        </div>
        <button
          className="add-bus-btn"
          onClick={() => setShowForm(!showForm)}>
          + Add Bus
        </button>
      </div>
      {showForm && (
        <div className="bus-form-container">
        <h2>{editingBus ? "Edit Bus" : "Add New Bus"}</h2>
        <form
          onSubmit={editingBus ? handleUpdateBus : handleAddBus}
          className="bus-form">
        <input
        type="text"
        name="busNumber"
        placeholder="Bus Number"
        value={formData.busNumber}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="registrationNumber"
        placeholder="Registration Number"
        value={formData.registrationNumber}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="model"
        placeholder="Bus Model"
        value={formData.model}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="capacity"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={handleChange}
        required
        min="1"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}>
        <option value="active">Active</option>
        <option value="maintenance">Maintenance</option>
        <option value="inactive">Inactive</option>
      </select>

      <button type="submit">
        {editingBus ? "Update Bus" : "Add Bus"}
      </button>
      </form>
      </div>
      )}

      {loading?(
        <p>Loading buses...</p>
      ): buses.length===0?(
        <p>No buses found.</p>
      ):(
        <div className="bus-table-container">
          <table className="bus-table">
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Registration</th>
                <th>Model</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                buses.map((bus)=>(
                  <tr key={bus._id}>
                    <td>{bus.busNumber}</td>
                    <td>{bus.registrationNumber}</td>
                    <td>{bus.model}</td>
                    <td>{bus.capacity}</td>
                    <td>
                      <span className={`bus-status ${bus.status}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditBus(bus)}>Edit</button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBus(bus._id)}>Delete</button>
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
export default Buses;