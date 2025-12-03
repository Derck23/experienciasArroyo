import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerAtracciones } from '../../service/atraccionService';
import { obtenerEventos } from '../../service/eventoService';
import { obtenerServicios } from '../../service/servicioService';
import { agregarFavorito, eliminarFavorito, obtenerFavoritos } from '../../service/favoritosService';
import './MapadeAtracciones.css';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crear iconos personalizados
const createCustomIcon = (emoji, color) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 20px;">${emoji}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};

const MapadeAtracciones = () => {
    const [showQuestCard, setShowQuestCard] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [viewMode, setViewMode] = useState('map');
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('todos'); // 'todos', 'atracciones', 'eventos', 'servicios'
    const [favoritos, setFavoritos] = useState([]);

    // Coordenadas de Arroyo Seco, Querétaro
    const arroyoSecoCenter = [21.5523, -99.6739];

    // Cargar favoritos al montar
    useEffect(() => {
        const favs = localStorage.getItem('favoritos_mapa');
        if (favs) {
            setFavoritos(JSON.parse(favs));
        }
    }, []);

    // Guardar favoritos en localStorage y llamar a API
    const toggleFavorito = async (location) => {
        try {
            // Determinar el tipo de favorito
            let tipo = 'atraccion';
            if (location.type === 'evento') tipo = 'evento';
            if (location.type === 'servicio') tipo = 'servicio';

            if (favoritos.includes(location.id)) {
                // Eliminar de favoritos
                await eliminarFavorito(location.id);
                setFavoritos(prev => {
                    const updated = prev.filter(id => id !== location.id);
                    localStorage.setItem('favoritos_mapa', JSON.stringify(updated));
                    return updated;
                });
            } else {
                // Agregar a favoritos
                await agregarFavorito(tipo, location.id);
                setFavoritos(prev => {
                    const updated = [...prev, location.id];
                    localStorage.setItem('favoritos_mapa', JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error al manejar favorito:', error);
        }
    };

    const abrirMapa = (coordinates) => {
        if (coordinates && coordinates[0] && coordinates[1]) {
            window.open(
                `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`,
                '_blank'
            );
        }
    };

    // Cargar atracciones, eventos y alojamientos desde la API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [atraccionesData, eventosData, serviciosData] = await Promise.all([
                    obtenerAtracciones(),
                    obtenerEventos(),
                    obtenerServicios()
                ]);

                console.log('Datos recibidos:', { atraccionesData, eventosData, serviciosData });
                
                // Procesar atracciones
                const atraccionesActivos = (atraccionesData || []).filter(a => 
                    a.estado === 'activo' || a.estado === 'activa'
                ).map(atraccion => ({
                    id: atraccion.id,
                    name: atraccion.nombre,
                    icon: '📍',
                    coordinates: [
                        parseFloat(atraccion.latitud) || arroyoSecoCenter[0],
                        parseFloat(atraccion.longitud) || arroyoSecoCenter[1]
                    ],
                    type: 'atraccion',
                    color: '#3b82f6',
                    description: atraccion.descripcion || 'Sin descripción',
                    horario: atraccion.horarios || 'Consultar horario',
                    imagen: (atraccion.fotos && atraccion.fotos.length > 0) 
                        ? atraccion.fotos[0] 
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E",
                    costo: atraccion.costoEntrada || 'Gratuito'
                }));

                // Procesar eventos
                const eventosActivos = (eventosData || []).filter(e => 
                    e.estado === 'activo' || e.estado === 'activa'
                ).map(evento => {
                    let lat = arroyoSecoCenter[0];
                    let lng = arroyoSecoCenter[1];
                    try {
                        const ubicacion = JSON.parse(evento.ubicacion || '{}');
                        if (ubicacion.lat && ubicacion.lng) {
                            lat = ubicacion.lat;
                            lng = ubicacion.lng;
                        }
                    } catch (e) {
                        console.log('Error al parsear ubicación del evento');
                    }
                    return {
                        id: evento.id,
                        name: evento.nombre,
                        icon: '🎉',
                        coordinates: [lat, lng],
                        type: 'evento',
                        color: '#f59e0b',
                        description: evento.descripcion || 'Sin descripción',
                        horario: evento.fecha ? `${evento.fecha} ${evento.hora || ''}` : 'Consultar fecha',
                        imagen: (evento.fotos && evento.fotos.length > 0) || evento.imagen
                            ? evento.fotos?.[0] || evento.imagen
                            : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🎉 Evento%3C/text%3E%3C/svg%3E",
                        costo: evento.precio || 'Gratuito'
                    };
                });

                // Procesar restaurantes (servicios) — tolerante a distintas estructuras de respuesta
                const serviciosArray = serviciosData?.data || serviciosData || [];
                const serviciosActivos = (serviciosArray || []).map(restaurante => {
                    // Determinar lat/lng desde distintos campos posibles
                    let lat = arroyoSecoCenter[0];
                    let lng = arroyoSecoCenter[1];

                    if (restaurante.latitud != null && restaurante.longitud != null) {
                        lat = parseFloat(restaurante.latitud) || lat;
                        lng = parseFloat(restaurante.longitud) || lng;
                    } else if (restaurante.lat != null && restaurante.lng != null) {
                        lat = parseFloat(restaurante.lat) || lat;
                        lng = parseFloat(restaurante.lng) || lng;
                    } else if (restaurante.location && (restaurante.location.lat || restaurante.location.lng)) {
                        lat = parseFloat(restaurante.location.lat) || lat;
                        lng = parseFloat(restaurante.location.lng) || lng;
                    } else if (restaurante.ubicacion) {
                        try {
                            // Soportar: JSON string '{"lat":...,"lng":...}' y también formato 'lat,lng'
                            if (typeof restaurante.ubicacion === 'string' && restaurante.ubicacion.includes(',')) {
                                const parts = restaurante.ubicacion.split(',').map(p => p.trim());
                                if (parts.length >= 2) {
                                    lat = parseFloat(parts[0]) || lat;
                                    lng = parseFloat(parts[1]) || lng;
                                }
                            } else {
                                const u = typeof restaurante.ubicacion === 'string' ? JSON.parse(restaurante.ubicacion) : restaurante.ubicacion;
                                if (u && (u.lat || u.lng)) {
                                    lat = parseFloat(u.lat) || lat;
                                    lng = parseFloat(u.lng) || lng;
                                }
                            }
                        } catch (e) {
                            // noop
                        }
                    } else if (Array.isArray(restaurante.coordinates) && restaurante.coordinates.length >= 2) {
                        lat = parseFloat(restaurante.coordinates[0]) || lat;
                        lng = parseFloat(restaurante.coordinates[1]) || lng;
                    } else if (restaurante.geometry && Array.isArray(restaurante.geometry.coordinates)) {
                        // GeoJSON: [lng, lat]
                        const coords = restaurante.geometry.coordinates;
                        lng = parseFloat(coords[0]) || lng;
                        lat = parseFloat(coords[1]) || lat;
                    }

                    return {
                        id: restaurante.id || restaurante._id || `${restaurante.nombre || 'servicio'}-${Math.random().toString(36).slice(2,8)}`,
                        name: restaurante.nombre || restaurante.title || 'Servicio',
                        icon: '🏨',
                        coordinates: [lat, lng],
                        type: 'servicio',
                        color: '#10b981',
                        description: restaurante.descripcion || restaurante.description || 'Sin descripción',
                        horario: restaurante.horarios || restaurante.horario || 'Consultar horario',
                        imagen: (restaurante.fotos && restaurante.fotos.length > 0)
                            ? restaurante.fotos[0]
                            : restaurante.imagen || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🏨 Servicio%3C/text%3E%3C/svg%3E",
                        costo: restaurante.precioPromedio || restaurante.price || 'Consultar'
                    };
                });

                const allLocations = [...atraccionesActivos, ...eventosActivos, ...serviciosActivos];
                console.log('Todas las ubicaciones:', allLocations);
                setLocations(allLocations);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('No se pudieron cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Función para obtener icono según tipo
    const getIconByType = (tipo) => {
        const iconos = {
            'naturaleza': '🌊',
            'historico': '🏛️',
            'aventura': '🕳️',
            'restaurante': '🍽️',
            'mirador': '🔭',
            'balneario': '🏖️',
            'cascada': '💧',
            'senderismo': '🥾',
            'pueblo': '🏘️'
        };
        return iconos[tipo?.toLowerCase()] || '📍';
    };

    // Función para obtener color según tipo
    const getColorByType = (tipo) => {
        const colores = {
            'naturaleza': '#3b82f6',
            'historico': '#ef4444',
            'aventura': '#8b5cf6',
            'restaurante': '#f59e0b',
            'mirador': '#10b981',
            'balneario': '#06b6d4',
            'cascada': '#3b82f6',
            'senderismo': '#16a34a',
            'pueblo': '#dc2626'
        };
        return colores[tipo?.toLowerCase()] || '#6b7280';
    };

    const handleMarkerClick = (location) => {
        setSelectedLocation(location);
    };

    if (loading) {
        return (
            <div className="mapa-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando atracciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mapa-page">
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mapa-page">
            <div className="mapa-main-content">
                {/* Mapa Principal con Leaflet */}
                <main className="mapa-main">
                    <div className="mapa-leaflet-container">
                        <MapContainer
                            center={arroyoSecoCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {locations
                                .filter(location => {
                                    // Filtrar por tipo
                                    if (filterType === 'todos') {
                                        return true;
                                    } else if (filterType === 'atracciones') {
                                        return location.type === 'atraccion';
                                    } else if (filterType === 'eventos') {
                                        return location.type === 'evento';
                                    } else if (filterType === 'servicios') {
                                        return location.type === 'servicio';
                                    }
                                    return true;
                                })
                                .filter(location => 
                                    // Filtrar por búsqueda
                                    !searchTerm || 
                                    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (location.description || '').toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((location) => (
                                    <Marker
                                        key={location.id}
                                        position={location.coordinates}
                                        icon={createCustomIcon(location.icon, location.color)}
                                        eventHandlers={{
                                            click: () => handleMarkerClick(location)
                                        }}
                                    >
                                        <Popup>
                                            <div className="custom-popup">
                                                <h3>{location.name}</h3>
                                                <p>{location.description}</p>
                                                <p className="popup-horario">⏰ {location.horario}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))
                            }
                        </MapContainer>

                        {/* Filtros y Búsqueda superpuesta */}
                        <div className="search-overlay">
                            <div style={{ marginBottom: '15px', pointerEvents: 'all' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#1f2937' }}>
                                    Filtrar por tipo:
                                </label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setFilterType('todos')}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: filterType === 'todos' ? '#2563eb' : '#e5e7eb',
                                            color: filterType === 'todos' ? 'white' : '#374151',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: filterType === 'todos' ? 'bold' : 'normal',
                                            transition: 'all 0.3s',
                                            pointerEvents: 'all'
                                        }}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        onClick={() => setFilterType('atracciones')}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: filterType === 'atracciones' ? '#3b82f6' : '#e5e7eb',
                                            color: filterType === 'atracciones' ? 'white' : '#374151',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: filterType === 'atracciones' ? 'bold' : 'normal',
                                            transition: 'all 0.3s',
                                            pointerEvents: 'all'
                                        }}
                                    >
                                        📍 Atracciones
                                    </button>
                                    <button
                                        onClick={() => setFilterType('eventos')}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: filterType === 'eventos' ? '#f59e0b' : '#e5e7eb',
                                            color: filterType === 'eventos' ? 'white' : '#374151',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: filterType === 'eventos' ? 'bold' : 'normal',
                                            transition: 'all 0.3s',
                                            pointerEvents: 'all'
                                        }}
                                    >
                                        🎉 Eventos
                                    </button>
                                    <button
                                        onClick={() => setFilterType('servicios')}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: filterType === 'servicios' ? '#10b981' : '#e5e7eb',
                                            color: filterType === 'servicios' ? 'white' : '#374151',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: filterType === 'servicios' ? 'bold' : 'normal',
                                            transition: 'all 0.3s',
                                            pointerEvents: 'all'
                                        }}
                                    >
                                        🏨 Servicios
                                    </button>
                                </div>
                            </div>
                            <div className="search-main-container">
                                <span className="search-icon-main">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Buscar lugares o actividades"
                                    className="search-input-main"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tarjeta de Desafío */}
                        {showQuestCard && (
                            <div className="quest-card">
                                <h2 className="quest-title">¡Descubre el Balneario El Sauce!</h2>
                                <p className="quest-description">
                                    Un chapuzón en la historia te espera. Este lugar esconde secretos que solo los más curiosos pueden desvelar. ¿Estás listo para el desafío?
                                </p>
                                <div className="quest-actions">
                                    <button className="btn-quest-primary">
                                        <span className="btn-icon">💡</span>
                                        <span>Resuelve un Acertijo para Revelar su Historia</span>
                                    </button>
                                    <button className="btn-quest-secondary">
                                        <span className="btn-icon">💎</span>
                                        <span>Encuentra el Tesoro Oculto</span>
                                    </button>
                                    <button
                                        className="btn-close-quest"
                                        onClick={() => setShowQuestCard(false)}
                                    >
                                        Cerrar Desafío
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Controles de Zoom personalizados */}
                        <div className="map-controls">
                            <div className="zoom-controls">
                                <button className="zoom-btn" aria-label="Zoom in">➕</button>
                                <div className="zoom-divider"></div>
                                <button className="zoom-btn" aria-label="Zoom out">➖</button>
                            </div>
                            <button 
                                className="navigation-btn" 
                                aria-label="Mi ubicación"
                                onClick={() => setShowQuestCard(!showQuestCard)}
                            >
                                🧭
                            </button>
                        </div>

                        {/* Botones de Acción Flotantes */}
                        <div className="floating-actions">
                            <button 
                                className="btn-floating-primary"
                                onClick={() => selectedLocation && abrirMapa(selectedLocation.coordinates)}
                            >
                                <span className="btn-icon">🧭</span>
                                <span>Explorar Mapa</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="mapa-sidebar">
                    <div className="sidebar-content">
                        <h1 className="sidebar-title" style={{ color: '#2D5016', fontWeight: 'normal' }}>
                            {selectedLocation ? selectedLocation.name : 'Arroyo Seco'}
                        </h1>

                        {/* Imagen Principal */}
                        <div className="location-image-container">
                            <div 
                                className="location-image"
                                style={{
                                    backgroundImage: `url(${selectedLocation?.imagen || 'https://via.placeholder.com/400'})`
                                }}
                            ></div>
                        </div>

                        {/* Descripción */}
                        <p className="location-description">
                            {selectedLocation 
                                ? selectedLocation.description 
                                : 'Selecciona una atracción en el mapa para ver más detalles.'}
                        </p>

                        {/* Horarios */}
                        <div className="location-schedule">
                            <h3 className="section-title">Horarios</h3>
                            <div className="schedule-item">
                                <span className="schedule-icon">⏰</span>
                                <span>
                                    {selectedLocation 
                                        ? selectedLocation.horario 
                                        : 'Abierto de 9:00 a 20:00 todos los días'}
                                </span>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="location-actions">
                            <button 
                                className="btn-action-primary"
                                onClick={() => selectedLocation && abrirMapa(selectedLocation.coordinates)}
                            >
                                <span className="btn-icon">🧭</span>
                                <span>Cómo llegar</span>
                            </button>
                            <button 
                                className="btn-action-secondary"
                                onClick={() => selectedLocation && toggleFavorito(selectedLocation)}
                                style={{
                                    background: selectedLocation && favoritos.includes(selectedLocation.id) ? '#ff4d4f' : '#f5f5f5',
                                    color: selectedLocation && favoritos.includes(selectedLocation.id) ? 'white' : '#000'
                                }}
                            >
                                <span className="btn-icon">{selectedLocation && favoritos.includes(selectedLocation.id) ? '❤️' : '🖤'}</span>
                                <span>Favoritos</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default MapadeAtracciones;