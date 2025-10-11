import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Experiencia from "./pages/Experiencia/Experiencia";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import GestionDeUsuarios from "./pages/Admin/GestionDeUsuarios";
import AdminLayout from "./pages/Admin/AdminLayout";
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

        {/* Rutas protegidas - Admin (layout con header/footer) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<GestionDeUsuarios />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;

