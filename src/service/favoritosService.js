import api from './api';

// Obtener todos los favoritos del usuario actual
export const obtenerFavoritos = async () => {
  try {
    const response = await api.get('/favoritos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    throw error;
  }
};

// Agregar a favoritos
export const agregarFavorito = async (tipo, itemId) => {
  try {
    const response = await api.post('/favoritos', {
      tipo, // 'restaurante', 'atraccion', 'evento', 'servicio'
      itemId
    });
    return response.data;
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    throw error;
  }
};

// Eliminar de favoritos
export const eliminarFavorito = async (favoritoId) => {
  try {
    const response = await api.delete(`/favoritos/${favoritoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    throw error;
  }
};

// Verificar si un item es favorito
export const esFavorito = async (tipo, itemId) => {
  try {
    const response = await api.get(`/favoritos/check/${tipo}/${itemId}`);
    return response.data; // Retorna {esFavorito: boolean, favoritoId: string|null}
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    return { esFavorito: false, favoritoId: null };
  }
};

// Obtener favoritos por tipo
export const obtenerFavoritosPorTipo = async (tipo) => {
  try {
    const response = await api.get(`/favoritos/tipo/${tipo}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener favoritos por tipo:', error);
    throw error;
  }
};
