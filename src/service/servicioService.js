import api from './api'; // Importamos la misma instancia de Axios

// === SERVICIO PARA MANEJAR LOS SERVICIOS ===

// Crear un nuevo servicio (para Admins)
export const crearServicio = async (servicioData) => {
    try {
        const response = await api.post('/servicios', servicioData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al crear el servicio' };
    }
};

// Obtener TODOS los servicios (sin filtros de servidor)
export const obtenerServicios = async () => {
    try {
        // Esta función trae todos los servicios
        const response = await api.get('/servicios');
        // Asumimos que la API devuelve un array de servicios
        // Si devuelve { success: true, data: [...] }, usa response.data.data
        return response.data; 
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener los servicios' };
    }
};

// Obtener un servicio por ID
export const obtenerServicioPorId = async (id) => {
    try {
        const response = await api.get(`/servicios/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener el servicio' };
    }
};

// Actualizar un servicio (para Admins)
export const actualizarServicio = async (id, servicioData) => {
    try {
        const response = await api.put(`/servicios/${id}`, servicioData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar el servicio' };
    }
};

// Eliminar un servicio (para Admins)
export const eliminarServicio = async (id) => {
    try {
        const response = await api.delete(`/servicios/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar el servicio' };
    }
};

// Buscar servicios (por término de búsqueda)
export const buscarServicios = async (termino) => {
    try {
        const response = await api.get(`/servicios/buscar?q=${encodeURIComponent(termino)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al buscar servicios' };
    }
};

// Obtener estadísticas de servicios
export const obtenerEstadisticasServicios = async () => {
    try {
        const response = await api.get('/servicios/estadisticas');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener estadísticas' };
    }
};