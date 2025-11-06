import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import imagenHome from '../../assets/imagenHome.jpg';
import { logout, getCurrentUser } from '../../utils/auth';
import './Experiencia.css';

function Experiencia() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getCurrentUser();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div 
      className="experiencia-bg"
      style={{ backgroundImage: `url(${imagenHome})` }}
    >
      <div className="experiencia-content">
        <div className="experiencia-hero">
          <h1 className="experiencia-title">
            Descubre de la<br />
            Sierra Gorra Gorda Queretana
          </h1>
        </div>

        <div className="experiencia-actions">
          <button
            className="experiencia-btn btn-tours"
            onMouseEnter={e => e.target.classList.add('btn-hover')}
            onMouseLeave={e => e.target.classList.remove('btn-hover')}
          >
            Ver Tours
          </button>
          <button
            className="experiencia-btn btn-alojamiento"
            onMouseEnter={e => e.target.classList.add('btn-hover')}
            onMouseLeave={e => e.target.classList.remove('btn-hover')}
          >
            Reservar Alojamento
          </button>
          <button
            className="experiencia-btn btn-mapa"
            onClick={() => navigate('/experiencia/mapa')}
            onMouseEnter={e => e.target.classList.add('btn-hover')}
            onMouseLeave={e => e.target.classList.remove('btn-hover')}
          >
            <span style={{fontSize:'1.1em',verticalAlign:'middle'}}>📍</span> Mapa de Atracciones
          </button>
        </div>

        <div className="experiencia-categorias">
          <h2 className="categorias-title">Explora por Categoría</h2>
          <div className="categorias-grid">
            <div className="categoria-card">
              <div className="categoria-icon categoria-tour">⛰️</div>
              <div className="categoria-label">Tours</div>
            </div>
            <div className="categoria-card">
              <div className="categoria-icon categoria-alojamiento">🏠</div>
              <div className="categoria-label">Alojamientos</div>
            </div>
            <div
              className="categoria-card"
              onClick={() => navigate('/experiencia/restaurante')}
              tabIndex={0}
              role="button"
            >
              <div className="categoria-icon categoria-gastro">🍴</div>
              <div className="categoria-label">Gastronomía</div>
            </div>
            <div className="categoria-card">
              <div className="categoria-icon categoria-actividades">🏄</div>
              <div className="categoria-label">Actividades</div>
            </div>
          </div>
          <div className="experiencia-social">
            <div className="social-icon icon-instagram" tabIndex={0}>📷</div>
            <div className="social-icon icon-facebook" tabIndex={0}>📘</div>
            <div className="social-icon icon-twitter" tabIndex={0}>🐦</div>
          </div>
          <div className="experiencia-contacto">
            Contacto Rápido
          </div>
        </div>
      </div>
    </div>
  );
}

export default Experiencia;