import React, { useState, useEffect } from 'react';
import { obtenerMisReservaciones, cancelarReservacion } from '../../service/reservacionService';
import { message, Button, Spin, Empty, Modal } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    MessageOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import './MisReservaciones.css';

const MisReservaciones = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelando, setCancelando] = useState(null);

    const cargarReservas = async () => {
        try {
            setLoading(true);
            const data = await obtenerMisReservaciones();
            setReservas(data || []);
        } catch (error) {
            console.error(error);
            message.error('No se pudieron cargar tus reservaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarReservas();
    }, []);

    const handleCancelar = (reserva) => {
        Modal.confirm({
            title: '¿Cancelar esta reservación?',
            icon: <ExclamationCircleOutlined />,
            content: `¿Estás seguro de cancelar tu reserva en ${reserva.nombreServicio}?`,
            okText: 'Sí, cancelar',
            cancelText: 'No',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    setCancelando(reserva.id);
                    await cancelarReservacion(reserva.id);
                    message.success('Reservación cancelada exitosamente');
                    cargarReservas();
                } catch (error) {
                    message.error(error.message || 'Error al cancelar');
                } finally {
                    setCancelando(null);
                }
            }
        });
    };

    const getStatusConfig = (estado) => {
        const configs = {
            confirmada: {
                color: 'success',
                icon: <CheckCircleOutlined />,
                text: 'CONFIRMADA',
                className: 'status-confirmada'
            },
            cancelada: {
                color: 'error',
                icon: <CloseCircleOutlined />,
                text: 'CANCELADA',
                className: 'status-cancelada'
            },
            pendiente: {
                color: 'warning',
                icon: <ClockCircleOutlined />,
                text: 'PENDIENTE',
                className: 'status-pendiente'
            }
        };
        return configs[estado] || configs.pendiente;
    };

    const formatearFecha = (fecha) => {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-MX', opciones);
    };

    if (loading) {
        return (
            <div className="reservaciones-container">
                <div className="loading-state">
                    <Spin size="large" />
                    <p className="loading-text">Cargando tus reservaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reservaciones-container">
            {/* Header */}
            <div className="reservaciones-header">
                <div className="header-content">
                    <CalendarOutlined className="header-icon" />
                    <div>
                        <h1 className="page-title">Mis Reservaciones</h1>
                        <p className="page-subtitle">
                            {reservas.length > 0 
                                ? `Tienes ${reservas.length} reservación${reservas.length !== 1 ? 'es' : ''}`
                                : 'Aún no tienes reservaciones'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de Reservaciones */}
            <div className="reservaciones-content">
                {reservas.length === 0 ? (
                    <div className="empty-state">
                        <Empty 
                            description={
                                <div className="empty-description">
                                    <h3>No tienes reservaciones</h3>
                                    <p>Cuando hagas una reservación, aparecerá aquí</p>
                                </div>
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                ) : (
                    <div className="reservaciones-grid">
                        {reservas.map((reserva, index) => {
                            const statusConfig = getStatusConfig(reserva.estado);
                            
                            return (
                                <div 
                                    key={reserva.id} 
                                    className="reserva-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Header de la tarjeta */}
                                    <div className="card-header-reserva">
                                        <div className="servicio-info">
                                            <h3 className="servicio-nombre">{reserva.nombreServicio}</h3>
                                            <div className={`status-badge ${statusConfig.className}`}>
                                                {statusConfig.icon}
                                                <span>{statusConfig.text}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles de la reserva */}
                                    <div className="card-body">
                                        <div className="detalle-item">
                                            <div className="detalle-icon">
                                                <CalendarOutlined />
                                            </div>
                                            <div className="detalle-text">
                                                <span className="detalle-label">Fecha</span>
                                                <span className="detalle-valor">
                                                    {formatearFecha(reserva.fechaReserva)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="detalle-item">
                                            <div className="detalle-icon">
                                                <ClockCircleOutlined />
                                            </div>
                                            <div className="detalle-text">
                                                <span className="detalle-label">Hora</span>
                                                <span className="detalle-valor">{reserva.horaReserva}</span>
                                            </div>
                                        </div>

                                        <div className="detalle-item">
                                            <div className="detalle-icon">
                                                <TeamOutlined />
                                            </div>
                                            <div className="detalle-text">
                                                <span className="detalle-label">Personas</span>
                                                <span className="detalle-valor">
                                                    {reserva.numeroPersonas} {reserva.numeroPersonas === 1 ? 'persona' : 'personas'}
                                                </span>
                                            </div>
                                        </div>

                                        {reserva.comentarios && (
                                            <div className="detalle-item comentarios">
                                                <div className="detalle-icon">
                                                    <MessageOutlined />
                                                </div>
                                                <div className="detalle-text">
                                                    <span className="detalle-label">Comentarios</span>
                                                    <span className="detalle-valor">{reserva.comentarios}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer - Acciones */}
                                    {reserva.estado === 'pendiente' && (
                                        <div className="card-footer">
                                            <Button 
                                                danger 
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleCancelar(reserva)}
                                                loading={cancelando === reserva.id}
                                                block
                                                className="btn-cancelar"
                                            >
                                                {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar Reservación'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisReservaciones;