import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Spin,
  Result,
  Button,
  Empty,
  Space,
  Tag
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
  FireOutlined
} from "@ant-design/icons";
import imagenHome from '../../assets/imagenHome.jpg';
import { logout, getCurrentUser } from '../../utils/auth';
import { listRestaurants } from '../../service/restaurantService';
import './Restaurante.css';

const { Content } = Layout;
const { Title, Text, Link } = Typography;

function Restaurante() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const user = getCurrentUser();
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await listRestaurants();
        setRestaurants(resp.data || []);
      } catch (error) {
        console.error('Error completo al cargar restaurantes:', error);
        if (error.response?.status === 403) {
          setError('forbidden');
        } else if (error.response?.status === 401) {
          setError('auth');
        } else if (error.code === 'ERR_NETWORK') {
          setError('network');
        } else {
          setError('general');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Obtener categorías únicas de los restaurantes
  const categories = ['Todos', ...new Set(restaurants.map(r => r.category).filter(Boolean))];

  // Filtrar restaurantes por categoría
  const filteredRestaurants = selectedCategory === 'Todos' 
    ? restaurants 
    : restaurants.filter(r => r.category === selectedCategory);

  const renderRestaurantCard = (restaurant) => (
    <div 
      key={restaurant.id} 
      className="restaurant-service-card"
      onClick={() => navigate(`/experiencia/restaurante/${restaurant.id}`)}
    >
      {restaurant.image && (
        <div className="restaurant-service-card-image-wrapper">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="restaurant-service-card-image"
          />
          <div className="restaurant-service-card-overlay">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<ArrowRightOutlined />}
              size="large"
              className="restaurant-service-card-arrow"
            />
          </div>
        </div>
      )}
      
      <div className="restaurant-service-card-content">
        <Title level={4} className="restaurant-service-card-title">
          {restaurant.name}
        </Title>

        <div className="restaurant-service-card-details">
          {restaurant.schedule && (
            <div className="restaurant-service-detail-item">
              <ClockCircleOutlined className="restaurant-service-icon" />
              <Text className="restaurant-service-detail-text">{restaurant.schedule}</Text>
            </div>
          )}

          {(restaurant.latitude && restaurant.longitude) && (
            <div 
              className="restaurant-service-detail-item clickable"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`, '_blank');
              }}
            >
              <EnvironmentOutlined className="restaurant-service-icon location" />
              <Text className="restaurant-service-detail-text location">Ver en el mapa</Text>
            </div>
          )}

          {restaurant.priceRange && (
            <div className="restaurant-service-detail-item">
              <FireOutlined className="restaurant-service-icon price" />
              <Text className="restaurant-service-detail-text price">{restaurant.priceRange}</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="restaurant-service-loading">
          <Spin size="large" tip="Cargando restaurantes..." />
        </div>
      );
    }

    if (error) {
      let status, title, subTitle, extra;
      switch (error) {
        case 'forbidden':
          status = "403";
          title = "Acceso no permitido";
          subTitle = `Tu cuenta (${user?.email || 'No identificado'}) no tiene permisos para ver esta información.`;
          extra = [
            <Button key="retry" type="primary" onClick={() => window.location.reload()}>Reintentar</Button>,
            <Button key="home" onClick={() => navigate('/experiencia')}>Volver al inicio</Button>
          ];
          break;
        case 'auth':
          status = "401";
          title = "Sesión expirada o inválida";
          subTitle = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
          extra = <Button type="primary" onClick={() => { logout(); navigate('/login'); }}>Ir a Iniciar Sesión</Button>;
          break;
        case 'network':
          status = "error";
          title = "Error de conexión";
          subTitle = "No se puede conectar al servidor. Verifica tu conexión a internet.";
          extra = <Button type="primary" onClick={() => window.location.reload()}>Reintentar</Button>;
          break;
        default:
          status = "500";
          title = "Error al cargar los restaurantes";
          subTitle = "Por favor, intenta nuevamente más tarde.";
          extra = <Button type="primary" onClick={() => window.location.reload()}>Reintentar</Button>;
      }
      return (
        <div className="restaurant-service-loading">
          <Result status={status} title={title} subTitle={subTitle} extra={extra} />
        </div>
      );
    }

    if (filteredRestaurants.length === 0) {
      return (
        <div className="restaurant-service-loading">
          <Empty description="No hay restaurantes disponibles en esta categoría." />
        </div>
      );
    }

    return (
      <div className="restaurant-service-grid">
        {filteredRestaurants.map(renderRestaurantCard)}
      </div>
    );
  };

  return (
    <Layout className="restaurant-service-layout">
      <Content className="restaurant-service-content">
        
        <div className="restaurant-service-header">
          <Title level={1} className="restaurant-service-main-title">
            Gastronomía
          </Title>
          <Text className="restaurant-service-subtitle">
            Descubre los mejores restaurantes de la Sierra Gorda Queretana.
          </Text>
        </div>

        <div className="restaurant-service-filter-section">
          <Space size="middle" wrap className="restaurant-service-filter-buttons">
            {categories.map(category => (
              <Button
                key={category}
                type={selectedCategory === category ? "primary" : "default"}
                onClick={() => setSelectedCategory(category)}
                className={`restaurant-service-filter-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </Button>
            ))}
          </Space>
        </div>

        {renderMainContent()}

        <div className="restaurant-service-footer">
          <Space size="large" className="restaurant-service-social-icons">
            <Link href="#" target="_blank" className="restaurant-social-link instagram">
              <InstagramOutlined />
            </Link>
            <Link href="#" target="_blank" className="restaurant-social-link facebook">
              <FacebookOutlined />
            </Link>
            <Link href="#" target="_blank" className="restaurant-social-link twitter">
              <TwitterOutlined />
            </Link>
          </Space>
          <Text className="restaurant-service-footer-text">
            Contacto Rápido
          </Text>
        </div>

      </Content>
    </Layout>
  );
}

export default Restaurante;