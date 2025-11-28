import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Button, Modal, message, Space, Form, Input, Select, Switch, Tabs, notification
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import userService from '../../service/userService';
import { getCurrentUser } from '../../utils/auth';
import './GestionDeUsuarios.css';

function GestionDeUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalEliminar, setModalEliminar] = useState({ visible: false, usuario: null });
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mensajeExito, setMensajeExito] = useState({ visible: false, texto: '' });
  const [mensajeError, setMensajeError] = useState({ visible: false, texto: '' });
  const [modalLimpiarInactivos, setModalLimpiarInactivos] = useState(false);
  const [passwordLimpiar, setPasswordLimpiar] = useState('');
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await userService.listUsers();
      setUsers(resp.data || []);
    } catch (error) {
      console.error(error);
      message.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      role: record.role,
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  const mostrarModalCambiarEstado = (usuario) => {
    setModalEliminar({ visible: true, usuario });
  };

  const confirmarCambiarEstado = async () => {
    const usuario = modalEliminar.usuario;
    const nuevoEstado = !usuario.isActive;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    // Cerrar el modal primero
    setModalEliminar({ visible: false, usuario: null });

    try {
      console.log(`Intentando ${accion} usuario con ID:`, usuario.id);

      if (nuevoEstado) {
        // Activar usuario - actualizar con isActive: true
        await userService.updateUser(usuario.id, { isActive: true });
        console.log('Usuario activado correctamente');
      } else {
        // Desactivar usuario (NO eliminar, solo marcar como inactivo)
        await userService.updateUser(usuario.id, { isActive: false });
        console.log('Usuario desactivado correctamente');
      }

      await fetchUsers();

      // Mostrar mensaje de éxito
      const mensaje = nuevoEstado ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente';
      setMensajeExito({ visible: true, texto: mensaje });

      // Ocultar después de 3 segundos
      setTimeout(() => {
        setMensajeExito({ visible: false, texto: '' });
      }, 3000);

    } catch (err) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.message || err.message || 'Error desconocido';
      alert(`❌ Error al ${accion} usuario: ${errorMsg}`);
    }
  };

  const cancelarCambiarEstado = () => {
    setModalEliminar({ visible: false, usuario: null });
  };

  const limpiarInactivos = async () => {
    try {
      // Validar que haya contraseña
      if (!passwordLimpiar) {
        setMensajeError({ visible: true, texto: 'Por favor ingresa tu contraseña' });
        setTimeout(() => {
          setMensajeError({ visible: false, texto: '' });
        }, 3000);
        return;
      }

      // Validar contraseña con el backend
      try {
        const validacion = await userService.verifyPassword(passwordLimpiar);

        if (!validacion.success) {
          setMensajeError({ visible: true, texto: 'Contraseña incorrecta' });
          setTimeout(() => {
            setMensajeError({ visible: false, texto: '' });
          }, 3000);
          return;
        }
      } catch (verifyErr) {
        console.error('Error validando contraseña:', verifyErr);
        setMensajeError({ visible: true, texto: 'Contraseña incorrecta' });
        setTimeout(() => {
          setMensajeError({ visible: false, texto: '' });
        }, 3000);
        return;
      }

      // Cerrar modal
      setModalLimpiarInactivos(false);
      setPasswordLimpiar('');

      // Eliminar usuarios inactivos
      const usuariosInactivos = users.filter(u => !u.isActive);

      for (const usuario of usuariosInactivos) {
        await userService.deleteUser(usuario.id);
      }

      await fetchUsers();

      setMensajeExito({ visible: true, texto: `${usuariosInactivos.length} usuarios inactivos eliminados correctamente` });
      setTimeout(() => {
        setMensajeExito({ visible: false, texto: '' });
      }, 3000);

    } catch (err) {
      console.error('Error al limpiar inactivos:', err);
      setMensajeError({ visible: true, texto: 'Error al eliminar usuarios inactivos' });
      setTimeout(() => {
        setMensajeError({ visible: false, texto: '' });
      }, 3000);
    }
  };

  // local filtering for search input (name, email, phone) and status
  const filteredUsers = useMemo(() => {
    let resultado = users;

    // Filtro por estado
    if (filtroEstado === 'todos') {
      // En "Todos" excluir administradores
      resultado = resultado.filter(u => u.role !== 'admin');
    } else if (filtroEstado === 'activos') {
      resultado = resultado.filter(u => u.isActive === true && u.role !== 'admin');
    } else if (filtroEstado === 'inactivos') {
      resultado = resultado.filter(u => u.isActive === false && u.role !== 'admin');
    } else if (filtroEstado === 'admins') {
      resultado = resultado.filter(u => u.role === 'admin');
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      resultado = resultado.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    }

    // Ordenar: activos primero, inactivos al final
    resultado.sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });

    return resultado;
  }, [users, searchTerm, filtroEstado]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (_, r) => <div className="col-name">{r.firstName} <span className="col-lastname">{r.lastName}</span></div>,
      responsive: ['xs', 'sm', 'md', 'lg']
    },
    { title: 'Email', dataIndex: 'email', key: 'email', responsive: ['sm', 'md', 'lg'] },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone', responsive: ['md', 'lg'] },
    { title: 'Rol', dataIndex: 'role', key: 'role', responsive: ['sm', 'md', 'lg'] },
    {
      title: 'Activo',
      dataIndex: 'isActive',
      key: 'isActive',
      render: v => (v ? 'Sí' : 'No'),
      responsive: ['sm', 'md', 'lg']
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">Editar</Button>
          {record.isActive ? (
            <Button danger icon={<DeleteOutlined />} onClick={() => mostrarModalCambiarEstado(record)} size="small">Desactivar</Button>
          ) : (
            <Button type="primary" onClick={() => mostrarModalCambiarEstado(record)} size="small" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>Activar</Button>
          )}
        </Space>
      ),
      responsive: ['xs', 'sm']
    }
  ];

  return (
    <div className="usuarios-container">
      {/* Mensaje de éxito flotante */}
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

      {/* Mensaje de error flotante */}
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
          <span style={{ fontSize: '20px', color: '#ff4d4f' }}>✕</span>
          {mensajeError.texto}
        </div>
      )}

      <div className="usuarios-header">
        <div className="usuarios-title">
          <h1 className="usuarios-h1">Gestión de Usuarios</h1>
          <p className="usuarios-sub">Administra los usuarios del sistema</p>
        </div>

        <div className="usuarios-actions">
          <Input
            className="search-input"
            placeholder="Buscar usuarios por nombre, email o teléfono..."
            prefix={<SearchOutlined style={{ color: '#43a047' }} />}
            size="middle"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            aria-label="Buscar usuarios"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            className="btn-new-user"
            aria-label="Crear nuevo usuario"
          >
            Nuevo usuario
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <Tabs
          activeKey={filtroEstado}
          onChange={setFiltroEstado}
          items={[
            {
              key: 'todos',
              label: `Todos (${users.filter(u => u.role !== 'admin').length})`,
            },
            {
              key: 'activos',
              label: `Activos (${users.filter(u => u.isActive && u.role !== 'admin').length})`,
            },
            {
              key: 'inactivos',
              label: `Inactivos (${users.filter(u => !u.isActive && u.role !== 'admin').length})`,
            },
            {
              key: 'admins',
              label: `Admins (${users.filter(u => u.role === 'admin').length})`,
            },
          ]}
          style={{ marginBottom: '20px', flex: 1 }}
        />

        {filtroEstado === 'inactivos' && users.filter(u => !u.isActive).length > 0 && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setModalLimpiarInactivos(true)}
            style={{ marginBottom: '20px' }}
          >
            Limpiar Inactivos
          </Button>
        )}
      </div>

      <div className="usuarios-table-wrap">
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usuarios`
          }}
          scroll={{ x: 'max-content' }}
          className="usuarios-table"
        />
      </div>

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        destroyOnHidden
        className="usuarios-modal"
        width={720}
        title={<div className="modal-title">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</div>}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (editingUser) {
                await userService.updateUser(editingUser.id, values);
                message.success('Usuario actualizado');
              } else {
                await userService.createUser(values);
                message.success('Usuario creado');
              }
              setModalVisible(false);
              form.resetFields();
              fetchUsers();
            } catch (err) {
              console.error(err);
              message.error('Error guardando usuario');
            }
          }}
          initialValues={{ role: 'user', isActive: true }}
        >
          <Form.Item name="firstName" label="Nombre" rules={[{ required: true, message: 'Nombre requerido' }]}>
            <Input size="large" placeholder="Nombre" />
          </Form.Item>

          <Form.Item name="lastName" label="Apellido" rules={[{ required: true, message: 'Apellido requerido' }]}>
            <Input size="large" placeholder="Apellido" />
          </Form.Item>

          <Form.Item name="email" label="Correo" rules={[{ required: true, type: 'email', message: 'Correo inválido' }]}>
            <Input size="large" placeholder="correo@ejemplo.com" />
          </Form.Item>

          <Form.Item name="phone" label="Teléfono">
            <Input size="large" placeholder="(opcional) Teléfono" />
          </Form.Item>

          {!editingUser && (
            <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}>
              <Input.Password size="large" placeholder="Contraseña" />
            </Form.Item>
          )}

          <Form.Item name="role" label="Rol">
            <Select size="large">
              <Select.Option value="user">Usuario</Select.Option>
              <Select.Option value="admin">Administrador</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space wrap>
              <Button onClick={() => { setModalVisible(false); form.resetFields(); }}>Cancelar</Button>
              <Button type="primary" htmlType="submit"> {editingUser ? 'Actualizar' : 'Crear' } </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de confirmación de cambio de estado */}
      <Modal
        title={modalEliminar.usuario?.isActive ? "¿Desactivar usuario?" : "¿Activar usuario?"}
        open={modalEliminar.visible}
        onOk={confirmarCambiarEstado}
        onCancel={cancelarCambiarEstado}
        centered
        okText={modalEliminar.usuario?.isActive ? "Sí, desactivar" : "Sí, activar"}
        cancelText="Cancelar"
        okButtonProps={{
          danger: modalEliminar.usuario?.isActive,
          style: modalEliminar.usuario?.isActive ? {
            backgroundColor: '#ff4d4f',
            borderColor: '#ff4d4f'
          } : {
            backgroundColor: '#52c41a',
            borderColor: '#52c41a'
          }
        }}
      >
        {modalEliminar.usuario && (
          <p>
            ¿Estás seguro que deseas {modalEliminar.usuario.isActive ? 'desactivar' : 'activar'} a <strong>{modalEliminar.usuario.firstName} {modalEliminar.usuario.lastName}</strong>?
          </p>
        )}
      </Modal>

      {/* Modal de limpiar usuarios inactivos */}
      <Modal
        title="⚠️ Limpiar Usuarios Inactivos"
        open={modalLimpiarInactivos}
        onOk={limpiarInactivos}
        onCancel={() => {
          setModalLimpiarInactivos(false);
          setPasswordLimpiar('');
        }}
        centered
        okText="Eliminar Todos"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true,
        }}
      >
        <p style={{ marginBottom: '16px', color: '#ff4d4f', fontWeight: '500' }}>
          Esta acción eliminará permanentemente TODOS los usuarios inactivos ({users.filter(u => !u.isActive).length} usuarios).
        </p>
        <p style={{ marginBottom: '16px' }}>
          Por favor, ingresa tu contraseña para confirmar:
        </p>
        <Input.Password
          placeholder="Contraseña del administrador"
          value={passwordLimpiar}
          onChange={(e) => setPasswordLimpiar(e.target.value)}
          size="large"
        />
      </Modal>
    </div>
  );
}

export default GestionDeUsuarios;