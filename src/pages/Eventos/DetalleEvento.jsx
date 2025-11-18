import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Spin, Carousel } from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    UserOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined
} from '@ant-design/icons';
import { obtenerEventos } from '../../service/eventoService';
import './DetalleEvento.css';

const DetalleEvento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [esFavorito, setEsFavorito] = useState(false);

    useEffect(() => {
        cargarEvento();
    }, [id]);

    const cargarEvento = async () => {
        try {
            setLoading(true);
            const data = await obtenerEventos();
            console.log('DetalleEvento - ID de URL:', id, 'tipo:', typeof id);
            console.log('DetalleEvento - Eventos obtenidos:', data.length);
            console.log('DetalleEvento - IDs disponibles:', data.map(e => ({id: e.id, tipo: typeof e.id})));
            
            const eventoEncontrado = data.find(e => String(e.id) === String(id));
            console.log('DetalleEvento - Evento encontrado:', eventoEncontrado);
            
            if (eventoEncontrado) {
                setEvento(eventoEncontrado);
            } else {
                setError('Evento no encontrado');
            }
        } catch (err) {
            console.error('Error al cargar evento:', err);
            setError('No se pudo cargar el evento');
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        const [year, month, day] = fecha.split('T')[0].split('-');
        const date = new Date(year, month - 1, day);
        const opciones = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('es-MX', opciones);
    };

    const formatearPrecio = (precio) => {
        if (!precio || precio === 0 || precio === '0') {
            return 'Entrada Gratuita';
        }
        return `$${parseFloat(precio).toLocaleString('es-MX')} MXN`;
    };

    const toggleFavorito = () => {
        setEsFavorito(!esFavorito);
    };

    const compartir = () => {
        if (navigator.share) {
            navigator.share({
                title: evento.nombre,
                text: evento.descripcion,
                url: window.location.href
            });
        }
    };

    const abrirMapa = () => {
        try {
            const ubicacion = JSON.parse(evento.ubicacion || '{}');
            if (ubicacion.lat && ubicacion.lng) {
                window.open(
                    `https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}`,
                    '_blank'
                );
            }
        } catch (error) {
            console.error('Error al abrir mapa:', error);
        }
    };

    if (loading) {
        return (
            <div className="detalle-container">
                <div className="loading-container">
                    <Spin size="large" />
                    <p>Cargando evento...</p>
                </div>
            </div>
        );
    }

    if (error || !evento) {
        return (
            <div className="detalle-container">
                <div className="error-container">
                    <p>{error || 'Evento no encontrado'}</p>
                    <Button type="primary" onClick={() => navigate('/experiencia/eventos')}>
                        Volver a Eventos
                    </Button>
                </div>
            </div>
        );
    }

    const imagenes = evento.fotos && evento.fotos.length > 0 
        ? evento.fotos 
        : evento.imagen 
            ? [evento.imagen] 
            : ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e0e0e0' width='800' height='600'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='40' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🎉 Evento%3C/text%3E%3C/svg%3E"];

    return (
        <div className="detalle-container">
            {/* Header con botón de regreso */}
            <div className="detalle-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/experiencia/eventos')}
                    className="back-button"
                >
                    Volver
                </Button>
                <div className="header-actions">
                    <Button
                        type="text"
                        icon={esFavorito ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                        onClick={toggleFavorito}
                        className="action-button"
                    />
                    <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        onClick={compartir}
                        className="action-button"
                    />
                </div>
            </div>

            {/* Carrusel de imágenes */}
            <div className="detalle-carousel">
                <Carousel autoplay>
                    {imagenes.map((img, index) => (
                        <div key={index} className="carousel-item">
                            <img src={img} alt={`${evento.nombre} - ${index + 1}`} />
                        </div>
                    ))}
                </Carousel>
                {evento.destacado && (
                    <Tag color="red" className="destacado-badge">
                        ¡Últimos lugares!
                    </Tag>
                )}
            </div>

            {/* Contenido principal */}
            <div className="detalle-content">
                <div className="detalle-info">
                    <h1 className="detalle-titulo">{evento.nombre}</h1>
                    
                    {evento.categoria && (
                        <Tag color="green" className="categoria-tag">
                            {evento.categoria}
                        </Tag>
                    )}

                    <p className="detalle-descripcion">{evento.descripcion}</p>

                    {/* Información del evento */}
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-icon">
                                <CalendarOutlined />
                            </div>
                            <div className="info-text">
                                <span className="info-label">Fecha</span>
                                <span className="info-value">{formatearFecha(evento.fecha)}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <ClockCircleOutlined />
                            </div>
                            <div className="info-text">
                                <span className="info-label">Hora</span>
                                <span className="info-value">{evento.hora || '00:00'}h</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <EnvironmentOutlined />
                            </div>
                            <div className="info-text">
                                <span className="info-label">Ubicación</span>
                                <span className="info-value">
                                    {(() => {
                                        try {
                                            const ubicacionParsed = JSON.parse(evento.ubicacion || '{}');
                                            if (ubicacionParsed.lat && ubicacionParsed.lng) {
                                                return 'Arroyo Seco, Querétaro';
                                            }
                                            return evento.ubicacion || 'Por confirmar';
                                        } catch {
                                            return evento.ubicacion || 'Por confirmar';
                                        }
                                    })()}
                                </span>
                            </div>
                        </div>

                        {evento.asistentes && (
                            <div className="info-item">
                                <div className="info-icon">
                                    <UserOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Asistentes esperados</span>
                                    <span className="info-value">{evento.asistentes} personas</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Precio */}
                    <div className="precio-section">
                        <span className="precio-label">Precio</span>
                        <span className="precio-valor">{formatearPrecio(evento.precio)}</span>
                    </div>

                    {/* Botones de acción */}
                    <div className="action-buttons">
                        <Button
                            type="primary"
                            size="large"
                            icon={<EnvironmentOutlined />}
                            onClick={abrirMapa}
                            block
                            className="btn-principal"
                        >
                            Cómo Llegar
                        </Button>
                        <Button
                            type="default"
                            size="large"
                            block
                            className="btn-secundario"
                        >
                            Comprar Boletos
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleEvento;
