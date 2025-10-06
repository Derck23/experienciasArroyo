import React, { useState } from 'react';
import { register } from '../../service/authService';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined} from '@ant-design/icons';
import ModalCodigoRegistro from './ModalCodigoRegistro';
import './FormRegistro.css';

const { Title, Text } = Typography;

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
      <Card className="success-card" bordered={false}>
        <div className="success-content">
          <CheckCircleOutlined className="success-icon" />
          <Title level={3} className="success-title">¡Registro Completado!</Title>
          <Text className="success-text">
            Bienvenido. Te has registrado correctamente.
          </Text>
          <Text className="success-text">
            Ya puedes iniciar sesión.
          </Text>
          <div className="success-actions">
            <Button
              type="primary"
              size="large"
              href="/login" // Redirige al login
              className="success-button"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="registro-container">
        <Card className="registro-card" bordered={false}>
          <Spin spinning={loading} tip="Procesando registro...">
            <div className="registro-header">
              <Title level={2} className="registro-title">
                Crear Cuenta
              </Title>
            </div>

            <Form
              form={form}
              name="registro"
              className="registro-form"
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
                  prefix={<MailOutlined />}
                  placeholder="Correo electrónico"
                  className="registro-input"
                  type="email"
                />
              </Form.Item>

              <Form.Item
                name="firstName"
                rules={[
                  { required: true, message: 'Por favor ingresa tu nombre!' },
                  { min: 2, message: 'El nombre debe tener al menos 2 caracteres!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nombre"
                  className="registro-input"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                rules={[
                  { required: true, message: 'Por favor ingresa tus apellidos!' },
                  { min: 2, message: 'Los apellidos deben tener al menos 2 caracteres!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Apellido(s)"
                  className="registro-input"
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
                  prefix={<LockOutlined />}
                  placeholder="Contraseña"
                  className="registro-input"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: 'Por favor ingresa tu teléfono!' },
                  { pattern: /^[0-9]{10}$/, message: 'El teléfono debe tener 10 dígitos!' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Teléfono (10 dígitos)"
                  className="registro-input"
                  maxLength={10}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="registro-button"
                  block
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </Button>
              </Form.Item>

              <div className="registro-footer">
                <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a></p>
              </div>
            </Form>
          </Spin>
        </Card>
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