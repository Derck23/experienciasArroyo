import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ShopOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { logout, getCurrentUser } from '../../utils/auth';
import imagenLogin from '../../assets/imagenLogin.jpg';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSiderVisible, setMobileSiderVisible] = useState(false); // NUEVO

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 600;
      setIsMobile(mobile);
      setCollapsed(window.innerWidth < 900);
      if (!mobile) setMobileSiderVisible(false); // Cierra el menu si sales de mobile
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Mi Perfil' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar Sesión', onClick: handleLogout, danger: true },
  ];

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Usuarios',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '/admin/servicios',
      icon: <CustomerServiceOutlined />,
      label: 'Servicios',
      onClick: () => navigate('/admin/servicios'),
    },
    {
      key: '/admin/attractions',
      icon: <EnvironmentOutlined />,
      label: 'Atracciones',
      onClick: () => navigate('/admin/attractions')
    },
    {
      key: '/admin/eventos',
      icon: <CalendarOutlined />,
      label: 'Eventos',
      onClick: () => navigate('/admin/eventos'),
    },
    {
      key: '/admin/reservaciones',
      icon: <ScheduleOutlined />,
      label: 'Reservaciones',
      onClick: () => navigate('/admin/reservaciones'),
    },
  ];

  // NUEVO: Función para abrir/cerrar el menú en móvil
  const handleMobileMenuToggle = () => {
    setMobileSiderVisible(!mobileSiderVisible);
  };

  return (
    <Layout className="admin-layout">
      {/* Sider como overlay solo en móviles */}
      <Sider
        className={`admin-sider${isMobile ? ' admin-sider--mobile' : ''}${mobileSiderVisible ? ' admin-sider--visible' : ''}`}
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="md"
        onBreakpoint={(broken) => setCollapsed(broken)}
        width={240}
        collapsedWidth={80}
      >
        <div className={`brand ${collapsed ? 'brand--collapsed' : ''}`}>
          <div className="brand__logo">
            <DashboardOutlined />
          </div>
          <span className="brand__title">Arroyo Seco</span>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="sidebar-menu"
        />
      </Sider>

      {/* Overlay para cerrar el Sider tocando fuera */}
      {isMobile && mobileSiderVisible && (
        <div
          className="admin-sider-overlay"
          onClick={() => setMobileSiderVisible(false)}
          tabIndex={-1}
        />
      )}

      <Layout className="admin-main">
        <Header className="admin-header" role="banner">
          <div className="admin-header__left">
            {/* Botón SIEMPRE visible en mobile para mostrar/ocultar el menú */}
            <button
              aria-label={mobileSiderVisible ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
              aria-disabled={false}
              title={mobileSiderVisible ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
              className="toggle-button"
              onClick={isMobile ? handleMobileMenuToggle : () => setCollapsed(!collapsed)}
              type="button"
            >
              {mobileSiderVisible || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </div>

          <div className="admin-header__right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="user-dropdown" role="button" tabIndex={0}>
                <Avatar size={40} className="user-avatar" icon={<UserOutlined />} />
                <div className="user-meta">
                  <span className="user-name">{user?.firstName} {user?.lastName}</span>
                  <span className="user-role">{user?.role === 'admin' ? 'Admin' : 'Usuario'}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          className="admin-content"
          aria-live="polite"
          style={{ ['--bg-image']: `url(${imagenLogin})` }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;