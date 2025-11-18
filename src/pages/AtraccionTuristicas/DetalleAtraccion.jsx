import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Spin, Carousel } from 'antd';
import {
    ArrowLeftOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    StarOutlined
} from '@ant-design/icons';
import { obtenerAtracciones } from '../../service/atraccionService';
import './DetalleAtraccion.css';

const DetalleAtraccion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [atraccion, setAtraccion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [esFavorito, setEsFavorito] = useState(false);

    useEffect(() => {
        cargarAtraccion();
    }, [id]);

    const cargarAtraccion = async () => {
        try {
            setLoading(true);
            const data = await obtenerAtracciones();
            console.log('DetalleAtraccion - ID de URL:', id, 'tipo:', typeof id);
            console.log('DetalleAtraccion - Atracciones obtenidas:', data.length);
            console.log('DetalleAtraccion - IDs disponibles:', data.map(a => ({id: a.id, tipo: typeof a.id})));
            
            const atraccionEncontrada = data.find(a => String(a.id) === String(id));
            console.log('DetalleAtraccion - Atracción encontrada:', atraccionEncontrada);
            
            if (atraccionEncontrada) {
                setAtraccion(atraccionEncontrada);
            } else {
                setError('Atracción no encontrada');
            }
        } catch (err) {
            console.error('Error al cargar atracción:', err);
            setError('No se pudo cargar la atracción');
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
                title: atraccion.nombre,
                text: atraccion.descripcion,
                url: window.location.href
            });
        }
    };

    const abrirMapa = () => {
        try {
            const ubicacion = JSON.parse(atraccion.ubicacion || '{}');
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

    const getDificultadColor = (dificultad) => {
        const colores = {
            'Fácil': 'green',
            'Moderada': 'orange',
            'Difícil': 'red',
            'Muy difícil': 'volcano'
        };
        return colores[dificultad] || 'default';
    };

    if (loading) {
        return (
            <div className="detalle-container">
                <div className="loading-container">
                    <Spin size="large" />
                    <p>Cargando atracción...</p>
                </div>
            </div>
        );
    }

    if (error || !atraccion) {
        return (
            <div className="detalle-container">
                <div className="error-container">
                    <p>{error || 'Atracción no encontrada'}</p>
                    <Button type="primary" onClick={() => navigate('/experiencia/atracciones')}>
                        Volver a Atracciones
                    </Button>
                </div>
            </div>
        );
    }

    const imagenes = atraccion.fotos && atraccion.fotos.length > 0 
        ? atraccion.fotos 
        : ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e0e0e0' width='800' height='600'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='40' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🏞️ Atracción%3C/text%3E%3C/svg%3E"];

    return (
        <div className="detalle-container">
            {/* Header con botón de regreso */}
            <div className="detalle-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/experiencia/atracciones')}
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
                            <img src={img} alt={`${atraccion.nombre} - ${index + 1}`} />
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Contenido principal */}
            <div className="detalle-content">
                <div className="detalle-info">
                    <h1 className="detalle-titulo">{atraccion.nombre}</h1>
                    
                    <div className="tags-container">
                        {atraccion.categoria && (
                            <Tag color="green" className="categoria-tag">
                                {atraccion.categoria}
                            </Tag>
                        )}
                        {atraccion.nivelDificultad && (
                            <Tag color={getDificultadColor(atraccion.nivelDificultad)} className="categoria-tag">
                                {atraccion.nivelDificultad}
                            </Tag>
                        )}
                    </div>

                    <p className="detalle-descripcion">{atraccion.descripcion}</p>

                    {/* Información de la atracción */}
                    <div className="info-grid">
                        {atraccion.horarioApertura && (
                            <div className="info-item">
                                <div className="info-icon">
                                    <ClockCircleOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Horario</span>
                                    <span className="info-value">{atraccion.horarioApertura}</span>
                                </div>
                            </div>
                        )}

                        {atraccion.costoEntrada && (
                            <div className="info-item">
                                <div className="info-icon">
                                    <DollarOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Costo de entrada</span>
                                    <span className="info-value">
                                        {atraccion.costoEntrada === 'Gratuito' || atraccion.costoEntrada === '0' 
                                            ? 'Gratuito' 
                                            : `$${atraccion.costoEntrada} MXN`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {atraccion.distancia && (
                            <div className="info-item">
                                <div className="info-icon">
                                    <EnvironmentOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Distancia</span>
                                    <span className="info-value">{atraccion.distancia}</span>
                                </div>
                            </div>
                        )}

                        {atraccion.duracionEstimada && (
                            <div className="info-item">
                                <div className="info-icon">
                                    <ClockCircleOutlined />
                                </div>
                                <div className="info-text">
                                    <span className="info-label">Duración estimada</span>
                                    <span className="info-value">{atraccion.duracionEstimada}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recomendaciones */}
                    {atraccion.recomendaciones && (
                        <div className="recomendaciones-section">
                            <h3 className="section-title">Recomendaciones</h3>
                            <p className="section-text">{atraccion.recomendaciones}</p>
                        </div>
                    )}

                    {/* Accesibilidad */}
                    {atraccion.accesibilidad && (
                        <div className="accesibilidad-section">
                            <h3 className="section-title">Accesibilidad</h3>
                            <p className="section-text">{atraccion.accesibilidad}</p>
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
                        <Button
                            type="default"
                            size="large"
                            block
                            className="btn-secundario"
                            icon={<StarOutlined />}
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleAtraccion;
