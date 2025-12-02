import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Modal, Checkbox } from 'antd';
import { UserOutlined, MailOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './EliminacionCuenta.css';
import deletionRequestService from '../../service/deletionRequestService';
import { getCurrentUser } from '../../utils/auth';

const { TextArea } = Input;

const EliminacionCuenta = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [accepted, setAccepted] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);
  const currentUser = getCurrentUser();

  // Pre-llenar el formulario con datos del usuario si está autenticado
  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        fullName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        email: currentUser.email || ''
      });
    }
  }, [currentUser, form]);

  const handleSubmit = (values) => {
    console.log('🎯 handleSubmit llamado con valores:', values);
    
    if (!accepted) {
      message.warning('Debes aceptar que comprendes las consecuencias de eliminar tu cuenta');
      return;
    }

    setPendingValues(values);
    setIsConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmModalVisible(false);
    const values = pendingValues;
    
    if (!values) return;

    setLoading(true);
    try {
      console.log('🚀 Iniciando solicitud de eliminación para:', values.email);
      
      // Enviar solicitud de eliminación al backend (sin autenticación)
      const requestData = {
        fullName: values.fullName,
        email: values.email,
        reason: values.reason || 'No especificado',
      };

      console.log('📦 Datos a enviar:', requestData);
      
      const response = await deletionRequestService.createDeletionRequest(requestData);
      console.log('✅ Solicitud creada exitosamente:', response);
      
      message.success('Solicitud de eliminación de cuenta enviada correctamente');
      form.resetFields();
      setAccepted(false);
      setPendingValues(null);
      
      // Mostrar mensaje de confirmación
      Modal.success({
        title: 'Solicitud Recibida',
        content: (
          <div>
            <p>Hemos recibido tu solicitud de eliminación de cuenta.</p>
            <p>Recibirás un correo electrónico de confirmación a <strong>{values.email}</strong> en las próximas 24 horas.</p>
            <p>Un administrador revisará tu solicitud y se procesará en un plazo máximo de 30 días.</p>
            <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
              Si no recibes el correo, verifica tu bandeja de spam o contacta con soporte.
            </p>
          </div>
        ),
        onOk: () => navigate('/'),
      });
      
    } catch (error) {
      console.error('❌ Error completo al solicitar eliminación:', error);
      console.error('❌ Respuesta del servidor:', error.response);
      
      let errorMsg = 'Error al procesar tu solicitud. Por favor, inténtalo de nuevo.';
      
      if (error.response) {
        // El servidor respondió con un error
        errorMsg = error.response.data?.message || 
                  error.response.data?.error || 
                  `Error del servidor: ${error.response.status}`;
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }
      
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deletion-container">
      <div className="deletion-content">
        <button 
          className="deletion-back-button"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <div className="deletion-header">
          <DeleteOutlined className="deletion-icon" />
          <h1>Eliminación de Cuenta</h1>
          <p className="deletion-subtitle">Experiencias Arroyo</p>
        </div>

        <div className="deletion-info">
          <h2>Información Importante</h2>
          <p>
            En Experiencias Arroyo respetamos tu derecho a la privacidad y el control sobre tus datos personales.
            Si deseas eliminar tu cuenta, sigue los pasos a continuación.
          </p>
        </div>

        <div className="deletion-steps">
          <h2>Pasos para Solicitar la Eliminación de tu Cuenta</h2>
          <ol>
            <li>
              <strong>Completa el formulario:</strong> Proporciona tu información de contacto y confirma tu identidad.
            </li>
            <li>
              <strong>Especifica el motivo (opcional):</strong> Esto nos ayuda a mejorar nuestros servicios.
            </li>
            <li>
              <strong>Lee y acepta:</strong> Comprende qué datos se borrarán y cuáles se conservarán.
            </li>
            <li>
              <strong>Envía la solicitud:</strong> Recibirás un correo de confirmación en 24 horas.
            </li>
            <li>
              <strong>Espera la confirmación:</strong> Tu cuenta será eliminada en un plazo máximo de 30 días.
            </li>
          </ol>
        </div>

        <div className="deletion-data-info">
          <h2>¿Qué Datos se Eliminarán?</h2>
          <div className="data-section">
            <h3>✓ Datos que se Borrarán Permanentemente:</h3>
            <ul>
              <li>Información personal (nombre, correo electrónico, teléfono)</li>
              <li>Contraseña y credenciales de acceso</li>
              <li>Preferencias y configuraciones de la cuenta</li>
              <li>Historial de actividad en la aplicación</li>
              <li>Favoritos y listas guardadas</li>
              <li>Comentarios y reseñas personales</li>
              <li>Fotos de perfil y contenido multimedia asociado</li>
            </ul>
          </div>

          <div className="data-section">
            <h3>⚠ Datos que se Conservarán:</h3>
            <ul>
              <li>
                <strong>Registros de transacciones:</strong> Se conservarán por requisitos legales y contables durante 5 años.
              </li>
              <li>
                <strong>Datos anonimizados:</strong> Estadísticas y análisis agregados sin información personal identificable.
              </li>
              <li>
                <strong>Información legal:</strong> Registros necesarios para cumplir con obligaciones legales y regulatorias.
              </li>
              <li>
                <strong>Comunicaciones:</strong> Correspondencia relacionada con reclamaciones o disputas legales.
              </li>
            </ul>
          </div>

          <div className="data-section retention-period">
            <h3>⏱ Períodos de Retención:</h3>
            <ul>
              <li><strong>Datos personales:</strong> Eliminados inmediatamente tras la confirmación (máximo 30 días)</li>
              <li><strong>Registros de transacciones:</strong> 5 años desde la última actividad</li>
              <li><strong>Datos de cumplimiento legal:</strong> Según lo requiera la legislación aplicable</li>
              <li><strong>Backups del sistema:</strong> Eliminados en el siguiente ciclo de respaldo (máximo 90 días)</li>
            </ul>
          </div>
        </div>

        <div className="deletion-consequences">
          <h2>⚠️ Consecuencias de Eliminar tu Cuenta</h2>
          <ul>
            <li>Perderás acceso permanente a tu cuenta de Experiencias Arroyo</li>
            <li>No podrás recuperar tus datos, favoritos o configuraciones</li>
            <li>Todas las reservas o servicios activos serán cancelados</li>
            <li>No podrás usar el mismo correo electrónico para crear una nueva cuenta durante 90 días</li>
            <li>Perderás cualquier beneficio o promoción asociada a tu cuenta</li>
          </ul>
        </div>

        <div className="deletion-form-section">
          <h2>Formulario de Solicitud</h2>
          <Spin spinning={loading} tip="Procesando solicitud...">
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Nombre Completo"
                name="fullName"
                rules={[
                  { required: true, message: 'Por favor ingresa tu nombre completo' },
                  { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Ingresa tu nombre completo"
                />
              </Form.Item>

              <Form.Item
                label="Correo Electrónico de la Cuenta"
                name="email"
                rules={[
                  { required: true, message: 'Por favor ingresa tu correo electrónico' },
                  { type: 'email', message: 'Por favor ingresa un correo válido' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="correo@ejemplo.com"
                  type="email"
                />
              </Form.Item>

              <Form.Item
                label="Motivo de Eliminación (Opcional)"
                name="reason"
              >
                <TextArea
                  rows={4}
                  placeholder="Cuéntanos por qué deseas eliminar tu cuenta. Esto nos ayuda a mejorar."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item>
                <Checkbox
                  checked={accepted}
                  onChange={(e) => {
                    console.log('✅ Checkbox cambiado a:', e.target.checked);
                    setAccepted(e.target.checked);
                  }}
                >
                  <span style={{ fontSize: '14px' }}>
                    Comprendo que esta acción es irreversible y que mis datos serán eliminados 
                    permanentemente según la política descrita anteriormente. He leído y acepto los 
                    términos de eliminación de cuenta.
                  </span>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  block
                  size="large"
                  icon={<DeleteOutlined />}
                  disabled={!accepted || loading}
                  className="deletion-submit-button"
                  onClick={() => console.log('🖱️ Botón clickeado - accepted:', accepted, 'loading:', loading)}
                >
                  Solicitar Eliminación de Cuenta
                </Button>
              </Form.Item>

              <div className="deletion-alternative">
                <p>¿Tienes dudas o problemas?</p>
                <p>
                  Puedes <a href="mailto:soporte@experienciasarroyo.com">contactar con soporte</a>.
                </p>
              </div>
            </Form>
          </Spin>
        </div>

        <div className="deletion-contact">
          <h2>Contacto y Soporte</h2>
          <p>
            Si tienes preguntas sobre el proceso de eliminación de cuenta o necesitas asistencia, 
            puedes contactarnos:
          </p>
          <ul>
            <li><strong>Email:</strong> soporte@experienciasarroyo.com</li>
            <li><strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</li>
            <li><strong>Tiempo de respuesta:</strong> Máximo 24 horas hábiles</li>
          </ul>
        </div>

        <div className="deletion-footer">
          <p>
            Esta página cumple con los requisitos de Google Play Store para la gestión de eliminación de cuentas.
          </p>
          <p>
            <a href="/aviso-privacidad">Aviso de Privacidad</a> | {' '}
            <a href="/terminos-condiciones">Términos y Condiciones</a>
          </p>
        </div>
      </div>

      <Modal
        title="¿Estás seguro de que deseas eliminar tu cuenta?"
        open={isConfirmModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Sí, solicitar eliminación"
        okType="danger"
        cancelText="Cancelar"
        confirmLoading={loading}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '22px', marginTop: '4px' }} />
          <p>Esta acción iniciará el proceso de eliminación. Un administrador revisará tu solicitud en un plazo de 30 días.</p>
        </div>
      </Modal>
    </div>
  );
};

export default EliminacionCuenta;
