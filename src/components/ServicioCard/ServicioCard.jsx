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

    const getCategoriaTexto = (categoria) => {
        const textos = {
            alojamiento: 'Alojamiento',
            gastronomia: 'Gastronomía',
            tour: 'Tour'
        };
        return textos[categoria] || categoria;
    };

    return (
        <div className="servicio-card">
            <div className="servicio-card-imagen">
                <img src={fotoPortada} alt={servicio.nombre} />
                {servicio.latitud && servicio.longitud && (
                    <a
                        href={`https://www.google.com/maps?q=${servicio.latitud},${servicio.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="servicio-map-btn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        📍
                    </a>
                )}
            </div>
            <div className="servicio-card-contenido">
                <h3>{servicio.nombre}</h3>
                <div className="servicio-card-info">
                    <span>
                        <CategoriaIcon categoria={servicio.categoria} />
                        {getCategoriaTexto(servicio.categoria)}
                    </span>
                    <span>
                        {servicio.rangoPrecios || '$$'}
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