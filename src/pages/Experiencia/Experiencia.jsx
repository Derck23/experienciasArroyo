import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import imagenHome from '../../assets/imagenHome.jpg';
import imageBg from '../../assets/image.png';
import { getCurrentUser } from '../../utils/auth';
import { Carousel, message, Modal, Button } from 'antd';
import { obtenerServicios } from '../../service/servicioService';
import useInactivityLogout from '../../hooks/useInactivityLogout.jsx';
import useBackButton from '../../hooks/useBackButton.jsx';
import './Experiencia.css';

function Experiencia() {
  const navigate = useNavigate();
  const [serviciosDestacados, setServiciosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = getCurrentUser();

  // Hook de cierre de sesión por inactividad (1 minuto, advertencia a los 15s)
  const { showModal, countdown, resetTimer } = useInactivityLogout(60000, 15000);

  // Hook para manejar botón atrás del teléfono
  useBackButton('/experiencia');

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('Debes iniciar sesión para continuar');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Cargar servicios para el carrusel y las tarjetas
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setError(null);
        const servicios = await obtenerServicios();

        if (!servicios || servicios.length === 0) {
          setServiciosDestacados([]);
          setError('no-services');
          return;
        }

        // Seleccionar servicios aleatorios
        const serviciosAleatorios = (servicios || [])
          .filter(s => s.fotos && s.fotos.length > 0) // Solo servicios con fotos
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);

        if (serviciosAleatorios.length === 0) {
          setError('no-services-with-photos');
        }

        setServiciosDestacados(serviciosAleatorios);
      } catch (error) {
        console.error('Error al cargar servicios:', error);

        // Verificar si es error de autenticación
        if (error.response?.status === 401 || error.response?.status === 403) {
          message.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
          return;
        }

        setError('fetch-error');
        message.error('No se pudieron cargar los servicios. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [navigate]);

  const getCategoriaIcon = (categoria) => {
    const iconos = {
      alojamiento: '🏨',
      gastronomia: '🍽️',
      tour: '🚶‍♂️'
    };
    return iconos[categoria] || '📍';
  };

  // Función para manejar errores de imágenes
  const handleImageError = (e) => {
    e.target.style.backgroundImage = `url(${imagenHome})`;
    e.target.style.backgroundSize = 'cover';
    e.target.style.backgroundPosition = 'center';
  };

  return (
    <div className="experiencia-container">
      {/* Modal de advertencia de inactividad */}
      <Modal
        open={showModal}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <span>Sesión Inactiva</span>
          </div>
        }
        centered
        closable={false}
        maskClosable={false}
        footer={[
          <Button
            key="continue"
            type="primary"
            onClick={resetTimer}
            style={{
              backgroundColor: '#16a085',
              borderColor: '#16a085',
              fontWeight: 'bold'
            }}
          >
            Continuar Sesión
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Tu sesión expirará en
          </p>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ff4d4f',
            marginBottom: '20px'
          }}>
            {countdown}
          </div>
          <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
            segundos por inactividad
          </p>
          <p style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '15px' }}>
            Haz click en "Continuar Sesión" para mantener tu sesión activa.
          </p>
        </div>
      </Modal>

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
            <div className="carousel-skeleton">
              <div className="skeleton-pulse" style={{
                width: '100%',
                height: '240px',
                backgroundColor: '#e0e0e0',
                borderRadius: '12px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            </div>
          </div>
        ) : error ? (
          <div className="error-message-container" style={{
            backgroundColor: '#fff3e0',
            padding: '40px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px dashed #ff9800'
          }}>
            {error === 'no-services' ? (
              <>
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>🏔️</div>
                <h3 style={{ color: '#e67e22', marginBottom: '10px', fontSize: '20px' }}>
                  No hay servicios disponibles
                </h3>
                <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                  Estamos preparando experiencias increíbles para ti. Vuelve pronto.
                </p>
              </>
            ) : error === 'no-services-with-photos' ? (
              <>
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>📸</div>
                <h3 style={{ color: '#e67e22', marginBottom: '10px', fontSize: '20px' }}>
                  Servicios sin imágenes
                </h3>
                <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                  Los servicios están disponibles pero sin fotos en este momento.
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>⚠️</div>
                <h3 style={{ color: '#e67e22', marginBottom: '10px', fontSize: '20px' }}>
                  Error al cargar servicios
                </h3>
                <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '15px' }}>
                  No pudimos cargar los servicios. Verifica tu conexión.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    backgroundColor: '#16a085',
                    color: 'white',
                    padding: '10px 25px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Reintentar
                </button>
              </>
            )}
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
                  onError={(e) => {
                    console.warn('Error cargando imagen del carrusel:', servicio.fotos[0]);
                    e.currentTarget.style.backgroundImage = `url(${imagenHome})`;
                  }}
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
                  style={{
                    backgroundImage: `url(${servicio.fotos[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onError={(e) => {
                    console.warn('Error cargando imagen del servicio:', servicio.fotos[0]);
                    e.currentTarget.style.backgroundImage = `url(${imagenHome})`;
                  }}
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
