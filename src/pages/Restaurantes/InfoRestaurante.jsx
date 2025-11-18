import React, { useState, useEffect } from "react";
import {
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { Typography, Space } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getRestaurant } from '../../service/restaurantService';
import { getDishesByRestaurant } from '../../service/dishService';
import { agregarFavorito, eliminarFavorito, obtenerFavoritos } from '../../service/favoritosService';
import imagenHome from '../../assets/imagenHome.jpg';
import './InfoRestaurante.css';

const { Text, Link } = Typography;

function InfoRestaurante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const restaurantResp = await getRestaurant(id);
        console.log('Restaurante obtenido:', restaurantResp);

        if (!restaurantResp.data) {
          setError('notfound');
          return;
        }

        setRestaurant(restaurantResp.data);

        try {
          const dishesResp = await getDishesByRestaurant(id);
          console.log('Platillos obtenidos:', dishesResp);
          setDishes(dishesResp.data || []);
        } catch (dishError) {
          console.log('No se pudieron cargar los platillos:', dishError);
          setDishes([]);
        }
        
        // Verificar si es favorito
        try {
          const favs = await obtenerFavoritos();
          const isFav = favs.some(f => f.tipo === 'restaurante' && f.itemId === Number.parseInt(id, 10));
          setEsFavorito(isFav);
        } catch (favError) {
          console.log('No se pudo verificar favorito:', favError);
        }

      } catch (error) {
        console.error('Error al cargar información del restaurante:', error);

        if (error.response?.status === 404) {
          setError('notfound');
        } else {
          setError('general');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, [id]);

  const toggleFavorito = async () => {
    try {
      if (esFavorito) {
        const favs = await obtenerFavoritos();
        const fav = favs.find(f => f.tipo === 'restaurante' && f.itemId === Number.parseInt(id, 10));
        if (fav) {
          await eliminarFavorito(fav.id);
          setEsFavorito(false);
        }
      } else {
        await agregarFavorito('restaurante', Number.parseInt(id, 10));
        setEsFavorito(true);
      }
    } catch (error) {
      console.error('Error al manejar favorito:', error);
    }
  };

  // Estado de Carga
  if (loading) {
    return (
      <div
        className="info-restaurant-state"
        style={{ backgroundImage: `url(${imagenHome})` }}
      >
        <div className="state-card">
          <p className="state-loading-text">
            Cargando información del restaurante...
          </p>
        </div>
      </div>
    );
  }

  // Estado de Error: Restaurante No Encontrado
  if (error === 'notfound') {
    return (
      <div
        className="info-restaurant-state"
        style={{ backgroundImage: `url(${imagenHome})` }}
      >
        <div className="state-card">
          <div className="state-icon">🍽️</div>
          <h2 className="state-title">Restaurante no encontrado</h2>
          <p className="state-subtitle">
            El restaurante que buscas no existe o ha sido eliminado.
          </p>
          <button
            onClick={() => navigate('/experiencia/restaurante')}
            className="btn btn-primary"
          >
            Volver a Restaurantes
          </button>
        </div>
      </div>
    );
  }

  // Estado de Error: Error General
  if (error === 'general') {
    return (
      <div
        className="info-restaurant-state"
        style={{ backgroundImage: `url(${imagenHome})` }}
      >
        <div className="state-card">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Error al cargar</h2>
          <p className="state-subtitle">
            Hubo un problema al cargar la información del restaurante.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate('/experiencia/restaurante')}
            className="btn btn-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Contenido Principal
  return (
    <div
      className="info-restaurant-layout"
      style={{ backgroundImage: `url(${imagenHome})` }}
    >
      <div className="info-restaurant-content">
        <div className="info-restaurant-card">

          {/* Header con Botón Volver */}
          <div className="info-restaurant-header">
            <button
              onClick={() => navigate('/experiencia/restaurante')}
              className="info-restaurant-back-button"
            >
              ← Volver a Restaurantes
            </button>
            <button
              onClick={toggleFavorito}
              className="info-restaurant-favorite-button"
              style={{ 
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {esFavorito ? (
                <HeartFilled style={{ color: '#ff4d4f', fontSize: '20px' }} />
              ) : (
                <HeartOutlined style={{ fontSize: '20px' }} />
              )}
            </button>
          </div>

          {/* Imagen Principal */}
          {restaurant.image && (
            <div className="info-restaurant-main-image">
              <img src={restaurant.image} alt={restaurant.name} />
            </div>
          )}

          {/* Cuerpo del Contenido */}
          <div className="info-restaurant-body">

            {/* Título */}
            <h1 className="info-restaurant-title">
              {restaurant.name}
            </h1>

            {/* Horario */}
            {restaurant.schedule && (
              <div className="info-box info-box-schedule">
                <span className="info-box-icon">🕒</span>
                <div className="info-box-content">
                  <div className="info-box-label">Horario</div>
                  <div className="info-box-value">{restaurant.schedule}</div>
                </div>
              </div>
            )}

            {/* Ubicación */}
            {(restaurant.latitude && restaurant.longitude) && (
              <div className="info-box info-box-location">
                <span className="info-box-icon">📍</span>
                <div className="info-box-content">
                  <div className="info-box-value">Ubicación</div>
                  <a
                    href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-box-link"
                  >
                    Ver en Google Maps →
                  </a>
                </div>
              </div>
            )}

            {/* Descripción */}
            {restaurant.description && (
              <div className="info-restaurant-about">
                <h2 className="info-restaurant-section-title">Acerca de</h2>
                <p className="info-restaurant-description">
                  {restaurant.description}
                </p>
              </div>
            )}

            {/* Menú / Platillos */}
            <div className="info-restaurant-menu">
              <h2 className="info-restaurant-section-title">Nuestro Menú</h2>

              {dishes.length === 0 ? (
                <div className="menu-empty-state">
                  <div className="menu-empty-icon">🍽️</div>
                  <p className="menu-empty-text">
                    El menú estará disponible próximamente
                  </p>
                </div>
              ) : (
                <div className="dishes-grid">
                  {dishes.map((dish) => (
                    <div key={dish.id} className="dish-card">
                      {dish.image && (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="dish-card-image"
                        />
                      )}
                      <h3 className="dish-card-name">{dish.name}</h3>
                      {dish.description && (
                        <p className="dish-card-description">
                          {dish.description}
                        </p>
                      )}
                      {dish.price && (
                        <div className="dish-card-price">
                          ${dish.price}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer con Redes Sociales */}
          <div className="info-restaurant-footer">
            <Text className="footer-text">
              Síguenos en nuestras redes sociales
            </Text>
            <Space size="large" className="footer-social-icons">
              <Link href="#" target="_blank" className="social-icon instagram">
                <InstagramOutlined />
              </Link>
              <Link href="#" target="_blank" className="social-icon facebook">
                <FacebookOutlined />
              </Link>
              <Link href="#" target="_blank" className="social-icon twitter">
                <TwitterOutlined />
              </Link>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoRestaurante;