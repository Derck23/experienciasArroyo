import React, { useState } from 'react';
import { crearReservacion } from '../../service/reservacionService';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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
    const [mensajeExito, setMensajeExito] = useState(false);

    // Obtener fecha mínima (hoy)
    const getFechaMinima = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];
    };

    // Validar que la fecha y hora no sean del pasado
    const validarFechaHora = (fecha, hora) => {
        if (!fecha || !hora) return false;

        // Construir fecha en hora local (no UTC)
        const [year, month, day] = fecha.split('-').map(Number);
        const [hours, minutes] = hora.split(':').map(Number);
        const fechaHoraReserva = new Date(year, month - 1, day, hours, minutes, 0);

        const ahora = new Date();

        // Agregar un margen de al menos 30 minutos desde ahora
        const minimaFechaHora = new Date(ahora.getTime() + 30 * 60 * 1000);

        console.log('🕐 Validando fecha y hora:', {
            fechaInput: fecha,
            horaInput: hora,
            fechaHoraReserva: fechaHoraReserva.toLocaleString('es-MX'),
            ahora: ahora.toLocaleString('es-MX'),
            minimaFechaHora: minimaFechaHora.toLocaleString('es-MX'),
            diferenciaMinutos: Math.round((fechaHoraReserva - ahora) / (60 * 1000)),
            esValido: fechaHoraReserva >= minimaFechaHora
        });

        return fechaHoraReserva >= minimaFechaHora;
    };

    // Validar día laboral de la atracción
    const validarDiaLaboral = (fecha) => {
        if (!fecha || !servicio.diaInicio || !servicio.diaFin) return true; // Si no hay horarios definidos, permitir cualquier día

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        // Crear fecha en UTC para evitar problemas de zona horaria
        const [year, month, day] = fecha.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        const diaSemana = diasSemana[fechaObj.getDay()];

        console.log('Validando día laboral:', {
            fechaSeleccionada: fecha,
            diaSemana,
            diaInicio: servicio.diaInicio,
            diaFin: servicio.diaFin
        });

        const diasOrdenados = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const indiceInicio = diasOrdenados.indexOf(servicio.diaInicio);
        const indiceFin = diasOrdenados.indexOf(servicio.diaFin);
        const indiceDia = diasOrdenados.indexOf(diaSemana);

        console.log('Índices:', { indiceInicio, indiceFin, indiceDia });

        // Si el rango no cruza la semana (ej: Lunes a Viernes)
        if (indiceInicio <= indiceFin) {
            const resultado = indiceDia >= indiceInicio && indiceDia <= indiceFin;
            console.log('Validación (no cruza semana):', resultado);
            return resultado;
        } else {
            // Si el rango cruza la semana (ej: Viernes a Lunes)
            const resultado = indiceDia >= indiceInicio || indiceDia <= indiceFin;
            console.log('Validación (cruza semana):', resultado);
            return resultado;
        }
    };

    // Convertir hora en formato "hh:mm A" a minutos desde medianoche
    const convertirHoraAMinutos = (horaStr) => {
        if (!horaStr) return null;

        // Si viene en formato "hh:mm A" (12 horas)
        if (horaStr.includes('AM') || horaStr.includes('PM')) {
            const match = horaStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return null;

            let horas = parseInt(match[1]);
            const minutos = parseInt(match[2]);
            const periodo = match[3].toUpperCase();

            if (periodo === 'PM' && horas !== 12) horas += 12;
            if (periodo === 'AM' && horas === 12) horas = 0;

            return horas * 60 + minutos;
        }

        // Si viene en formato "HH:mm" (24 horas)
        const [horas, minutos] = horaStr.split(':').map(Number);
        return horas * 60 + minutos;
    };

    // Validar horario laboral de la atracción
    const validarHorarioLaboral = (hora) => {
        if (!hora) return false;

        console.log('Validando horario laboral:', {
            horaReserva: hora,
            horaInicio: servicio.horaInicio,
            horaFin: servicio.horaFin
        });

        // Si la atracción tiene horarios definidos, validar contra ellos
        if (servicio.horaInicio && servicio.horaFin) {
            const horaReservaMinutos = convertirHoraAMinutos(hora);
            const horaInicioMinutos = convertirHoraAMinutos(servicio.horaInicio);
            const horaFinMinutos = convertirHoraAMinutos(servicio.horaFin);

            console.log('Conversión a minutos:', {
                horaReservaMinutos,
                horaInicioMinutos,
                horaFinMinutos
            });

            if (horaReservaMinutos === null || horaInicioMinutos === null || horaFinMinutos === null) {
                console.log('Error al parsear horas, permitiendo por defecto');
                return true; // Si no se puede parsear, permitir
            }

            const resultado = horaReservaMinutos >= horaInicioMinutos && horaReservaMinutos <= horaFinMinutos;
            console.log('Validación horario:', resultado);
            return resultado;
        }

        // Si no hay horarios definidos, usar el horario general (8:00 AM - 10:00 PM)
        const [horas, minutos] = hora.split(':').map(Number);
        const horaEnMinutos = horas * 60 + minutos;

        console.log('Usando horario general:', { horaEnMinutos, min: 480, max: 1320 });

        // Horario de 8:00 AM (480 min) a 10:00 PM (1320 min)
        return horaEnMinutos >= 480 && horaEnMinutos <= 1320;
    };

    // Obtener mensaje de horario
    const getMensajeHorario = () => {
        if (servicio.horaInicio && servicio.horaFin) {
            return `${servicio.horaInicio} - ${servicio.horaFin}`;
        }
        return '8:00 AM - 10:00 PM';
    };

    // Obtener mensaje de días laborales
    const getMensajeDias = () => {
        if (servicio.diaInicio && servicio.diaFin) {
            if (servicio.diaInicio === servicio.diaFin) {
                return `Solo ${servicio.diaInicio}`;
            }
            return `${servicio.diaInicio} a ${servicio.diaFin}`;
        }
        return 'Todos los días';
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
            // Validar día laboral de la atracción
            if (!validarDiaLaboral(fechaReserva)) {
                setError(`Esta atracción solo está disponible ${getMensajeDias()}`);
                return false;
            }

            // Validar horario laboral de la atracción
            if (!validarHorarioLaboral(horaReserva)) {
                setError(`El horario de atención es ${getMensajeHorario()}`);
                return false;
            }
        }

        // Validar que la fecha y hora no sean del pasado
        if (!validarFechaHora(fechaReserva, horaReserva)) {
            setError('La reservación debe ser al menos 30 minutos desde ahora');
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
                servicioId: servicio.id, // Mantener como string (Firebase ID)
                nombreServicio: servicio.nombre.trim(),
                tipoServicio: servicio.tipo || 'servicio', // Puede ser: 'servicio', 'atraccion', 'evento'
                fechaReserva: formData.fechaReserva,
                horaReserva: formData.horaReserva,
                numeroPersonas: parseInt(formData.numeroPersonas),
                comentarios: formData.comentarios.trim().substring(0, 500) // Limitar a 500 caracteres
            };

            console.log('📝 Datos de reserva a enviar:', datosReserva);

            await crearReservacion(datosReserva);

            // Cerrar modal
            onClose();

            // Llamar onSuccess para que el padre muestre el mensaje
            if (onSuccess) {
                onSuccess();
            }

            // Mostrar mensaje desde este componente
            setMensajeExito(true);

            // Redirigir a servicios después de 2.5 segundos
            setTimeout(() => {
                navigate('/experiencia/servicios');
            }, 2500);

        } catch (err) {
            console.error('❌ Error al crear reservación:', err);
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

    return (
        <>
            {/* Mensaje de éxito - FUERA del modal */}
            {mensajeExito && createPortal(
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    color: '#333',
                    padding: '20px 28px',
                    borderRadius: '12px',
                    border: '2px solid #52c41a',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    zIndex: 10000,
                    minWidth: '320px',
                    maxWidth: '90vw'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                    }}>
                        <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                        <div style={{ fontSize: '17px', fontWeight: '600' }}>
                            ✅ Reservación creada con éxito
                        </div>
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#666',
                        paddingLeft: '36px'
                    }}>
                        Puedes ver el estado de tu reservación en la sección "Mis Reservaciones"
                    </div>
                </div>,
                document.body
            )}

            {/* Modal de reservación */}
            {createPortal(
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

                {/* Mensaje informativo de horarios para atracciones/servicios */}
                {!esEvento && (servicio.diaInicio || servicio.horaInicio) && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '8px',
                        margin: '16px 0'
                    }}>
                        <div style={{ marginBottom: '8px' }}>
                            <ClockCircleOutlined style={{ color: '#52c41a', fontSize: '16px', marginRight: '8px' }} />
                            <span style={{ color: '#389e0d', fontSize: '14px', fontWeight: '600' }}>
                                Horarios de Atención
                            </span>
                        </div>
                        <div style={{ paddingLeft: '24px', fontSize: '13px', color: '#52c41a' }}>
                            {servicio.diaInicio && servicio.diaFin && (
                                <div style={{ marginBottom: '4px' }}>
                                    📅 Días: {getMensajeDias()}
                                </div>
                            )}
                            {servicio.horaInicio && servicio.horaFin && (
                                <div>
                                    🕐 Horario: {getMensajeHorario()}
                                </div>
                            )}
                        </div>
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
                            {esEvento ? 'Hora del Evento' : `Hora (${getMensajeHorario()})`}
                        </label>
                        <input
                            type="time"
                            name="horaReserva"
                            className="form-input"
                            required
                            onChange={handleChange}
                            value={formData.horaReserva}
                            disabled={loading || esEvento}
                            readOnly={esEvento}
                            style={esEvento ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            {esEvento ? 'Hora fija del evento' : 'La reservación debe ser al menos 30 minutos desde ahora'}
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
            )}
        </>
    );
};

export default ReservaModal;