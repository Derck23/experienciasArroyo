import React, { useState } from 'react';
import { Modal, Input, Button, message, Typography } from 'antd';
import { MailOutlined, SafetyOutlined, ExclamationCircleOutlined } from '@ant-design/icons'; // Importa un ícono de error
import { verifyEmail, resendVerificationCode } from '../../service/authService';
import './ModalCodigoRegistro.css';

const { Title, Text } = Typography;

function ModalCodigoRegistro({ visible, email, onClose, onSuccess }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(null); // <-- 1. Nuevo estado para el error

  const handleVerify = async () => {
    // Limpiamos errores previos al intentar verificar
    setError(null);

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Por favor ingresa un código de 6 caracteres'); // Mostramos error en el modal
      return;
    }

    setLoading(true);
    try {
      const response = await verifyEmail(email, verificationCode);
      
      if (response.success) {
        message.success('¡Email verificado exitosamente!');
        setVerificationCode('');
        onSuccess();
      } else {
        // Si el backend responde con success: false pero sin lanzar un error
        setError(response.message || 'Código inválido o expirado.');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      
      let errorMessage = 'Código inválido o expirado';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // <-- 2. Actualizamos el estado de error en lugar de usar message.error
      setError(errorMessage); 
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null); // Limpiamos error al reenviar
    setResendLoading(true);
    try {
      const response = await resendVerificationCode(email);
      
      if (response.success) {
        message.success('Código reenviado exitosamente');
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Resend failed:', error);
      setError('Error al reenviar el código. Intenta más tarde.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCancel = () => {
    setVerificationCode('');
    setError(null); // <-- 3. Limpiamos el error al cerrar el modal
    onClose();
  };

  const handleInputChange = (e) => {
    if (error) {
      setError(null); // <-- 3. Limpiamos el error cuando el usuario escribe de nuevo
    }
    const value = e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      className="modal-codigo-registro"
      width={500}
      maskClosable={false}
    >
      <div className="modal-codigo-content">
        <div className="modal-codigo-icon">
          <SafetyOutlined />
        </div>
        
        <Title level={3} className="modal-codigo-title">
          Verifica tu Correo
        </Title>
        
        <div className="modal-codigo-description">
          <Text type="secondary">
            Hemos enviado un código de verificación a:
          </Text>
          <div className="modal-codigo-email">
            <MailOutlined />
            <Text strong>{email}</Text>
          </div>
          <Text type="secondary" className="modal-codigo-instruction">
            Ingresa el código de 6 caracteres para completar tu registro
          </Text>
        </div>

        <div className="modal-codigo-input-container">
          <Input
            value={verificationCode}
            onChange={handleInputChange}
            placeholder="Ej: A1B2C3"
            maxLength={6}
            className={`modal-codigo-input ${error ? 'input-error' : ''}`} // Clase condicional para el estilo de error
            size="large"
            autoFocus
            onPressEnter={handleVerify}
          />
          {/* <-- 4. Mostramos el mensaje de error aquí --> */}
          {error && (
            <div className="modal-codigo-error-message">
              <ExclamationCircleOutlined />
              <Text type="danger">{error}</Text>
            </div>
          )}
        </div>

        <div className="modal-codigo-actions">
          <Button
            type="primary"
            onClick={handleVerify}
            loading={loading}
            disabled={loading || verificationCode.length !== 6}
            block
            size="large"
            className="modal-codigo-verify-btn"
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </Button>

          <div className="modal-codigo-resend">
            <Text type="secondary">¿No recibiste el código?</Text>
            <Button
              type="link"
              onClick={handleResend}
              loading={resendLoading}
              disabled={resendLoading}
              className="modal-codigo-resend-btn"
            >
              Reenviar código
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalCodigoRegistro;