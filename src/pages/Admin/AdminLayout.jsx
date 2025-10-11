import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Layout, Menu } from 'antd';
import { LogoutOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { logout, getCurrentUser } from '../../utils/auth';

const { Header, Content, Footer } = Layout;

function AdminLayout() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2 style={{ margin: 0, color: '#16a085' }}>Admin</h2>
                    <Menu mode="horizontal" selectable={false} items={[
                        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/admin/dashboard') },
                        { key: 'gestion-usuarios', icon: <UserOutlined />, label: 'Gestión de Usuarios', onClick: () => navigate('/admin/users') }
                    ]} />
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                        <span style={{ fontWeight: 600 }}>{user?.firstName} {user?.lastName}</span>
                        <span style={{ fontSize: 12, color: '#7f8c8d' }}>{user?.email}</span>
                    </div>
                    <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </div>
            </Header>

            <Content style={{ padding: '24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', background: '#fff' }}>
                <div style={{ color: '#7f8c8d' }}>© {new Date().getFullYear()} Experiencias Arroyo — Panel de Administración</div>
            </Footer>
        </Layout>
    );
}

export default AdminLayout;
