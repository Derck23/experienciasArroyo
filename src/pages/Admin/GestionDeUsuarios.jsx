import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Button, Modal, message, Space, Form, Input, Select, Switch
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined
} from '@ant-design/icons';
import userService from '../../service/userService';
import './GestionDeUsuarios.css';

function GestionDeUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Desactivar usuario',
      content: `¿Desactivar a ${record.firstName} ${record.lastName}?`,
      onOk: async () => {
        try {
          await userService.deleteUser(record.id);
          message.success('Usuario desactivado');
          fetchUsers();
        } catch (err) {
          console.error(err);
          message.error('Error desactivando usuario');
        }
      }
    });
  };

  // local filtering for search input (name, email, phone)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const q = searchTerm.toLowerCase().trim();
    return users.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

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
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} size="small">Desactivar</Button>
        </Space>
      ),
      responsive: ['xs', 'sm']
    }
  ];

  return (
    <div className="usuarios-container">
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
        destroyOnClose
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
    </div>
  );
}

export default GestionDeUsuarios;