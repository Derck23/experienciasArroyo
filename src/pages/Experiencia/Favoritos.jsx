import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Empty, Spin, Button, Tag, message, Modal } from 'antd';
import {
  HeartFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { obtenerFavoritos, eliminarFavorito } from '../../service/favoritosService';
import './Favoritos.css';

const { TabPane } = Tabs;

const Favoritos = () => {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState({
    restaurantes: [],
    atracciones: [],
    eventos: [],
    servicios: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurantes');
  const [modalEliminar, setModalEliminar] = useState({
    visible: false,
    favoritoId: null,
    tipo: null,
    nombre: ''
  });

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const cargarFavoritos = async () => {
    try {
      setLoading(true);
      const data = await obtenerFavoritos();
      
      // Organizar favoritos por tipo
      const organizados = {
        restaurantes: data.filter(f => f.tipo === 'restaurante'),
        atracciones: data.filter(f => f.tipo === 'atraccion'),
        eventos: data.filter(f => f.tipo === 'evento'),
        servicios: data.filter(f => f.tipo === 'servicio')
      };
      
      setFavoritos(organizados);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      message.error('No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const mostrarModalEliminar = (favoritoId, tipo, nombreItem) => {
    setModalEliminar({
      visible: true,
      favoritoId,
      tipo,
      nombre: nombreItem
    });
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarFavorito(modalEliminar.favoritoId);
      message.success('Eliminado de favoritos');

      // Actualizar el estado local
      setFavoritos(prev => ({
        ...prev,
        [modalEliminar.tipo + 's']: prev[modalEliminar.tipo + 's'].filter(f => f.id !== modalEliminar.favoritoId)
      }));

      // Cerrar modal
      setModalEliminar({
        visible: false,
        favoritoId: null,
        tipo: null,
        nombre: ''
      });
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      message.error('No se pudo eliminar de favoritos');
    }
  };

  const cancelarEliminar = () => {
    setModalEliminar({
      visible: false,
      favoritoId: null,
      tipo: null,
      nombre: ''
    });
  };

  const handleVerDetalle = (tipo, itemId) => {
    const rutas = {
      restaurante: `/experiencia/restaurante/${itemId}`,
      atraccion: `/experiencia/atracciones/${itemId}`,
      evento: `/experiencia/eventos/${itemId}`,
      servicio: `/experiencia/servicios/${itemId}`
    };
    navigate(rutas[tipo]);
  };

  const renderFavoritoCard = (favorito) => {
    const { id, tipo, item } = favorito;
    
    return (
      <Card
        key={id}
        hoverable
        className="favorito-card"
        cover={
          <div className="favorito-image-container">
            <img
              alt={item.nombre || item.name}
              src={item.imagen || item.image || item.fotos?.[0]}
              className="favorito-image"
            />
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              className="delete-favorito-btn"
              onClick={(e) => {
                e.stopPropagation();
                mostrarModalEliminar(id, tipo, item.nombre || item.name);
              }}
            />
          </div>
        }
        onClick={() => handleVerDetalle(tipo, item.id)}
      >
        <div className="favorito-content">
          <h3 className="favorito-titulo">{item.nombre || item.name}</h3>
          
          {item.categoria && (
            <Tag color="green" className="favorito-tag">
              {item.categoria || item.category}
            </Tag>
          )}
          
          <div className="favorito-info">
            {(item.schedule || item.horarioApertura) && (
              <div className="info-item">
                <ClockCircleOutlined />
                <span>{item.schedule || item.horarioApertura}</span>
              </div>
            )}
            
            {(item.latitude || item.ubicacion) && (
              <div className="info-item">
                <EnvironmentOutlined />
                <span>Ver ubicación</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderTabContent = (tipo) => {
    const items = favoritos[tipo];
    
    if (items.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <h3>No tienes favoritos en esta categoría</h3>
              <p>Explora y agrega tus lugares favoritos</p>
            </div>
          }
        >
          <Button type="primary" onClick={() => navigate('/experiencia')}>
            Explorar
          </Button>
        </Empty>
      );
    }
    
    return (
      <div className="favoritos-grid">
        {items.map(renderFavoritoCard)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="favoritos-container">
        <div className="loading-container">
          <Spin size="large" />
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favoritos-container">
      <div className="favoritos-header">
        <div className="header-icon">
          <HeartFilled style={{ color: '#ff4d4f', fontSize: '32px' }} />
        </div>
        <h1 className="favoritos-titulo-principal">Mis Favoritos</h1>
        <p className="favoritos-subtitulo">
          Tus lugares y experiencias guardadas
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        className="favoritos-tabs"
      >
        <TabPane 
          tab={`Restaurantes (${favoritos.restaurantes.length})`} 
          key="restaurantes"
        >
          {renderTabContent('restaurantes')}
        </TabPane>
        
        <TabPane 
          tab={`Atracciones (${favoritos.atracciones.length})`} 
          key="atracciones"
        >
          {renderTabContent('atracciones')}
        </TabPane>
        
        <TabPane 
          tab={`Eventos (${favoritos.eventos.length})`} 
          key="eventos"
        >
          {renderTabContent('eventos')}
        </TabPane>
        
        <TabPane
          tab={`Servicios (${favoritos.servicios.length})`}
          key="servicios"
        >
          {renderTabContent('servicios')}
        </TabPane>
      </Tabs>

      {/* Modal de confirmación para eliminar */}
      <Modal
        title="¿Eliminar de favoritos?"
        open={modalEliminar.visible}
        onOk={confirmarEliminar}
        onCancel={cancelarEliminar}
        centered
        okText="Sí, eliminar"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true,
          style: {
            backgroundColor: '#ff4d4f',
            borderColor: '#ff4d4f'
          }
        }}
      >
        <p>¿Estás seguro que deseas eliminar <strong>"{modalEliminar.nombre}"</strong> de tus favoritos?</p>
      </Modal>
    </div>
  );
};

export default Favoritos;
