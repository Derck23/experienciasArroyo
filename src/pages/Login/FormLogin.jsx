import React, { useState } from 'react';
import { login } from '../../service/authService';
import { useNavigate } from 'react-router-dom'; 
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './FormLogin.css';

const { Title } = Typography;

function FormLogin() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate(); 

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('Enviando datos:', values);
      const response = await login(values);
      console.log('Login successful:', response);
      message.success('¡Inicio de sesión exitoso!');

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      navigate('/Experiencia');

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

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Por favor completa todos los campos requeridos.');
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <Spin spinning={loading} tip="Iniciando sesión...">
          <div className="login-header">
            <Title level={2} className="login-title">
              Iniciar Sesión
            </Title>
          </div>

          <Form
            form={form}
            name="login"
            className="login-form"
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
                prefix={<UserOutlined />}
                placeholder="Correo electrónico"
                className="login-input"
                type="email"
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
                className="login-input"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                block
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Ingresar'}
              </Button>
            </Form.Item>
            <div className="login-footer">
              <p>¿No tienes cuenta? <a href="/registro">Regístrate aquí</a></p>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default FormLogin;
