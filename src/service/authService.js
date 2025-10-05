import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Error de conexión. Verifica tu internet o el estado del servidor.');
    }
    if (error.response?.status === 0) {
      throw new Error('No se puede conectar al servidor. Posible problema de CORS.');
    }
    throw error.response?.data || { message: error.message };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};