import React, { useState } from 'react';
import { register } from '../../service/authService';
import { Form, Input, Button, message, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined, InfoCircleOutlined} from '@ant-design/icons';
import ModalCodigoRegistro from './ModalCodigoRegistro';

function FormRegistro() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [form] = Form.useForm();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    if (value.length < 8) {
      return Promise.reject(new Error('La contraseña debe tener al menos 8 caracteres'));
    }
    if (!/[a-z]/.test(value)) {
      return Promise.reject(new Error('Debe contener al menos una letra minúscula'));
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(new Error('Debe contener al menos una letra mayúscula'));
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject(new Error('Debe contener al menos un número'));
    }
    return Promise.resolve();
  };

  // Validación para confirmar contraseña
  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue('password');
    if (!value) {
      return Promise.reject(new Error('Por favor confirma tu contraseña'));
    }
    if (value !== password) {
      return Promise.reject(new Error('Las contraseñas no coinciden'));
    }
    return Promise.resolve();
  };

  // Validación para nombre
  const validateFirstName = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('El nombre es requerido'));
    }
    if (value.trim().length < 2) {
      return Promise.reject(new Error('El nombre debe tener al menos 2 caracteres'));
    }
    return Promise.resolve();
  };

  // Validación para apellido
  const validateLastName = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('El apellido es requerido'));
    }
    if (value.trim().length < 2) {
      return Promise.reject(new Error('El apellido debe tener al menos 2 caracteres'));
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Normalizar y limpiar datos (sin incluir confirmPassword)
      const normalizedValues = {
        email: values.email.trim().toLowerCase(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        password: values.password,
        phone: values.phone
      };

      console.log('Enviando datos de registro:', normalizedValues);
      const response = await register(normalizedValues);
      console.log('Registro response:', response);

      if (response.success) {
        message.success('Código de verificación enviado a tu correo');
        setUserEmail(normalizedValues.email);
        setModalVisible(true);
      }

    } catch (error) {
      console.error('Registro failed:', error);

      let errorMsg = '';

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        switch (status) {
          case 400:
            errorMsg = serverMessage || 'Datos de registro inválidos';
            break;
          case 409:
            errorMsg = 'Este correo electrónico ya está registrado';
            break;
          case 500:
            errorMsg = 'Error del servidor. Por favor intenta más tarde';
            break;
          default:
            errorMsg = serverMessage || 'Error en el registro';
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
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setErrorMessage('');
    message.error('Por favor completa correctamente todos los campos requeridos.');
  };

  const handleFieldChange = () => {
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleVerificationSuccess = () => {
    setModalVisible(false);
    form.resetFields();
    setRegistrationComplete(true);
  };

  if (registrationComplete) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <CheckCircleOutlined style={{
          fontSize: 'clamp(60px, 10vw, 80px)',
          color: '#16a085',
          marginBottom: '20px'
        }} />
        <h3 style={{
          fontSize: 'clamp(22px, 3vw, 28px)',
          fontWeight: '600',
          color: '#2c3e50',
          margin: '20px 0 15px 0'
        }}>
          ¡Registro Completado!
        </h3>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 16px)',
          color: '#7f8c8d',
          margin: '10px 0'
        }}>
          Bienvenido. Te has registrado correctamente.
        </p>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 16px)',
          color: '#7f8c8d',
          margin: '10px 0 30px 0'
        }}>
          Ya puedes iniciar sesión.
        </p>
        <Button
          type="primary"
          size="large"
          href="/login"
          style={{
            backgroundColor: '#16a085',
            borderColor: '#16a085',
            borderRadius: '8px',
            height: '45px',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '0 40px',
            boxShadow: '0 4px 10px rgba(22, 160, 133, 0.3)'
          }}
        >
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <>
      <div>
        <Spin spinning={loading} tip="Procesando registro...">
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
              Crear Cuenta
            </h2>
          </div>

          {errorMessage && (
            <Alert
              message="Error de registro"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
              style={{
                marginBottom: '20px',
                borderRadius: '8px'
              }}
            />
          )}

          <Form
            form={form}
            name="registro"
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            size="large"
            layout="vertical"
            scrollToFirstError
            onValuesChange={handleFieldChange}
          >
            <Form.Item
              name="email"
              rules={[{ validator: validateEmail }]}
              hasFeedback
            >
              <Input
                prefix={<MailOutlined style={{ color: '#7f8c8d' }} />}
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
              name="firstName"
              rules={[{ validator: validateFirstName }]}
              hasFeedback
            >
              <Input
                prefix={<UserOutlined style={{ color: '#7f8c8d' }} />}
                placeholder="Nombre"
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[{ validator: validateLastName }]}
              hasFeedback
            >
              <Input
                prefix={<UserOutlined style={{ color: '#7f8c8d' }} />}
                placeholder="Apellido(s)"
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ validator: validatePassword }]}
              hasFeedback
              extra={
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '8px' }}>
                  <InfoCircleOutlined /> La contraseña debe tener: mínimo 8 caracteres, una mayúscula, una minúscula y un número
                </div>
              }
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

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[{ validator: validateConfirmPassword }]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#7f8c8d' }} />}
                placeholder="Confirmar contraseña"
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Por favor ingresa tu teléfono!' },
                { pattern: /^[0-9]{10}$/, message: 'El teléfono debe tener 10 dígitos!' }
              ]}
              hasFeedback
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#7f8c8d' }} />}
                placeholder="Teléfono (10 dígitos)"
                maxLength={10}
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item>
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
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </Form.Item>

            <div style={{
              textAlign: 'center',
              marginTop: '15px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#7f8c8d'
              }}>
                ¿Ya tienes cuenta? <a href="/login" style={{
                  color: '#16a085',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}>Inicia sesión aquí</a>
              </p>
              <p style={{
                fontSize: '12px',
                color: '#95a5a6',
                marginTop: '10px'
              }}>
                Al registrarte, aceptas nuestros{' '}
                <a href="/terminos-condiciones" style={{
                  color: '#16a085',
                  textDecoration: 'none'
                }}>Términos y Condiciones</a>{' '}
                y{' '}
                <a href="/aviso-privacidad" style={{
                  color: '#16a085',
                  textDecoration: 'none'
                }}>Aviso de Privacidad</a>
              </p>
            </div>
          </Form>
        </Spin>
      </div>

      <ModalCodigoRegistro
        visible={modalVisible}
        email={userEmail}
        onClose={handleModalClose}
        onSuccess={handleVerificationSuccess}
      />
    </>
  );
}

export default FormRegistro;