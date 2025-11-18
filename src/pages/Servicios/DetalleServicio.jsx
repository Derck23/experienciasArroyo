import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Spin, Carousel, Rate } from 'antd';
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
    MailOutlined
} from '@ant-design/icons';
import { obtenerServicios } from '../../service/servicioService';
import './DetalleServicio.css';

const DetalleServicio = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [esFavorito, setEsFavorito] = useState(false);

    useEffect(() => {
        cargarServicio();
    }, [id]);

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

    const toggleFavorito = () => {
        setEsFavorito(!esFavorito);
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
            const ubicacion = JSON.parse(servicio.ubicacion || '{}');
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
            {/* Header con botón de regreso */}
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
                            <img src={img} alt={`${servicio.nombre} - ${index + 1}`} />
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Contenido principal */}
            <div className="detalle-content">
                <div className="detalle-info">
                    <h1 className="detalle-titulo">{servicio.nombre}</h1>
                    
                    <div className="tags-container">
                        {servicio.categoria && (
                            <Tag color={getCategoriaColor(servicio.categoria)} className="categoria-tag">
                                {getCategoriaIcon(servicio.categoria)} {servicio.categoria}
                            </Tag>
                        )}
                        {servicio.calificacion && (
                            <div className="rating-container">
                                <Rate disabled defaultValue={servicio.calificacion} />
                                <span className="rating-text">({servicio.calificacion})</span>
                            </div>
                        )}
                    </div>

                    <p className="detalle-descripcion">{servicio.descripcion}</p>

                    {/* Información del servicio */}
                    <div className="info-grid">
                        {servicio.horario && (
                            <div className="info-item">
                                <div className="info-icon">
                                    <ClockCircleOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Horario</span>
                                    <span className="info-value">{servicio.horario}</span>
                                </div>
                            </div>
                        )}

                        {servicio.precio && (
                            <div className="info-item">
                                <div className="info-icon">
                                    <DollarOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Precio</span>
                                    <span className="info-value">
                                        {typeof servicio.precio === 'string' 
                                            ? servicio.precio 
                                            : `$${servicio.precio} MXN`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {servicio.telefono && (
                            <div className="info-item clickable" onClick={() => window.open(`tel:${servicio.telefono}`)}>
                                <div className="info-icon">
                                    <PhoneOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Teléfono</span>
                                    <span className="info-value">{servicio.telefono}</span>
                                </div>
                            </div>
                        )}

                        {servicio.email && (
                            <div className="info-item clickable" onClick={() => window.open(`mailto:${servicio.email}`)}>
                                <div className="info-icon">
                                    <MailOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{servicio.email}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sitio web */}
                    {servicio.sitioWeb && (
                        <div className="website-section">
                            <Button
                                type="default"
                                icon={<GlobalOutlined />}
                                onClick={() => window.open(servicio.sitioWeb, '_blank')}
                                block
                            >
                                Visitar Sitio Web
                            </Button>
                        </div>
                    )}

                    {/* Servicios ofrecidos */}
                    {servicio.serviciosOfrecidos && servicio.serviciosOfrecidos.length > 0 && (
                        <div className="servicios-section">
                            <h3 className="section-title">Servicios Ofrecidos</h3>
                            <div className="servicios-tags">
                                {servicio.serviciosOfrecidos.map((item, index) => (
                                    <Tag key={index} color="green">{item}</Tag>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Amenidades */}
                    {servicio.amenidades && servicio.amenidades.length > 0 && (
                        <div className="amenidades-section">
                            <h3 className="section-title">Amenidades</h3>
                            <div className="amenidades-tags">
                                {servicio.amenidades.map((item, index) => (
                                    <Tag key={index} color="blue">{item}</Tag>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Políticas */}
                    {servicio.politicas && (
                        <div className="politicas-section">
                            <h3 className="section-title">Políticas</h3>
                            <p className="section-text">{servicio.politicas}</p>
                        </div>
                    )}

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
                        {servicio.telefono && (
                            <Button
                                type="default"
                                size="large"
                                block
                                className="btn-secundario"
                                icon={<PhoneOutlined />}
                                onClick={() => window.open(`tel:${servicio.telefono}`)}
                            >
                                Llamar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleServicio;
