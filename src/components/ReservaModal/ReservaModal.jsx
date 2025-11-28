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
    // Si es un evento, usar la fecha y hora del evento
    const esEvento = servicio.tipo === 'evento';
    const fechaInicialEvento = esEvento && servicio.fechaEvento ? servicio.fechaEvento.split('T')[0] : '';
    
    // Formatear la hora del evento si existe (puede venir como "14:30" o "14:30:00")
    const formatearHora = (hora) => {
        if (!hora) return '';
        // Si viene en formato "HH:MM" o "HH:MM:SS", tomar solo HH:MM
        const partes = hora.split(':');
        return partes.length >= 2 ? `${partes[0]}:${partes[1]}` : hora;
    };
    
    const horaInicialEvento = esEvento && servicio.horaEvento ? formatearHora(servicio.horaEvento) : '';

    const [formData, setFormData] = useState({
        fechaReserva: fechaInicialEvento,
        horaReserva: horaInicialEvento,
        numeroPersonas: 1,
        comentarios: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtener fecha mínima (hoy)
    const getFechaMinima = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];
    };

    // Validar que la fecha y hora no sean del pasado
    const validarFechaHora = (fecha, hora) => {
        if (!fecha || !hora) return false;

        const fechaHoraReserva = new Date(`${fecha}T${hora}`);
        const ahora = new Date();
        
        // Agregar un margen de al menos 1 hora desde ahora
        const minimaFechaHora = new Date(ahora.getTime() + 60 * 60 * 1000);
        
        return fechaHoraReserva >= minimaFechaHora;
    };

    // Validar horario de negocio (8:00 AM - 10:00 PM)
    const validarHorarioNegocio = (hora) => {
        if (!hora) return false;
        
        const [horas, minutos] = hora.split(':').map(Number);
        const horaEnMinutos = horas * 60 + minutos;
        
        // Horario de 8:00 AM (480 min) a 10:00 PM (1320 min)
        return horaEnMinutos >= 480 && horaEnMinutos <= 1320;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si es un evento, no permitir cambiar fecha ni hora
        if (esEvento && (name === 'fechaReserva' || name === 'horaReserva')) {
            return;
        }
        
        // Validación especial para número de personas
        if (name === 'numeroPersonas') {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 1 && num <= 20) {
                setFormData({ ...formData, [name]: num });
            }
            return;
        }

        setFormData({ ...formData, [name]: value });
        
        // Limpiar error cuando el usuario empiece a corregir
        if (error) setError(null);
    };

    const validarFormulario = () => {
        const { fechaReserva, horaReserva, numeroPersonas } = formData;

        // Validar que todos los campos requeridos estén llenos
        if (!fechaReserva || !horaReserva || !numeroPersonas) {
            setError('Todos los campos son obligatorios');
            return false;
        }

        // Validar número de personas
        if (numeroPersonas < 1 || numeroPersonas > 20) {
            setError('El número de personas debe ser entre 1 y 20');
            return false;
        }

        // Para eventos, no validar horario de negocio (pueden ser a cualquier hora)
        if (!esEvento) {
            // Validar horario de negocio solo para servicios y atracciones
            if (!validarHorarioNegocio(horaReserva)) {
                setError('El horario de atención es de 8:00 AM a 10:00 PM');
                return false;
            }
        }

        // Validar que la fecha y hora no sean del pasado
        if (!validarFechaHora(fechaReserva, horaReserva)) {
            setError('La reservación debe ser al menos 1 hora desde ahora');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validar formulario
        if (!validarFormulario()) {
            setLoading(false);
            return;
        }

        try {
            // Sanitizar y preparar datos
            const datosReserva = {
                servicioId: parseInt(servicio.id),
                nombreServicio: servicio.nombre.trim(),
                tipoServicio: servicio.tipo || 'servicio', // Puede ser: 'servicio', 'atraccion', 'evento'
                fechaReserva: formData.fechaReserva,
                horaReserva: formData.horaReserva,
                numeroPersonas: parseInt(formData.numeroPersonas),
                comentarios: formData.comentarios.trim().substring(0, 500) // Limitar a 500 caracteres
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

    if (!servicio) return null;

    // Obtener el tipo de reservación para mostrar texto apropiado
    const getTipoTexto = () => {
        switch(servicio.tipo) {
            case 'atraccion':
                return 'Atracción';
            case 'evento':
                return 'Evento';
            default:
                return 'Servicio';
        }
    };

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
                            <small style={{ color: '#888', fontSize: '13px' }}>
                                {getTipoTexto()}
                            </small>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} type="button">
                        <CloseOutlined />
                    </button>
                </div>

                {/* Mensaje informativo para eventos */}
                {esEvento && (
                    <div style={{ 
                        padding: '12px 16px', 
                        backgroundColor: '#e6f7ff', 
                        border: '1px solid #91d5ff',
                        borderRadius: '8px',
                        margin: '16px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <CalendarOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                        <span style={{ color: '#0050b3', fontSize: '14px' }}>
                            Este evento tiene fecha y hora específicas que no se pueden modificar
                        </span>
                    </div>
                )}

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
                            {esEvento ? 'Fecha del Evento' : 'Fecha de Reservación'}
                        </label>
                        <input 
                            type="date" 
                            name="fechaReserva"
                            className="form-input"
                            min={getFechaMinima()}
                            required 
                            onChange={handleChange}
                            value={formData.fechaReserva}
                            disabled={loading || esEvento}
                            readOnly={esEvento}
                            style={esEvento ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            {esEvento ? 'Fecha fija del evento' : 'Selecciona una fecha a partir de hoy'}
                        </small>
                    </div>

                    {/* Hora */}
                    <div className="form-group">
                        <label className="form-label">
                            <ClockCircleOutlined className="label-icon" />
                            {esEvento ? 'Hora del Evento' : 'Hora (8:00 AM - 10:00 PM)'}
                        </label>
                        <input 
                            type="time" 
                            name="horaReserva"
                            className="form-input"
                            min={esEvento ? undefined : "08:00"}
                            max={esEvento ? undefined : "22:00"}
                            required 
                            onChange={handleChange}
                            value={formData.horaReserva}
                            disabled={loading || esEvento}
                            readOnly={esEvento}
                            style={esEvento ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            {esEvento ? 'Hora fija del evento' : 'La reservación debe ser al menos 1 hora desde ahora'}
                        </small>
                    </div>

                    {/* Número de Personas */}
                    <div className="form-group">
                        <label className="form-label">
                            <TeamOutlined className="label-icon" />
                            Número de Personas (1-20)
                        </label>
                        <div className="personas-selector">
                            <button
                                type="button"
                                className="personas-btn"
                                onClick={() => setFormData({
                                    ...formData,
                                    numeroPersonas: Math.max(1, formData.numeroPersonas - 1)
                                })}
                                disabled={formData.numeroPersonas <= 1 || loading}
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
                            />
                            <button
                                type="button"
                                className="personas-btn"
                                onClick={() => setFormData({
                                    ...formData,
                                    numeroPersonas: Math.min(20, formData.numeroPersonas + 1)
                                })}
                                disabled={formData.numeroPersonas >= 20 || loading}
                            >
                                +
                            </button>
                        </div>
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            Mínimo 1 persona, máximo 20 personas
                        </small>
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
                            disabled={loading}
                        ></textarea>
                        <span className="textarea-counter" style={{ color: formData.comentarios.length > 450 ? '#ff4d4f' : '#999' }}>
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