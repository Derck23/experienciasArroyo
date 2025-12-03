import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal, message } from 'antd';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook personalizado para manejar el botón atrás del navegador/teléfono (con soporte Capacitor)
 * @param {string} dashboardRoute - Ruta del dashboard (default: '/experiencia')
 */
const useBackButton = (dashboardRoute = '/experiencia') => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    console.log('🔧 Inicializando hook de back button. Plataforma nativa:', isNative);

    let backButtonListener = null;

    // Función para manejar el botón atrás
    const handleBackButton = () => {
      const currentPath = location.pathname;

      console.log('🔙 Botón atrás presionado. Ruta actual:', currentPath);

      // Si estamos en el dashboard, cerrar sesión y redirigir al login
      if (currentPath === dashboardRoute || currentPath === '/experiencia') {
        console.log('🚪 En dashboard, cerrando sesión...');

        // Limpiar sesión
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Mostrar mensaje
        message.success('Cierre de sesión exitoso', 2);

        // Redirigir al login
        navigate('/login', { replace: true });
      } else {
        // Si estamos en cualquier otra página, regresar al dashboard
        console.log('↩️ Regresando al dashboard');
        navigate(dashboardRoute, { replace: true });
      }
    };

    // Para apps nativas (Android/iOS)
    if (isNative) {
      console.log('📱 Registrando listener de Capacitor backButton');

      // Usar la API de Capacitor correctamente
      const setupListener = async () => {
        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          console.log('📱 Evento backButton de Capacitor disparado. CanGoBack:', canGoBack);

          // Prevenir el comportamiento por defecto
          handleBackButton();
        });

        console.log('✅ Listener de backButton registrado correctamente');
      };

      setupListener();
    } else {
      // Para navegador web (fallback)
      console.log('🌐 Registrando listener de popstate para navegador');

      const handlePopState = (event) => {
        console.log('📍 PopState event disparado!');
        event.preventDefault();
        event.stopPropagation();
        handleBackButton();
      };

      // Prevenir navegación hacia atrás agregando entrada al historial
      window.history.pushState(null, '', location.pathname);

      // Agregar listener
      window.addEventListener('popstate', handlePopState, false);

      // También agregar al hashchange por si acaso
      const handleHashChange = (event) => {
        console.log('📍 HashChange event disparado!');
        event.preventDefault();
        handleBackButton();
      };
      window.addEventListener('hashchange', handleHashChange, false);

      // Cleanup para navegador
      return () => {
        console.log('🧹 Limpiando listeners de navegador');
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('hashchange', handleHashChange);
      };
    }

    // Cleanup para app nativa
    return () => {
      if (backButtonListener) {
        console.log('🧹 Limpiando listener de Capacitor backButton');
        backButtonListener.remove();
      }
    };
  }, [location.pathname, navigate, dashboardRoute, isNative]);
};

export default useBackButton;
