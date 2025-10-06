import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Experiencia from "./pages/Experiencia/Experiencia";

import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/experiencia" element={<Experiencia />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
