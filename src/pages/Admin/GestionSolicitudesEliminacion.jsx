import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, message, Space, Tag, Input, Select, Tooltip, Card, Statistic
} from 'antd';
import {
  DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  SearchOutlined, EyeOutlined, ExclamationCircleOutlined,
  UserDeleteOutlined, MailOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import deletionRequestService from '../../service/deletionRequestService';
import './GestionSolicitudesEliminacion.css';

const { TextArea } = Input;
const { Option } = Select;

function GestionSolicitudesEliminacion() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [actionReason, setActionReason] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0
  });

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const resp = await deletionRequestService.listDeletionRequests(filters);
      const data = resp.data || [];
      setRequests(data);

      // Calcular estadísticas
      setEstadisticas({
        total: data.length,
        pendientes: data.filter(r => r.status === 'pending').length,
        aprobadas: data.filter(r => r.status === 'approved').length,
        rechazadas: data.filter(r => r.status === 'rejected').length
      });
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      message.error('Error al cargar las solicitudes de eliminación');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = () => {
    fetchRequests();
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedRequest(record);
    setActionType('approve');
    setActionReason('');
    setActionModalVisible(true);
  };

  const handleReject = (record) => {
    setSelectedRequest(record);
    setActionType('reject');
    setActionReason('');
    setActionModalVisible(true);
  };

  const confirmAction = async () => {
    if (actionType === 'reject' && !actionReason.trim()) {
      message.warning('Debes proporcionar un motivo para rechazar la solicitud');
      return;
    }

    setLoading(true);
    try {
      console.log(`🎯 Procesando acción: ${actionType} para solicitud ID:`, selectedRequest.id);
      
      if (actionType === 'approve') {
        const response = await deletionRequestService.approveDeletionRequest(
          selectedRequest.id, 
          actionReason
        );
        console.log('✅ Solicitud aprobada:', response);
        message.success('Solicitud aprobada. Se enviará un correo de confirmación al usuario.');
      } else {
        const response = await deletionRequestService.rejectDeletionRequest(
          selectedRequest.id, 
          actionReason
        );
        console.log('✅ Solicitud rechazada:', response);
        message.success('Solicitud rechazada. Se enviará un correo al usuario explicando el motivo.');
      }

      setActionModalVisible(false);
      setSelectedRequest(null);
      setActionReason('');
      await fetchRequests();
    } catch (error) {
      console.error('❌ Error al procesar solicitud:', error);
      console.error('❌ Respuesta del servidor:', error.response);
      
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Error al procesar la solicitud';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Pendiente', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', text: 'Aprobada', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: 'Rechazada', icon: <CloseCircleOutlined /> },
      cancelled: { color: 'default', text: 'Cancelada', icon: <CloseCircleOutlined /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Usuario',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Fecha de Solicitud',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          {text || 'No especificado'}
        </Tooltip>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Aprobar">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Rechazar">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="gestion-solicitudes-container">
      <div className="gestion-solicitudes-header">
        <div className="header-title">
          <UserDeleteOutlined className="header-icon" />
          <div>
            <h1>Gestión de Solicitudes de Eliminación</h1>
            <p>Administra las solicitudes de eliminación de cuenta de usuarios</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-container">
        <Card>
          <Statistic
            title="Total de Solicitudes"
            value={estadisticas.total}
            prefix={<UserDeleteOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Pendientes"
            value={estadisticas.pendientes}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Aprobadas"
            value={estadisticas.aprobadas}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Rechazadas"
            value={estadisticas.rechazadas}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <Input
          placeholder="Buscar por nombre o email..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
        >
          <Option value="all">Todos los estados</Option>
          <Option value="pending">Pendientes</Option>
          <Option value="approved">Aprobadas</Option>
          <Option value="rejected">Rechazadas</Option>
          <Option value="cancelled">Canceladas</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} solicitudes`,
        }}
      />

      {/* Modal de Detalles */}
      <Modal
        title="Detalles de la Solicitud"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        {selectedRequest && (
          <div className="request-details">
            <div className="detail-row">
              <strong>Estado:</strong> {getStatusTag(selectedRequest.status)}
            </div>
            <div className="detail-row">
              <strong>ID de Solicitud:</strong> {selectedRequest.id}
            </div>
            <div className="detail-row">
              <strong>Usuario ID:</strong> {selectedRequest.userId}
            </div>
            <div className="detail-row">
              <strong>Nombre Completo:</strong> {selectedRequest.fullName}
            </div>
            <div className="detail-row">
              <strong>Email:</strong> {selectedRequest.email}
            </div>
            <div className="detail-row">
              <strong>Fecha de Solicitud:</strong>{' '}
              {new Date(selectedRequest.createdAt).toLocaleString('es-MX')}
            </div>
            {selectedRequest.processedAt && (
              <div className="detail-row">
                <strong>Fecha de Procesamiento:</strong>{' '}
                {new Date(selectedRequest.processedAt).toLocaleString('es-MX')}
              </div>
            )}
            <div className="detail-row">
              <strong>Motivo del Usuario:</strong>
              <div style={{ marginTop: '8px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                {selectedRequest.reason || 'No especificado'}
              </div>
            </div>
            {selectedRequest.adminNotes && (
              <div className="detail-row">
                <strong>Notas del Administrador:</strong>
                <div style={{ marginTop: '8px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                  {selectedRequest.adminNotes}
                </div>
              </div>
            )}
            {selectedRequest.rejectionReason && (
              <div className="detail-row">
                <strong>Motivo del Rechazo:</strong>
                <div style={{ marginTop: '8px', padding: '10px', background: '#fff2f0', borderRadius: '4px', border: '1px solid #ffccc7' }}>
                  {selectedRequest.rejectionReason}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Acción (Aprobar/Rechazar) */}
      <Modal
        title={
          actionType === 'approve'
            ? '¿Aprobar Solicitud de Eliminación?'
            : '¿Rechazar Solicitud de Eliminación?'
        }
        open={actionModalVisible}
        onOk={confirmAction}
        onCancel={() => {
          setActionModalVisible(false);
          setActionReason('');
        }}
        okText={actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
        cancelText="Cancelar"
        okButtonProps={{
          danger: actionType === 'reject',
          loading: loading,
        }}
        width={600}
      >
        {selectedRequest && (
          <div>
            <p>
              <strong>Usuario:</strong> {selectedRequest.fullName}
            </p>
            <p>
              <strong>Email:</strong> {selectedRequest.email}
            </p>
            <p>
              <strong>Motivo del usuario:</strong> {selectedRequest.reason || 'No especificado'}
            </p>

            {actionType === 'approve' ? (
              <>
                <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '18px', marginRight: '8px' }} />
                <strong>¿Estás seguro de aprobar esta solicitud?</strong>
                <p style={{ marginTop: '10px' }}>
                  Se enviará un correo de confirmación al usuario y su cuenta será eliminada permanentemente
                  junto con todos sus datos asociados.
                </p>
                <TextArea
                  placeholder="Notas adicionales (opcional)..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </>
            ) : (
              <>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px', marginRight: '8px' }} />
                <strong>¿Estás seguro de rechazar esta solicitud?</strong>
                <p style={{ marginTop: '10px' }}>
                  Se enviará un correo al usuario informándole que su solicitud ha sido rechazada
                  con el motivo que proporciones a continuación.
                </p>
                <TextArea
                  placeholder="Motivo del rechazo (obligatorio)*"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  showCount
                  required
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GestionSolicitudesEliminacion;
