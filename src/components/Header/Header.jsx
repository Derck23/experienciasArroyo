import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../utils/auth';
import { Modal } from 'antd';
import './Header.css';
import ProfileIcon from '../../Iconos/Profile.png';
import FavoritosIcon from '../../Iconos/favoritos.png';
import LogoIcon from '../../Iconos/logo.svg';

const Header = ({ searchTerm, onSearchChange }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
    const menuRef = useRef(null);
    const user = getCurrentUser();

    const isActive = (path) => {
        return location.pathname.includes(path) ? 'nav-link active' : 'nav-link';
    };

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const mostrarModalCerrarSesion = () => {
        setModalCerrarSesion(true);
        setMenuOpen(false);
    };

    const confirmarCerrarSesion = () => {
        logout();
        setModalCerrarSesion(false);
        navigate('/login');
    };

    const cancelarCerrarSesion = () => {
        setModalCerrarSesion(false);
    };

    return (
        <header className="mapa-app-header">
            <div className="header-left">
                <div className="logo-section">
                    <img src={LogoIcon} alt="Sierra Explora" className="logo-img" />
                    <h2 className="logo-title">SIERRA EXPLORA</h2>
                </div>
                <nav className="nav-desktop">
                    <Link to="/experiencia/inicio" className={isActive('/experiencia/inicio')}>Inicio</Link>
                    <Link to="/experiencia/atracciones" className={isActive('/experiencia/atracciones')}>Atracciones</Link>
                    <Link to="/experiencia/eventos" className={isActive('/experiencia/eventos')}>Eventos</Link>
                    <Link to="/experiencia/servicios" className={isActive('/experiencia/servicios')}>Servicios</Link>
                </nav>
            </div>
            <div className="header-right">
                <Link to="/experiencia/mapa" className="btn-icon-header" aria-label="Mapa">
                    🗺️
                </Link>
                <Link to="/experiencia/favoritos" className="btn-icon-header btn-favoritos" aria-label="Favoritos">
                    <img src={FavoritosIcon} alt="Favoritos" className="icon-img" />
                </Link>

                {/* Avatar con menú desplegable */}
                <div className="avatar-container" ref={menuRef}>
                    <div
                        className="avatar-header"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <img src={ProfileIcon} alt="Perfil" className="profile-icon-img" />
                    </div>

                    {/* Menú desplegable */}
                    {menuOpen && (
                        <div className="user-menu-dropdown">
                            <div className="user-menu-info">
                                <div className="user-menu-name">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="user-menu-email">
                                    {user?.email}
                                </div>
                            </div>
                            <Link 
            to="/experiencia/mis-reservaciones" 
            className="user-menu-item"
            onClick={() => setMenuOpen(false)} // Para que se cierre el menú al hacer clic
        >
            <span className="menu-icon">📅</span>
            <span>Mis Reservaciones</span>
        </Link>

                            <div className="user-menu-divider"></div>

                            <button
                                onClick={mostrarModalCerrarSesion}
                                className="user-menu-logout"
                            >
                                <span className="logout-icon">🚪</span>
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmación de cierre de sesión */}
            <Modal
                title="¿Cerrar sesión?"
                open={modalCerrarSesion}
                onOk={confirmarCerrarSesion}
                onCancel={cancelarCerrarSesion}
                centered
                okText="Sí, cerrar sesión"
                cancelText="Cancelar"
                okButtonProps={{
                    danger: true,
                    style: {
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f'
                    }
                }}
            >
                <p>¿Estás seguro que deseas cerrar tu sesión?</p>
            </Modal>
        </header>
    );
};

export default Header;
