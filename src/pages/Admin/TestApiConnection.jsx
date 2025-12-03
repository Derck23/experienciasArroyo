import React, { useState } from 'react';
import { Button, Card, message, Space, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ApiOutlined } from '@ant-design/icons';
import deletionRequestService from '../../service/deletionRequestService';
import api from '../../service/api';

const { Title, Text, Paragraph } = Typography;

/**
 * Componente de prueba para verificar conectividad con el backend
 * Para usar: Agregar ruta temporal en routes.jsx
 * <Route path="/test-api" element={<TestApiConnection />} />
 */
function TestApiConnection() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, success, details) => {
    setResults(prev => [...prev, { test, success, details, timestamp: new Date() }]);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      console.log('🧪 Iniciando pruebas de conexión...');
      
      // Test 1: Verificar que el backend responde
      try {
        const response = await api.get('/');
        addResult('Conexión al Backend', true, `Backend respondió: ${response.status}`);
      } catch (error) {
        if (error.response) {
          addResult('Conexión al Backend', true, `Backend activo (${error.response.status})`);
        } else {
          addResult('Conexión al Backend', false, 'No se pudo conectar al backend');
        }
      }

      // Test 2: Verificar token de autenticación
      const token = localStorage.getItem('token');
      if (token) {
        addResult('Token de Autenticación', true, 'Token encontrado en localStorage');
      } else {
        addResult('Token de Autenticación', false, 'No hay token - Inicia sesión');
      }

      // Test 3: Intentar obtener solicitud del usuario
      try {
        const response = await deletionRequestService.getMyDeletionRequest();
        addResult('GET /deletion-requests/my-request', true, JSON.stringify(response));
      } catch (error) {
        if (error.response?.status === 404) {
          addResult('GET /deletion-requests/my-request', true, 'No hay solicitud (404 - OK)');
        } else {
          addResult('GET /deletion-requests/my-request', false, 
            error.response?.data?.message || error.message);
        }
      }

      // Test 4: Intentar listar solicitudes (Admin)
      try {
        const response = await deletionRequestService.listDeletionRequests();
        addResult('GET /deletion-requests (Admin)', true, 
          `${response.data?.length || 0} solicitudes encontradas`);
      } catch (error) {
        if (error.response?.status === 403) {
          addResult('GET /deletion-requests (Admin)', true, 
            'No tienes permisos de admin (403 - OK si no eres admin)');
        } else {
          addResult('GET /deletion-requests (Admin)', false, 
            error.response?.data?.message || error.message);
        }
      }

      message.success('Pruebas completadas. Revisa los resultados.');
      
    } catch (error) {
      message.error('Error en las pruebas');
      console.error('Error en pruebas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>
          <ApiOutlined /> Prueba de Conexión con Backend
        </Title>
        <Paragraph>
          Este componente verifica la conexión entre el frontend y el backend
          para las solicitudes de eliminación de cuenta.
        </Paragraph>

        <Space style={{ marginBottom: '20px' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={testBackendConnection}
            loading={loading}
          >
            Ejecutar Pruebas
          </Button>
        </Space>

        <div style={{ marginTop: '30px' }}>
          <Title level={4}>Resultados:</Title>
          {results.length === 0 && (
            <Text type="secondary">Haz clic en "Ejecutar Pruebas" para comenzar</Text>
          )}
          
          {results.map((result, index) => (
            <Card 
              key={index} 
              size="small" 
              style={{ marginBottom: '10px' }}
              type={result.success ? 'default' : 'danger'}
            >
              <Space>
                {result.success ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                )}
                <div>
                  <Text strong>{result.test}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {result.details}
                  </Text>
                </div>
              </Space>
            </Card>
          ))}
        </div>

        <Card style={{ marginTop: '30px', backgroundColor: '#f0f2f5' }}>
          <Title level={5}>Configuración Actual:</Title>
          <Paragraph>
            <Text strong>Base URL:</Text> {api.defaults.baseURL}
          </Paragraph>
          <Paragraph>
            <Text strong>Token:</Text> {localStorage.getItem('token') ? '✅ Presente' : '❌ No hay token'}
          </Paragraph>
          <Paragraph>
            <Text strong>Endpoints a verificar:</Text>
            <ul>
              <li>GET /api/deletion-requests/my-request</li>
              <li>GET /api/deletion-requests</li>
              <li>POST /api/deletion-requests</li>
              <li>PUT /api/deletion-requests/:id/approve</li>
              <li>PUT /api/deletion-requests/:id/reject</li>
              <li>DELETE /api/deletion-requests/:id</li>
            </ul>
          </Paragraph>
        </Card>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
          <Text strong>💡 Nota:</Text>
          <Paragraph style={{ marginBottom: 0, marginTop: '8px' }}>
            Abre la consola del navegador (F12 → Console) para ver logs detallados de cada petición.
            Los logs usan emojis: 📤 = enviando, ✅ = éxito, ❌ = error
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}

export default TestApiConnection;
