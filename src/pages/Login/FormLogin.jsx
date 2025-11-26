import React, { useState } from 'react';
import { login } from '../../service/authService';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, WarningOutlined } from '@ant-design/icons';
import ModalRecuperarPassword from './ModalRecuperarPassword';

function FormLogin() {
  const [loading, setLoading] = useState(false);
  const [modalRecuperarVisible, setModalRecuperarVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Validación personalizada para email
  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('El correo electrónico es requerido'));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return Promise.reject(new Error('Por favor ingresa un correo electrónico válido'));
    }
    return Promise.resolve();
  };

  // Validación personalizada para contraseña
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('La contraseña es requerida'));
    }
    if (value.trim().length === 0) {
      return Promise.reject(new Error('La contraseña no puede estar vacía'));
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrorMessage('');
    setIsAccountLocked(false);
    
    try {
      // Normalizar email antes de enviar
      const normalizedValues = {
        ...values,
        email: values.email.trim().toLowerCase()
      };

      console.log('Enviando datos:', normalizedValues);
      const response = await login(normalizedValues);
      console.log('Login successful:', response);

      // El backend devuelve los datos dentro de response.data
      if (response.data && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        message.success('¡Inicio de sesión exitoso!');

        // Redirigir según el nivel de usuario
        const userLevel = user.userLevel || 'user';

        setTimeout(() => {
          if (userLevel === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/experiencia', { replace: true });
          }
        }, 100);
      } else {
        setErrorMessage('Error: No se recibió el token de autenticación');
        message.error('Error: No se recibió el token de autenticación');
      }

    } catch (error) {
      console.error('Login failed:', error);

      let errorMsg = '';
      let accountLocked = false;

      // Manejo detallado de errores
      if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        switch (status) {
          case 400:
            errorMsg = serverMessage || 'Datos de inicio de sesión inválidos';
            break;
          case 401:
            // Detectar si es un bloqueo por intentos excesivos
            if (serverMessage?.toLowerCase().includes('bloqueada') || 
                serverMessage?.toLowerCase().includes('bloqueado') ||
                serverMessage?.toLowerCase().includes('intentos') ||
                serverMessage?.toLowerCase().includes('locked')) {
              errorMsg = 'Tu cuenta ha sido bloqueada temporalmente por exceder el límite de intentos fallidos';
              accountLocked = true;
            } else {
              errorMsg = 'Correo electrónico o contraseña incorrectos';
            }
            break;
          case 403:
            // También puede ser un código 403 para cuenta bloqueada
            if (serverMessage?.toLowerCase().includes('bloqueada') || 
                serverMessage?.toLowerCase().includes('bloqueado') ||
                serverMessage?.toLowerCase().includes('intentos')) {
              errorMsg = 'Tu cuenta ha sido bloqueada temporalmente por exceder el límite de intentos fallidos';
              accountLocked = true;
            } else {
              errorMsg = 'Acceso denegado. Tu cuenta puede estar desactivada';
            }
            break;
          case 404:
            errorMsg = 'Usuario no encontrado. Verifica tu correo electrónico';
            break;
          case 423: // Código HTTP específico para "Locked"
            errorMsg = 'Tu cuenta ha sido bloqueada temporalmente por exceder el límite de intentos fallidos';
            accountLocked = true;
            break;
          case 429: // Too Many Requests
            errorMsg = 'Demasiados intentos de inicio de sesión. Tu cuenta ha sido bloqueada temporalmente';
            accountLocked = true;
            break;
          case 500:
            errorMsg = 'Error del servidor. Por favor intenta más tarde';
            break;
          default:
            errorMsg = serverMessage || 'Error en el inicio de sesión';
        }
      } else if (error.request) {
        errorMsg = 'No se puede conectar con el servidor. Verifica tu conexión a internet';
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = 'Error de conexión. Verifica tu internet';
      } else {
        errorMsg = 'Error desconocido. Por favor intenta nuevamente';
      }

      setErrorMessage(errorMsg);
      setIsAccountLocked(accountLocked);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setErrorMessage('');
    setIsAccountLocked(false);
    message.error('Por favor completa todos los campos requeridos.');
  };

  // Limpiar error al cambiar campos
  const handleFieldChange = () => {
    if (errorMessage) {
      setErrorMessage('');
      setIsAccountLocked(false);
    }
  };

  const handleRecoverPassword = () => {
    setModalRecuperarVisible(true);
  };

  return (
    <div>
      <Spin spinning={loading} tip="Iniciando sesión...">
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

        {/* Mensaje de error visible con botón de recuperación si está bloqueado */}
        {errorMessage && (
          <Alert
            message={isAccountLocked ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WarningOutlined />
                <span>Cuenta Bloqueada</span>
              </div>
            ) : "Error de inicio de sesión"}
            description={
              <div>
                <p style={{ margin: '0 0 10px 0' }}>{errorMessage}</p>
                {isAccountLocked && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleRecoverPassword}
                    style={{
                      backgroundColor: '#ff9800',
                      borderColor: '#ff9800',
                      marginTop: '8px'
                    }}
                  >
                    Recuperar Contraseña
                  </Button>
                )}
              </div>
            }
            type={isAccountLocked ? "warning" : "error"}
            showIcon
            closable
            onClose={() => {
              setErrorMessage('');
              setIsAccountLocked(false);
            }}
            style={{
              marginBottom: '20px',
              borderRadius: '8px'
            }}
          />
        )}

        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          onFinishFailed={onFinishFailed}
          size="large"
          layout="vertical"
          onValuesChange={handleFieldChange}
        >
          <Form.Item
            name="email"
            rules={[
              { validator: validateEmail }
            ]}
            hasFeedback
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
              onChange={(e) => {
                e.target.value = e.target.value.trim();
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { validator: validatePassword }
            ]}
            hasFeedback
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
