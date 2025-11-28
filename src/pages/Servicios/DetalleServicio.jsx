import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Spin, Carousel, Rate, Divider, message } from 'antd';
import {
    ArrowLeftOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    PhoneOutlined,
    GlobalOutlined,
    MailOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { obtenerServicios } from '../../service/servicioService';
import { agregarFavorito, eliminarFavorito, obtenerFavoritos } from '../../service/favoritosService';
import './DetalleServicio.css';
import ReservaModal from '../../components/ReservaModal/ReservaModal';

const DetalleServicio = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [esFavorito, setEsFavorito] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);

    useEffect(() => {
        cargarServicio();
        verificarFavorito();
    }, [id]);

    const handleReservaExitosa = () => {
        message.success('¡Reservación creada con éxito! Revisa "Mis Reservaciones"');
    };
    const verificarFavorito = async () => {
        try {
            const favs = await obtenerFavoritos();
            // Usamos '==' (doble igual) para que '5' sea igual a 5
            const isFav = favs.some(f => f.tipo === 'servicio' && f.itemId == id);
            setEsFavorito(isFav);
        } catch (error) {
            console.error('No se pudo verificar favorito:', error);
        }
    };

    const cargarServicio = async () => {
        try {
            setLoading(true);
            const data = await obtenerServicios();
            console.log('DetalleServicio - ID de URL:', id, 'tipo:', typeof id);
            console.log('DetalleServicio - Servicios obtenidos:', data.length);
            console.log('DetalleServicio - IDs disponibles:', data.map(s => ({id: s.id, tipo: typeof s.id})));
            
            const servicioEncontrado = data.find(s => String(s.id) === String(id));
            console.log('DetalleServicio - Servicio encontrado:', servicioEncontrado);
            
            if (servicioEncontrado) {
                setServicio(servicioEncontrado);
            } else {
                setError('Servicio no encontrado');
            }
        } catch (err) {
            console.error('Error al cargar servicio:', err);
            setError('No se pudo cargar el servicio');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorito = async () => {
        try {
            // Normalizamos el ID a número si tu BD usa números, si no, quita el Number()
            const servicioId = Number(id); 
    
            if (esFavorito) {
                // --- LÓGICA ELIMINAR ---
                const favs = await obtenerFavoritos();
                // Buscamos el registro específico del favorito para obtener SU id (no el del servicio)
                const fav = favs.find(f => f.tipo === 'servicio' && f.itemId == servicioId);
                
                if (fav) {
                    await eliminarFavorito(fav.id); // Eliminamos usando el ID de la relación
                    setEsFavorito(false);
                    message.success('Eliminado de favoritos');
                } else {
                    console.warn('No se encontró el registro de favorito para eliminar');
                }
            } else {
                // --- LÓGICA AGREGAR ---
                await agregarFavorito('servicio', servicioId);
                setEsFavorito(true);
                message.success('Agregado a favoritos');
            }
        } catch (error) {
            console.error('Error al manejar favorito:', error);
            message.error('Hubo un error al actualizar favoritos');
        }
    };

    const compartir = () => {
        if (navigator.share) {
            navigator.share({
                title: servicio.nombre,
                text: servicio.descripcion,
                url: window.location.href
            });
        }
    };

    const abrirMapa = () => {
        try {
            // Intentamos parsear si viene como string JSON
            let lat, lng;
            
            // Verificamos si ya es objeto o es string
            if (typeof servicio.ubicacion === 'object' && servicio.ubicacion !== null) {
                lat = servicio.ubicacion.lat;
                lng = servicio.ubicacion.lng;
            } else {
                const ubicacionObj = JSON.parse(servicio.ubicacion || '{}');
                lat = ubicacionObj.lat;
                lng = ubicacionObj.lng;
            }

            if (lat && lng) {
                // URL correcta para trazar ruta en Google Maps
                window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                    '_blank'
                );
            } else {
                // Fallback: Si no hay coordenadas, buscamos por el nombre del servicio
                window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(servicio.nombre + ' Arroyo Seco Queretaro')}`,
                    '_blank'
                );
            }
        } catch (error) {
            console.error('Error al abrir mapa:', error);
            // Fallback final en caso de error de parseo
             window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(servicio.nombre)}`,
                '_blank'
            );
        }
    };

    const getCategoriaIcon = (categoria) => {
        const iconos = {
            'alojamiento': '🏨',
            'gastronomia': '🍽️',
            'tour': '🚶‍♂️'
        };
        return iconos[categoria] || '📍';
    };

    const getCategoriaColor = (categoria) => {
        const colores = {
            'alojamiento': 'blue',
            'gastronomia': 'orange',
            'tour': 'green'
        };
        return colores[categoria] || 'default';
    };

    if (loading) {
        return (
            <div className="detalle-container">
                <div className="loading-container">
                    <Spin size="large" />
                    <p>Cargando servicio...</p>
                </div>
            </div>
        );
    }

    if (error || !servicio) {
        return (
            <div className="detalle-container">
                <div className="error-container">
                    <p>{error || 'Servicio no encontrado'}</p>
                    <Button type="primary" onClick={() => navigate('/experiencia/servicios')}>
                        Volver a Servicios
                    </Button>
                </div>
            </div>
        );
    }

    const imagenes = servicio.fotos && servicio.fotos.length > 0 
        ? servicio.fotos 
        : servicio.imagen 
            ? [servicio.imagen]
            : ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e0e0e0' width='800' height='600'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='40' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E📍 Servicio%3C/text%3E%3C/svg%3E"];

    return (
        <div className="detalle-container">
            {/* Header Sticky */}
            <div className="detalle-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/experiencia/servicios')}
                    className="back-button"
                >
                    Volver
                </Button>
                <div className="header-actions">
                    <Button
                        type="text"
                        shape="circle"
                        icon={esFavorito ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                        onClick={toggleFavorito}
                        className="action-button"
                    />
                    <Button
                        type="text"
                        shape="circle"
                        icon={<ShareAltOutlined />}
                        onClick={compartir}
                        className="action-button"
                    />
                </div>
            </div>

            {/* Carrusel Hero */}
            <div className="detalle-carousel">
                <Carousel autoplay>
                    {imagenes.map((img, index) => (
                        <div key={index} className="carousel-item">
                            <img src={img} alt={`${servicio.nombre} - ${index + 1}`} />
                            <div className="carousel-overlay"></div>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Contenido - Tarjeta Flotante */}
            <div className="detalle-content">
                <div className="detalle-info centered-card">
                    
                    {/* Header Centrado */}
                    <div className="card-header">
                        <h1 className="detalle-titulo center-text">{servicio.nombre}</h1>
                        
                        <div className="tags-container center-tags">
                            {servicio.categoria && (
                                <Tag color={getCategoriaColor(servicio.categoria)} className="categoria-tag">
                                    {getCategoriaIcon(servicio.categoria)} {servicio.categoria.toUpperCase()}
                                </Tag>
                            )}
                            {servicio.calificacion && (
                                <div className="rating-container">
                                    <Rate disabled defaultValue={servicio.calificacion} style={{fontSize: 14}} />
                                    <span className="rating-text">({servicio.calificacion})</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="detalle-descripcion center-text">
                        {servicio.descripcion}
                    </p>

                    <Divider style={{ margin: '12px 0 24px 0' }} />

                    {/* Grid de Info Limpio */}
                    <div className="info-grid-clean">
                        {servicio.horario && (
                            <div className="info-box-clean">
                                <ClockCircleOutlined className="icon-green" />
                                <span className="info-label-clean">Horario</span>
                                <span className="info-value-clean">{servicio.horario}</span>
                            </div>
                        )}
                        {servicio.telefono && (
                            <div className="info-box-clean clickable" onClick={() => window.open(`tel:${servicio.telefono}`)}>
                                <PhoneOutlined className="icon-green" />
                                <span className="info-label-clean">Teléfono</span>
                                <span className="info-value-clean">{servicio.telefono}</span>
                            </div>
                        )}
                        {servicio.precio && (
                            <div className="info-box-clean">
                                <DollarOutlined className="icon-green" />
                                <span className="info-label-clean">Precio</span>
                                <span className="info-value-clean">
                                    {typeof servicio.precio === 'string' ? servicio.precio : `$${servicio.precio}`}
                                </span>
                            </div>
                        )}
                        {servicio.email && (
                            <div className="info-box-clean clickable" onClick={() => window.open(`mailto:${servicio.email}`)}>
                                <MailOutlined className="icon-green" />
                                <span className="info-label-clean">Email</span>
                                <span className="info-value-clean">{servicio.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Botones de Acción Modernos */}
                    <div className="action-buttons-vertical">
                        {/* Botón Principal: Reservar */}
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<CalendarOutlined />} 
                            className="btn-reservar-full"
                            block
                            onClick={() => setModalAbierto(true)}
                        >
                            Reservar Ahora
                        </Button>

                        {/* Botones Secundarios */}
                        <div className="secondary-actions-row">
                            <Button 
                                className="btn-outline-green" 
                                icon={<EnvironmentOutlined />} 
                                block
                                onClick={abrirMapa}
                            >
                                Cómo Llegar
                            </Button>
                            
                            {servicio.sitioWeb && (
                                <Button 
                                    className="btn-outline-green" 
                                    icon={<GlobalOutlined />} 
                                    block
                                    onClick={() => window.open(servicio.sitioWeb, '_blank')}
                                >
                                    Sitio Web
                                </Button>
                            )}
                        </div>

                        {/* Botón Llamar si no hay sitio web */}
                        {!servicio.sitioWeb && servicio.telefono && (
                            <Button 
                                className="btn-outline-green" 
                                icon={<PhoneOutlined />} 
                                block
                                onClick={() => window.open(`tel:${servicio.telefono}`)}
                            >
                                Llamar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Secciones Extras */}
                {servicio.serviciosOfrecidos && servicio.serviciosOfrecidos.length > 0 && (
                    <div className="seccion-extra">
                        <h3 className="section-title center-text">Servicios Ofrecidos</h3>
                        <div className="amenidades-tags center-tags">
                            {servicio.serviciosOfrecidos.map((item, i) => (
                                <Tag key={i} color="green">{item}</Tag>
                            ))}
                        </div>
                    </div>
                )}

                {servicio.amenidades && servicio.amenidades.length > 0 && (
                    <div className="seccion-extra">
                        <h3 className="section-title center-text">Amenidades</h3>
                        <div className="amenidades-tags center-tags">
                            {servicio.amenidades.map((item, i) => (
                                <Tag key={i} color="cyan">{item}</Tag>
                            ))}
                        </div>
                    </div>
                )}

                {servicio.politicas && (
                    <div className="seccion-extra">
                        <h3 className="section-title center-text">Políticas</h3>
                        <p className="section-text center-text">{servicio.politicas}</p>
                    </div>
                )}

                {/* RENDERIZAR EL MODAL */}
            {modalAbierto && (
                <ReservaModal 
                    servicio={{
                        ...servicio,
                        tipo: 'servicio'
                    }}
                    onClose={() => setModalAbierto(false)}
                    onSuccess={handleReservaExitosa}
                />
            )}
            </div>
        </div>
    );
};

export default DetalleServicio;