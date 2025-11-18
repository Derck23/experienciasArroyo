import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Tag } from 'antd';
import { EnvironmentOutlined, HeartOutlined } from '@ant-design/icons';
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

const ServicioCard = ({ servicio }) => {
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
                        icon={<HeartOutlined />}
                        className="favorito-btn"
                    />
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

            <div className="servicio-footer">
                <span className="servicio-precio">
                    {servicio.rangoPrecios || '$$'}
                </span>
                <Button 
                    type="primary" 
                    ghost
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
};

export default ServicioCard;