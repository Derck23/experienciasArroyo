import React, { useState } from 'react';
import { register } from '../../service/authService';
import { Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined} from '@ant-design/icons';
import ModalCodigoRegistro from './ModalCodigoRegistro';

function FormRegistro() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [form] = Form.useForm();
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('Enviando datos de registro:', values);
      const response = await register(values);
      console.log('Registro response:', response);

      if (response.success) {
        message.success('Código de verificación enviado a tu correo');
        setUserEmail(values.email);
        setModalVisible(true);
      }

    } catch (error) {
      console.error('Registro failed:', error);

      let errorMessage = 'Error en el registro. Intenta nuevamente.';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Por favor completa todos los campos correctamente.');
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

          <Form
            form={form}
            name="registro"
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Por favor ingresa tu correo!' },
                { type: 'email', message: 'Por favor ingresa un correo válido!' },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Formato de correo inválido!'
                }
              ]}
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
              />
            </Form.Item>

            <Form.Item
              name="firstName"
              rules={[
                { required: true, message: 'Por favor ingresa tu nombre!' },
                { min: 2, message: 'El nombre debe tener al menos 2 caracteres!' },
                { max: 50, message: 'El nombre no puede exceder 50 caracteres!' },
                {
                  pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                  message: 'El nombre solo puede contener letras!'
                },
                {
                  validator: (_, value) => {
                    if (value && value.trim().length === 0) {
                      return Promise.reject('El nombre no puede estar vacío!');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#7f8c8d' }} />}
                placeholder="Nombre"
                onKeyPress={(e) => {
                  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[
                { required: true, message: 'Por favor ingresa tus apellidos!' },
                { min: 2, message: 'Los apellidos deben tener al menos 2 caracteres!' },
                { max: 50, message: 'Los apellidos no pueden exceder 50 caracteres!' },
                {
                  pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                  message: 'Los apellidos solo pueden contener letras!'
                },
                {
                  validator: (_, value) => {
                    if (value && value.trim().length === 0) {
                      return Promise.reject('Los apellidos no pueden estar vacíos!');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#7f8c8d' }} />}
                placeholder="Apellido(s)"
                onKeyPress={(e) => {
                  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
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
                { min: 8, message: 'La contraseña debe tener al menos 8 caracteres!' },
                { max: 50, message: 'La contraseña no puede exceder 50 caracteres!' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/,
                  message: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&#)!'
                }
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

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Por favor confirma tu contraseña!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden!'));
                  },
                }),
              ]}
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
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'El teléfono debe tener exactamente 10 dígitos!'
                },
                {
                  validator: (_, value) => {
                    if (value && !/^[0-9]*$/.test(value)) {
                      return Promise.reject('El teléfono solo puede contener números!');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#7f8c8d' }} />}
                placeholder="Teléfono (10 dígitos)"
                maxLength={10}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
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