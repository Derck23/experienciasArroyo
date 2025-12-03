import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';
import HouseIcon from '../../Iconos/House.png';
import EventsIcon from '../../Iconos/events.png';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <Link
        to="/experiencia/inicio"
        className={`bottom-nav-item ${isActive('/experiencia/inicio') ? 'active' : ''}`}
      >
        <img src={HouseIcon} alt="Inicio" className="bottom-nav-icon-img" />
        <span className="bottom-nav-label">Inicio</span>
      </Link>

      <Link
        to="/experiencia/atracciones"
        className={`bottom-nav-item ${isActive('/experiencia/atracciones') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🏞️</span>
        <span className="bottom-nav-label">Atracciones</span>
      </Link>

      <Link
        to="/experiencia/eventos"
        className={`bottom-nav-item ${isActive('/experiencia/eventos') ? 'active' : ''}`}
      >
        <img src={EventsIcon} alt="Eventos" className="bottom-nav-icon-img" />
        <span className="bottom-nav-label">Eventos</span>
      </Link>

      <Link
        to="/experiencia/servicios"
        className={`bottom-nav-item ${isActive('/experiencia/servicios') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">💼</span>
        <span className="bottom-nav-label">Servicios</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
