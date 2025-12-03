import React, { useState, useEffect } from 'react'
import { App as AntApp } from 'antd'
import AppRoutes from './routes'
import SplashScreen from './components/SplashScreen/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasShownSplash, setHasShownSplash] = useState(false);

  useEffect(() => {
    // Verificar si ya se mostró el splash en esta sesión
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
      setHasShownSplash(true);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setHasShownSplash(true);
    sessionStorage.setItem('splashShown', 'true');
  };

  return (
    <AntApp>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && <AppRoutes />}
    </AntApp>
  )
}

export default App
