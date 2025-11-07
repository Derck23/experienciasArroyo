import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Modal, Checkbox } from 'antd';
import { UserOutlined, MailOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './EliminacionCuenta.css';

const { TextArea } = Input;

const EliminacionCuenta = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = async (values) => {
    if (!accepted) {
      message.warning('Debes aceptar que comprendes las consecuencias de eliminar tu cuenta');
      return;
    }

    Modal.confirm({
      title: '¿Estás seguro de que deseas eliminar tu cuenta?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción es irreversible. Una vez confirmada, procesaremos tu solicitud en un plazo de 30 días.',
      okText: 'Sí, eliminar mi cuenta',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        setLoading(true);
        try {
          // Aquí iría la llamada a la API para procesar la solicitud de eliminación
          // await accountDeletionService.requestDeletion(values);
          
          // Simulación de envío
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          message.success('Solicitud de eliminación de cuenta enviada correctamente');
          form.resetFields();
          setAccepted(false);
          
          // Mostrar mensaje de confirmación
          Modal.success({
            title: 'Solicitud Recibida',
            content: (
              <div>
                <p>Hemos recibido tu solicitud de eliminación de cuenta.</p>
                <p>Recibirás un correo electrónico de confirmación en las próximas 24 horas.</p>
                <p>Tu cuenta y datos asociados serán eliminados en un plazo máximo de 30 días.</p>
              </div>
            ),
            onOk: () => navigate('/'),
          });
          
        } catch (error) {
          console.error('Error al solicitar eliminación:', error);
          message.error('Error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
        } finally {
          setLoading(false);
        }
      },
    });
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
                  onChange={(e) => setAccepted(e.target.checked)}
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
                >
                  Solicitar Eliminación de Cuenta
                </Button>
              </Form.Item>

              <div className="deletion-alternative">
                <p>¿Tienes dudas o problemas?</p>
                <p>
                  Puedes <a href="/login">iniciar sesión</a> para gestionar tu cuenta o{' '}
                  <a href="mailto:soporte@experienciasarroyo.com">contactar con soporte</a>.
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
    </div>
  );
};

export default EliminacionCuenta;
