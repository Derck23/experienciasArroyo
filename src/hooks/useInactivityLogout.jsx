import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

/**
 * Hook personalizado para cerrar sesión automáticamente después de un período de inactividad
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 60000ms = 1 min)
 * @param {number} warningTime - Tiempo de advertencia antes del cierre en milisegundos (default: 15000ms = 15s)
 */
const useInactivityLogout = (timeout = 60000, warningTime = 15000) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(warningTime / 1000);

  const logout = useCallback(() => {
    console.log('🚪 Cerrando sesión por inactividad...');

    // Limpiar timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowModal(false);

    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Marcar que fue por inactividad para mostrar mensaje en login
    sessionStorage.setItem('logoutReason', 'inactivity');

    // Redirigir al login
    navigate('/login', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Limpiar timers existentes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowModal(false);
    setCountdown(warningTime / 1000);

    console.log('⏱️ Timer de inactividad reiniciado');

    // Configurar timer de advertencia
    warningRef.current = setTimeout(() => {
      console.log('⚠️ Mostrando advertencia de sesión');
      setShowModal(true);
      let timeLeft = warningTime / 1000;
      setCountdown(timeLeft);

      // Countdown
      countdownRef.current = setInterval(() => {
        timeLeft -= 1;
        console.log(`⏳ Countdown: ${timeLeft} segundos`);
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownRef.current);
        }
      }, 1000);
    }, timeout - warningTime);

    // Configurar timer de logout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, timeout);
  }, [timeout, warningTime, logout]);

  useEffect(() => {
    // Eventos que resetean el timer de inactividad
    const events = [
      'mousedown',
      'keypress',
      'click',
      'touchstart'
    ];

    // Agregar event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Iniciar el timer
    resetTimer();

    console.log('🔒 Sistema de inactividad iniciado');

    // Cleanup
    return () => {
      console.log('🧹 Limpiando sistema de inactividad');
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer]);

  return { showModal, countdown, resetTimer };
};

export default useInactivityLogout;
