import api from './api';
import axios from 'axios';

/**
 * Servicio para gestionar solicitudes de eliminación de cuenta
 */

// Usuario solicita eliminar su cuenta (sin requerir autenticación)
export const createDeletionRequest = async (requestData) => {
  try {
    console.log('📤 Enviando solicitud de eliminación (sin autenticación):', requestData);
    
    // Usar axios directamente sin el token de autenticación
    const resp = await axios.post(
      `${api.defaults.baseURL}/deletion-requests`, 
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );
    
    console.log('✅ Respuesta exitosa:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('❌ Error al crear solicitud:', error.response?.data || error.message);
    throw error;
  }
};

// Admin lista todas las solicitudes de eliminación
export const listDeletionRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const url = `/deletion-requests${params.toString() ? '?' + params.toString() : ''}`;
    console.log('📤 Solicitando lista de eliminaciones:', url);
    const resp = await api.get(url);
    console.log('✅ Respuesta exitosa:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('❌ Error al listar solicitudes:', error.response?.data || error.message);
    throw error;
  }
};

// Admin obtiene una solicitud específica
export const getDeletionRequest = async (id) => {
  try {
    console.log('📤 Obteniendo solicitud:', id);
    const resp = await api.get(`/deletion-requests/${id}`);
    console.log('✅ Respuesta exitosa:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('❌ Error al obtener solicitud:', error.response?.data || error.message);
    throw error;
  }
};

// Admin aprueba una solicitud de eliminación
export const approveDeletionRequest = async (id, adminNotes = '') => {
  try {
    console.log('📤 Aprobando solicitud:', id, { adminNotes });
    const resp = await api.put(`/deletion-requests/${id}/approve`, { adminNotes });
    console.log('✅ Respuesta exitosa:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('❌ Error al aprobar solicitud:', error.response?.data || error.message);
    throw error;
  }
};

// Admin rechaza una solicitud de eliminación
export const rejectDeletionRequest = async (id, reason) => {
  try {
    console.log('📤 Rechazando solicitud:', id, { reason });
    const resp = await api.put(`/deletion-requests/${id}/reject`, { reason });
    console.log('✅ Respuesta exitosa:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('❌ Error al rechazar solicitud:', error.response?.data || error.message);
    throw error;
  }
};

// Usuario cancela su propia solicitud
export const cancelDeletionRequest = async (id) => {
  try {
    console.log('📤 Cancelando solicitud:', id);
    const resp = await api.delete(`/deletion-requests/${id}`);
    console.log('✅ Respuesta exitosa:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('❌ Error al cancelar solicitud:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener solicitud del usuario actual
export const getMyDeletionRequest = async () => {
  try {
    console.log('📤 Obteniendo mi solicitud de eliminación');
    const resp = await api.get('/deletion-requests/my-request');
    console.log('✅ Respuesta exitosa:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('❌ Error al obtener mi solicitud:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  createDeletionRequest,
  listDeletionRequests,
  getDeletionRequest,
  approveDeletionRequest,
  rejectDeletionRequest,
  cancelDeletionRequest,
  getMyDeletionRequest
};
