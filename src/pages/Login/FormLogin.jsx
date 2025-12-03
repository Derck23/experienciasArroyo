import React, { useState, useEffect } from 'react';
import { login } from '../../service/authService';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ModalRecuperarPassword from './ModalRecuperarPassword';

function FormLogin() {
  const [loading, setLoading] = useState(false);
  const [modalRecuperarVisible, setModalRecuperarVisible] = useState(false);
  const [showInactivityAlert, setShowInactivityAlert] = useState(false);
  const [mensajeExito, setMensajeExito] = useState({ visible: false, texto: '' });
  const [mensajeError, setMensajeError] = useState({ visible: false, texto: '' });
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Verificar si se cerró sesión por inactividad
  useEffect(() => {
    const logoutReason = sessionStorage.getItem('logoutReason');
    if (logoutReason === 'inactivity') {
      setShowInactivityAlert(true);
      sessionStorage.removeItem('logoutReason');

      // Ocultar alerta después de 8 segundos
      setTimeout(() => {
        setShowInactivityAlert(false);
      }, 8000);
    }
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('Enviando datos:', values);
      const response = await login(values);
      console.log('Login successful:', response);

      // El backend devuelve los datos dentro de response.data
      if (response.data && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setMensajeExito({ visible: true, texto: '¡Inicio de sesión exitoso!' });

        // Redirigir según el nivel de usuario
        const userLevel = user.userLevel || 'user';

        setTimeout(() => {
          if (userLevel === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/experiencia', { replace: true });
          }
        }, 800);
      } else {
        setMensajeError({ visible: true, texto: 'Error: No se recibió el token de autenticación' });
        setTimeout(() => setMensajeError({ visible: false, texto: '' }), 3000);
      }

    } catch (error) {
      console.error('Login failed:', error);

      let errorMessage = 'Error en el inicio de sesión. Intenta nuevamente.';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      }

      setMensajeError({ visible: true, texto: errorMessage });
      setTimeout(() => setMensajeError({ visible: false, texto: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setMensajeError({ visible: true, texto: 'Por favor completa todos los campos requeridos.' });
    setTimeout(() => setMensajeError({ visible: false, texto: '' }), 3000);
  };

  return (
    <div>
      {/* Mensaje de éxito personalizado */}
      {mensajeExito.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          color: '#333',
          padding: '16px 24px',
          borderRadius: '8px',
          border: '2px solid #52c41a',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: '16px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
          {mensajeExito.texto}
        </div>
      )}

      {/* Mensaje de error personalizado */}
      {mensajeError.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          color: '#333',
          padding: '16px 24px',
          borderRadius: '8px',
          border: '2px solid #ff4d4f',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: '16px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CloseCircleOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
          {mensajeError.texto}
        </div>
      )}

      <Spin spinning={loading} tip="Iniciando sesión...">
        {/* Alerta de sesión cerrada por inactividad */}
        {showInactivityAlert && (
          <Alert
            message="Sesión cerrada por inactividad"
            description="Tu sesión se cerró automáticamente debido to un período prolongado de inactividad. Por favor, inicia sesión nuevamente."
            type="warning"
            showIcon
            closable
            onClose={() => setShowInactivityAlert(false)}
            style={{
              marginBottom: '20px',
              borderRadius: '8px'
            }}
          />
        )}

        <div style={{
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 24px)',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '0'
          }}>
            Iniciar Sesión
          </h2>
        </div>

        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          onFinishFailed={onFinishFailed}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu correo!' },
              { type: 'email', message: 'Por favor ingresa un correo válido!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#7f8c8d' }} />}
              placeholder="Correo electrónico"
              type="email"
              style={{
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña!' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#7f8c8d' }} />}
              placeholder="Contraseña"
              style={{
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '10px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              disabled={loading}
              style={{
                backgroundColor: '#16a085',
                borderColor: '#16a085',
                borderRadius: '8px',
                height: '45px',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(22, 160, 133, 0.3)',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </Button>
          </Form.Item>

          <div style={{
            textAlign: 'center',
            marginBottom: '15px'
          }}>
            <Button
              type="link"
              onClick={() => setModalRecuperarVisible(true)}
              style={{
                color: '#16a085',
                fontWeight: '600',
                fontSize: '14px',
                padding: '0',
                height: 'auto'
              }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>

          <div style={{
            textAlign: 'center',
            borderTop: '1px solid #ecf0f1',
            paddingTop: '15px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#7f8c8d'
            }}>
              ¿No tienes cuenta? <a href="/registro" style={{
                color: '#16a085',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}>Regístrate aquí</a>
            </p>
            <p style={{
              fontSize: '12px',
              color: '#95a5a6',
              marginTop: '10px'
            }}>
              <a href="/terminos-condiciones" style={{
                color: '#16a085',
                textDecoration: 'none'
              }}>Términos y Condiciones</a>{' '}
              |{' '}
              <a href="/aviso-privacidad" style={{
                color: '#16a085',
                textDecoration: 'none'
              }}>Aviso de Privacidad</a>
            </p>
          </div>
        </Form>
      </Spin>

      <ModalRecuperarPassword
        visible={modalRecuperarVisible}
        onClose={() => setModalRecuperarVisible(false)}
      />
    </div>
  );
}

export default FormLogin;
