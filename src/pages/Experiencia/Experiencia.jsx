import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import imagenHome from '../../assets/imagenHome.jpg';
import imageBg from '../../assets/image.png';
import { getCurrentUser } from '../../utils/auth';
import { Carousel } from 'antd';
import { obtenerServicios } from '../../service/servicioService';
import './Experiencia.css';

function Experiencia() {
  const navigate = useNavigate();
  const [serviciosDestacados, setServiciosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  // Cargar servicios para el carrusel y las tarjetas
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const servicios = await obtenerServicios();

        // Seleccionar servicios aleatorios
        const serviciosAleatorios = (servicios || [])
          .filter(s => s.fotos && s.fotos.length > 0) // Solo servicios con fotos
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);

        setServiciosDestacados(serviciosAleatorios);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  const getCategoriaIcon = (categoria) => {
    const iconos = {
      alojamiento: '🏨',
      gastronomia: '🍽️',
      tour: '🚶‍♂️'
    };
    return iconos[categoria] || '📍';
  };

  return (
    <div className="experiencia-container">
      {/* Saludo compacto */}
      <div className="experiencia-greeting-compact">
        <h1 className="greeting-compact-title">
          ¡Hola, {user?.firstName || 'Usuario'}!
        </h1>
        <p className="greeting-compact-subtitle">Tu aventura comienza aquí.</p>
      </div>

      {/* Carrusel de servicios destacado */}
      <div className="experiencia-carousel-container">
        {loading ? (
          <div className="carousel-loading">
            <div className="carousel-skeleton" />
          </div>
        ) : serviciosDestacados.length > 0 ? (
          <Carousel
            autoplay
            autoplaySpeed={4000}
            effect="fade"
            dots={{ className: 'carousel-dots' }}
          >
            {serviciosDestacados.map((servicio) => (
              <div key={servicio.id} className="carousel-slide">
                <div
                  className="carousel-image"
                  style={{ backgroundImage: `url(${servicio.fotos[0]})` }}
                  onClick={() => navigate(`/experiencia/servicios?categoria=${servicio.categoria}`)}
                >
                  <div className="carousel-overlay">
                    <div className="carousel-content">
                      <span className="carousel-badge-category">{servicio.categoria.toUpperCase()}</span>
                      <h3 className="carousel-title">{servicio.nombre}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <div
            className="carousel-image"
            style={{ backgroundImage: `url(${imagenHome})`, height: '240px' }}
          />
        )}
      </div>

      {/* Servicios destacados en tarjetas horizontales */}
      {serviciosDestacados.length > 0 && (
        <div className="experiencia-section">
          <div className="section-header">
            <h2 className="section-title">Recomendado para ti</h2>
            <button
              className="ver-todos-btn"
              onClick={() => navigate('/experiencia/servicios')}
            >
              Ver todos
            </button>
          </div>
          <div className="servicios-horizontal-list">
            {serviciosDestacados.slice(0, 4).map((servicio) => (
              <div
                key={servicio.id}
                className="servicio-card-horizontal"
                onClick={() => navigate(`/experiencia/servicios?categoria=${servicio.categoria}`)}
              >
                <div
                  className="servicio-card-imagen-horizontal"
                  style={{ backgroundImage: `url(${servicio.fotos[0]})` }}
                />
                <div className="servicio-card-info-horizontal">
                  <h3 className="servicio-nombre-horizontal">{servicio.nombre}</h3>
                  <div className="servicio-meta-horizontal">
                    <span className="servicio-distancia">{servicio.categoria.charAt(0).toUpperCase() + servicio.categoria.slice(1)}</span>
                    <span className="servicio-precio-horizontal">
                      {servicio.rangoPrecios || '$$'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorías de exploración */}
      <div className="experiencia-section">
        <h2 className="section-title">Descubre por Categoría</h2>
        <div className="categories-grid-compact">
          <button
            className="category-btn-compact tours"
            onClick={() => navigate('/experiencia/servicios?categoria=tour')}
          >
            <span className="category-icon-compact">🚶‍♂️</span>
            <span className="category-label-compact">Tours</span>
          </button>
          <button
            className="category-btn-compact gastronomia"
            onClick={() => navigate('/experiencia/servicios?categoria=gastronomia')}
          >
            <span className="category-icon-compact">🍽️</span>
            <span className="category-label-compact">Gastronomía</span>
          </button>
          <button
            className="category-btn-compact alojamientos"
            onClick={() => navigate('/experiencia/servicios?categoria=alojamiento')}
          >
            <span className="category-icon-compact">🏨</span>
            <span className="category-label-compact">Alojamientos</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Experiencia;
