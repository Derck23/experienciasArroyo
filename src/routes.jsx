import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Experiencia from "./pages/Experiencia/Experiencia";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas - Usuario normal */}
        <Route
          path="/experiencia"
          element={
            <ProtectedRoute>
              <Experiencia />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
