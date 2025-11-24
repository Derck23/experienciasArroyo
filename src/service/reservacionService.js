import api from './api';

// Crear una nueva reservación
export const crearReservacion = async (reservaData) => {
    try {
        // reservaData debe incluir: servicioId, nombreServicio, fechaReserva, horaReserva, etc.
        const response = await api.post('/reservaciones', reservaData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al crear la reservación' };
    }
};

// Obtener las reservaciones del usuario actual
export const obtenerMisReservaciones = async () => {
    try {
        const response = await api.get('/reservaciones/mis-reservas');
        // Asumiendo que el backend devuelve { success: true, data: [...] }
        return response.data.data; 
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener tus reservaciones' };
    }
};

// Cancelar una reservación (Cambiar estado a 'cancelada')
export const cancelarReservacion = async (id) => {
    try {
        const response = await api.patch(`/reservaciones/${id}/estado`, { 
            estado: 'cancelada' 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al cancelar la reservación' };
    }
};

// Obtener TODAS las reservaciones (Solo para Admin)
export const obtenerTodasReservaciones = async () => {
    try {
        const response = await api.get('/reservaciones'); // Ruta que creamos en el back
        return response.data.data; 
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener todas las reservaciones' };
    }
};

// Actualizar estado de reservación (Confirmar/Cancelar desde Admin)
export const actualizarEstadoReservacion = async (id, nuevoEstado) => {
    try {
        const response = await api.patch(`/reservaciones/${id}/estado`, { 
            estado: nuevoEstado 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar la reservación' };
    }
};