import api from './api';

// Crear una nueva reservación
export const crearReservacion = async (reservaData) => {
    try {
        // Validar que los datos requeridos estén presentes
        if (!reservaData.servicioId || !reservaData.fechaReserva || !reservaData.horaReserva || !reservaData.numeroPersonas) {
            throw { message: 'Faltan datos requeridos para crear la reservación' };
        }

        // Asegurar que los datos sean del tipo correcto
        const datosValidados = {
            servicioId: parseInt(reservaData.servicioId),
            nombreServicio: String(reservaData.nombreServicio || '').trim(),
            fechaReserva: String(reservaData.fechaReserva),
            horaReserva: String(reservaData.horaReserva),
            numeroPersonas: parseInt(reservaData.numeroPersonas),
            comentarios: String(reservaData.comentarios || '').trim()
        };

        const response = await api.post('/reservaciones', datosValidados);
        return response.data;
    } catch (error) {
        // Manejar diferentes tipos de errores
        if (error.response?.data?.message) {
            throw { message: error.response.data.message };
        } else if (error.message) {
            throw { message: error.message };
        } else {
            throw { message: 'Error al crear la reservación. Por favor, intenta de nuevo.' };
        }
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