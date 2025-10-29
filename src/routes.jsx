import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Experiencia from "./pages/Experiencia/Experiencia";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import GestionDeUsuarios from "./pages/Admin/GestionDeUsuarios";
import GestionDeRestaurantes from "./pages/Admin/GestionDeRestaurantes";
import GestionDePlatillos from "./pages/Admin/GestionDePlatillos";
import GestionDeAtracciones from "./pages/Admin/GestionDeAtracciones";
import AdminLayout from "./pages/Admin/AdminLayout";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ListaAtacciones from "./pages/AtraccionTuristicas/ListaAtacciones";
import MapadeAtracciones from "./pages/AtraccionTuristicas/MapadeAtracciones";
import ListaEventos from "./pages/Eventos/ListaEventos";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas de usuario con MainLayout */}
        <Route
          path="/experiencia"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Experiencia />} />
          <Route path="mapa" element={<MapadeAtracciones />} />
          <Route path="inicio" element={<Experiencia />} />
          <Route path="atracciones" element={<ListaAtacciones />} />
          <Route
            path="eventos"
            element={
                <ListaEventos />
            }
          />
          <Route
            path="servicios"
            element={
              <div className="coming-soon">
                Servicios - Próximamente
              </div>
            }
          />
        </Route>

        {/* Ruta de mapa standalone (si la necesitas sin layout) */}
        <Route
          path="/atracciones"
          element={
            <ProtectedRoute>
              <MapadeAtracciones />
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
        {/* Rutas Lista de Eventos */}
        <Route
            path="eventos"
            element={
                <ListaEventos />
            }
        />

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<GestionDeUsuarios />} />
          <Route path="restaurants" element={<GestionDeRestaurantes />} />
          <Route path="dishes" element={<GestionDePlatillos />} />
          <Route path="attractions" element={<GestionDeAtracciones />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;

