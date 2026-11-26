import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DriverDashboard from "./pages/DriverDashboard";
import RouteFinder from "./pages/RouteFinder";
import Profile from "./pages/Profile";

import Buses from "./pages/Buses";
import RoutesPage from "./pages/Routes";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import LiveTracking from "./pages/LiveTracking";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/route-finder" element={<RouteFinder />} />

        {/* Logged-in users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user", "driver", "admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <ProtectedRoute allowedRoles={["user", "driver", "admin"]}>
              <LiveTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute allowedRoles={["user", "driver", "admin"]}>
              <Trips />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "driver", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin-only pages */}
        <Route
          path="/buses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Buses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/routes"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RoutesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/drivers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Drivers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;