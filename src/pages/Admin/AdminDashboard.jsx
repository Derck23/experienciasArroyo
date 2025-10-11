import React from 'react';
import { Card, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getCurrentUser } from '../../utils/auth';

function AdminDashboard() {
  const user = getCurrentUser();


  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px' 
      }}>
        <h1 style={{ margin: 0, color: '#16a085' }}>
          Panel de Administración
        </h1>
        {/* Botón de cerrar sesión removido; ahora vive sólo en el AdminLayout */}
      </div>

      <Card style={{ marginBottom: '20px' }}>
        <Space direction="vertical" size="small">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserOutlined style={{ fontSize: '20px', color: '#16a085' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                {user?.email}
              </p>
              <p style={{ margin: 0, color: '#16a085', fontSize: '12px', fontWeight: 'bold' }}>
                Nivel: {user?.userLevel?.toUpperCase()}
              </p>
            </div>
          </div>
        </Space>
      </Card>

      <Card title="Bienvenido al Panel de Administración">
        <p>Este es el dashboard para administradores.</p>
        <p>Aquí podrás gestionar usuarios, contenido y configuraciones del sistema.</p>
        <p style={{ color: '#7f8c8d', fontSize: '14px', marginTop: '20px' }}>
          💡 Próximamente: Gestión de usuarios, estadísticas, configuraciones...
        </p>
      </Card>
    </div>
  );
}

export default AdminDashboard;
