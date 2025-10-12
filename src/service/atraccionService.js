import api from './api';

// Servicio para manejar las atracciones turísticas

// Crear una nueva atracción
export const crearAtraccion = async (atraccionData) => {
    try {
        const response = await api.post('/atracciones', atraccionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al crear la atracción' };
    }
};

// Obtener todas las atracciones con filtros opcionales
export const obtenerAtracciones = async (filtros = {}) => {
    try {
        const params = new URLSearchParams();
        
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.nivelDificultad) params.append('nivelDificultad', filtros.nivelDificultad);

        const queryString = params.toString();
        const url = queryString ? `/atracciones?${queryString}` : '/atracciones';
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las atracciones' };
    }
};

// Obtener una atracción por ID
export const obtenerAtraccionPorId = async (id) => {
    try {
        const response = await api.get(`/atracciones/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener la atracción' };
    }
};

// Actualizar una atracción
export const actualizarAtraccion = async (id, atraccionData) => {
    try {
        const response = await api.put(`/atracciones/${id}`, atraccionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar la atracción' };
    }
};

// Eliminar una atracción
export const eliminarAtraccion = async (id) => {
    try {
        const response = await api.delete(`/atracciones/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar la atracción' };
    }
};

// Cambiar estado de una atracción (activa/inactiva)
export const cambiarEstadoAtraccion = async (id, estado) => {
    try {
        const response = await api.patch(`/atracciones/${id}/estado`, { estado });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al cambiar el estado de la atracción' };
    }
};

// Buscar atracciones
export const buscarAtracciones = async (termino) => {
    try {
        const response = await api.get(`/atracciones/buscar?q=${encodeURIComponent(termino)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al buscar atracciones' };
    }
};

// Obtener estadísticas de atracciones
export const obtenerEstadisticas = async () => {
    try {
        const response = await api.get('/atracciones/estadisticas');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener estadísticas' };
    }
};

// Subir imagen (función auxiliar para manejar la carga de imágenes)
export const subirImagen = async (file) => {
    try {
        const formData = new FormData();
        formData.append('imagen', file);
        
        // Esta ruta debe configurarse en el backend si deseas manejar uploads
        const response = await api.post('/atracciones/upload-imagen', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al subir la imagen' };
    }
};

// Subir audio (función auxiliar para manejar la carga de audio)
export const subirAudio = async (file) => {
    try {
        const formData = new FormData();
        formData.append('audio', file);
        
        // Esta ruta debe configurarse en el backend si deseas manejar uploads
        const response = await api.post('/atracciones/upload-audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al subir el audio' };
    }
};

export default {
    crearAtraccion,
    obtenerAtracciones,
    obtenerAtraccionPorId,
    actualizarAtraccion,
    eliminarAtraccion,
    cambiarEstadoAtraccion,
    buscarAtracciones,
    obtenerEstadisticas,
    subirImagen,
    subirAudio
};
