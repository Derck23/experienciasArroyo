import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Tag } from 'antd';
import { EnvironmentOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './ServicioCard.css';

// Iconos placeholder (¡puedes cambiarlos por los que uses!)
const CategoriaIcon = ({ categoria }) => {
    const iconos = {
        alojamiento: '🏨', // Hotel
        gastronomia: '🍽️', // Plato y cubierto
        tour: '🚶‍♂️'       // Persona caminando
    };
    return <span style={{ marginRight: '8px' }}>{iconos[categoria] || '📍'}</span>;
};

const PrecioIcon = () => <span style={{ marginRight: '8px' }}>💰</span>;

const ServicioCard = ({ servicio, esFavorito, onToggleFavorito }) => {
    const navigate = useNavigate();
    // Tomamos la primera foto como portada, o usamos un placeholder
    const fotoPortada = servicio.fotos?.[0] || 'https://via.placeholder.com/400x300?text=Sin+Imagen';

    const getCategoriaTexto = (categoria) => {
        const textos = {
            alojamiento: 'Alojamiento',
            gastronomia: 'Gastronomía',
            tour: 'Tour'
        };
        return textos[categoria] || categoria;
    };

    const formatearPrecio = (precio) => {
        if (!precio || precio === 0 || precio === '0' || precio === 'Gratuito' || precio === 'Gratis') {
            return 'Gratis';
        }
        // Si ya viene formateado como rango ($$, $$$, etc), dejarlo así
        if (typeof precio === 'string' && precio.startsWith('$') && !precio.includes('.')) {
            return precio;
        }
        // Si es un número, formatear con MXN
        const precioNum = parseFloat(precio);
        if (!isNaN(precioNum)) {
            return `$${precioNum.toLocaleString('es-MX')} MXN`;
        }
        return precio;
    };

    return (
        <Card
            hoverable
            className="servicio-card"
            cover={
                <div className="servicio-image-container">
                    <img
                        alt={servicio.nombre}
                        src={fotoPortada}
                        className="servicio-image"
                    />
                    <Button
                        type="text"
                        shape="circle"
                        icon={
                            esFavorito
                                ? <HeartFilled style={{ color: '#ff4d4f' }} />
                                : <HeartOutlined />
                        }
                        className="favorito-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorito(servicio.id);
                        }}
                    />
                    {/* Tag de disponibilidad */}
                    {servicio.cantidadBoletos === 0 ? (
                        <Tag color="red" className="destacado-tag">
                            AGOTADO
                        </Tag>
                    ) : (servicio.cantidadBoletos > 0 && servicio.cantidadBoletos <= 10) ? (
                        <Tag color="red" className="destacado-tag">
                            ¡Últimos lugares!
                        </Tag>
                    ) : null}
                </div>
            }
        >
            <h3 className="servicio-nombre">{servicio.nombre}</h3>
            
            <Tag color="green" style={{ marginBottom: '8px' }}>
                <CategoriaIcon categoria={servicio.categoria} />
                {getCategoriaTexto(servicio.categoria)}
            </Tag>

            <div className="servicio-info">
                <EnvironmentOutlined />
                <span>{servicio.ubicacion || 'Arroyo Seco, Querétaro'}</span>
            </div>

            {servicio.cantidadBoletos && (
                <div className="servicio-info" style={{ color: servicio.cantidadBoletos < 20 ? '#ff4d4f' : '#52c41a', fontWeight: '500' }}>
                    🎫 <span>{servicio.cantidadBoletos} boletos disponibles</span>
                </div>
            )}

            <div className="servicio-footer">
                <span className={`servicio-precio ${(!servicio.costo && !servicio.rangoPrecios) || servicio.costo === 0 || servicio.costo === 'Gratuito' ? 'gratis' : ''}`}>
                    {formatearPrecio(servicio.costo || servicio.rangoPrecios || '$$')}
                </span>
                <Button 
                    type="primary" 
                    onClick={() => navigate(`/experiencia/servicios/${servicio.id}`)}
                >
                    Ver Detalles
                </Button>
            </div>
        </Card>
    );
};

ServicioCard.propTypes = {
    servicio: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        nombre: PropTypes.string.isRequired,
        categoria: PropTypes.string.isRequired,
        rangoPrecios: PropTypes.string,
        fotos: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    esFavorito: PropTypes.bool,
    onToggleFavorito: PropTypes.func,
};

export default ServicioCard;