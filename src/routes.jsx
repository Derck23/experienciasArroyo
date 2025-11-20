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
import GestionDeServicios from "./pages/Admin/GestionDeServicios";
import AdminLayout from "./pages/Admin/AdminLayout";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ListaAtacciones from "./pages/AtraccionTuristicas/ListaAtacciones";
import MapadeAtracciones from "./pages/AtraccionTuristicas/MapadeAtracciones";
import DetalleAtraccion from "./pages/AtraccionTuristicas/DetalleAtraccion";
import ListaEventos from "./pages/Eventos/ListaEventos";
import DetalleEvento from "./pages/Eventos/DetalleEvento";
import Restaurante from "./pages/Restaurantes/Restaurante";
import InfoRestaurante from "./pages/Restaurantes/InfoRestaurante";
import GestionEventos from "./pages/Admin/GestionEventos";
import Servicios from "./pages/Servicios/Servicios";
import DetalleServicio from "./pages/Servicios/DetalleServicio";
import AvisoPrivacidad from "./pages/Legal/AvisoPrivacidad";
import TerminosCondiciones from "./pages/Legal/TerminosCondiciones";
import EliminacionCuenta from "./pages/Legal/EliminacionCuenta";
import Favoritos from "./pages/Experiencia/Favoritos";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/aviso-privacidad" element={<AvisoPrivacidad />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/eliminacion-cuenta" element={<EliminacionCuenta />} />

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
          <Route path="atracciones/:id" element={<DetalleAtraccion />} />
          <Route path="restaurante" element={<Restaurante />} />
          <Route path="restaurante/:id" element={<InfoRestaurante />} />
          <Route path="eventos" element={<ListaEventos />} />
          <Route path="eventos/:id" element={<DetalleEvento />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="servicios/:id" element={<DetalleServicio />} />
          <Route path="favoritos" element={<Favoritos />} />
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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<GestionDeUsuarios />} />
          <Route path="servicios" element={<GestionDeServicios />} />
          <Route path="restaurants" element={<GestionDeRestaurantes />} />
          <Route path="dishes" element={<GestionDePlatillos />} />
          <Route path="attractions" element={<GestionDeAtracciones />} />
          <Route path="eventos" element={<GestionEventos />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;

