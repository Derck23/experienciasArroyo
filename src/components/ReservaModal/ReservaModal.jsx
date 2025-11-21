import React, { useState } from 'react';
import { crearReservacion } from '../../service/reservacionService';
import { createPortal } from 'react-dom';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    MessageOutlined,
    CloseOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import './ReservaModal.css';

const ReservaModal = ({ servicio, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        fechaReserva: '',
        horaReserva: '',
        numeroPersonas: 1,
        comentarios: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const datosReserva = {
                servicioId: servicio.id,
                nombreServicio: servicio.nombre,
                ...formData
            };

            await crearReservacion(datosReserva);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al crear la reservación');
        } finally {
            setLoading(false);
        }
    };

    // Obtener fecha mínima (hoy)
    const getFechaMinima = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];
    };

    if (!servicio) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header del Modal */}
                <div className="modal-header">
                    <div className="modal-header-content">
                        <CalendarOutlined className="modal-header-icon" />
                        <div>
                            <h2 className="modal-title">Hacer Reservación</h2>
                            <p className="modal-subtitle">{servicio.nombre}</p>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} type="button">
                        <CloseOutlined />
                    </button>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="error-msg">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Fecha */}
                    <div className="form-group">
                        <label className="form-label">
                            <CalendarOutlined className="label-icon" />
                            Fecha de Reservación
                        </label>
                        <input 
                            type="date" 
                            name="fechaReserva"
                            className="form-input"
                            min={getFechaMinima()}
                            required 
                            onChange={handleChange}
                            value={formData.fechaReserva}
                        />
                    </div>

                    {/* Hora */}
                    <div className="form-group">
                        <label className="form-label">
                            <ClockCircleOutlined className="label-icon" />
                            Hora
                        </label>
                        <input 
                            type="time" 
                            name="horaReserva"
                            className="form-input"
                            required 
                            onChange={handleChange}
                            value={formData.horaReserva}
                        />
                    </div>

                    {/* Número de Personas */}
                    <div className="form-group">
                        <label className="form-label">
                            <TeamOutlined className="label-icon" />
                            Número de Personas
                        </label>
                        <div className="personas-selector">
                            <button
                                type="button"
                                className="personas-btn"
                                onClick={() => setFormData({
                                    ...formData,
                                    numeroPersonas: Math.max(1, formData.numeroPersonas - 1)
                                })}
                                disabled={formData.numeroPersonas <= 1}
                            >
                                -
                            </button>
                            <input 
                                type="number" 
                                name="numeroPersonas"
                                className="form-input personas-input"
                                min="1"
                                max="20"
                                value={formData.numeroPersonas} 
                                required 
                                onChange={handleChange}
                                readOnly
                            />
                            <button
                                type="button"
                                className="personas-btn"
                                onClick={() => setFormData({
                                    ...formData,
                                    numeroPersonas: Math.min(20, formData.numeroPersonas + 1)
                                })}
                                disabled={formData.numeroPersonas >= 20}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Comentarios */}
                    <div className="form-group">
                        <label className="form-label">
                            <MessageOutlined className="label-icon" />
                            Comentarios Adicionales
                            <span className="label-optional">(opcional)</span>
                        </label>
                        <textarea 
                            name="comentarios"
                            className="form-textarea"
                            rows="4"
                            placeholder="Alergias, peticiones especiales, preferencias de mesa..."
                            onChange={handleChange}
                            value={formData.comentarios}
                            maxLength={500}
                        ></textarea>
                        <span className="textarea-counter">
                            {formData.comentarios.length}/500
                        </span>
                    </div>

                    {/* Botones de Acción */}
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose} 
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn-confirm" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Reservando...
                                </>
                            ) : (
                                <>
                                    <CheckCircleOutlined />
                                    Confirmar Reserva
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ReservaModal;