import React from 'react';
import PropTypes from 'prop-types';
import './ServicioCard.css'; // Crearemos este archivo ahora

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
    // Tomamos la primera foto como portada, o usamos un placeholder
    const fotoPortada = servicio.fotos?.[0] || 'https://via.placeholder.com/400x300?text=Sin+Imagen';

    return (
        <div className="servicio-card">
            <div className="servicio-card-imagen">
                <img src={fotoPortada} alt={servicio.nombre} />
            </div>
            <div className="servicio-card-contenido">
                <h3>{servicio.nombre}</h3>
                <div className="servicio-card-info">
                    <span>
                        <CategoriaIcon categoria={servicio.categoria} />
                        {/* Capitalizamos la primera letra de la categoría */}
                        {servicio.categoria.charAt(0).toUpperCase() + servicio.categoria.slice(1)}
                    </span>
                    <span>
                        <PrecioIcon />
                        {servicio.rangoPrecios}
                    </span>
                </div>
            </div>
        </div>
    );
};

ServicioCard.propTypes = {
    servicio: PropTypes.shape({
        id: PropTypes.string.isRequired,
        nombre: PropTypes.string.isRequired,
        categoria: PropTypes.string.isRequired,
        rangoPrecios: PropTypes.string,
        fotos: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
};

export default ServicioCard;