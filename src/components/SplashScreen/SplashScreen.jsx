import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import LogoIcon from '../../Iconos/logo.svg';

const SplashScreen = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Esperar 5 segundos y luego iniciar fade out
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Esperar que termine la animación de fade out
            setTimeout(() => {
                onFinish();
            }, 1000);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    // Generar hojas aleatorias
    const leaves = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 5,
        animationDuration: 4 + Math.random() * 3,
    }));

    return (
        <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
            {/* Hojas cayendo */}
            {leaves.map((leaf) => (
                <div
                    key={leaf.id}
                    className="falling-leaf"
                    style={{
                        left: `${leaf.left}%`,
                        animationDelay: `${leaf.animationDelay}s`,
                        animationDuration: `${leaf.animationDuration}s`,
                    }}
                >
                    🍃
                </div>
            ))}

            {/* Logo animado */}
            <div className="splash-content">
                <div className="logo-container">
                    <img src={LogoIcon} alt="Sierra Explora" className="splash-logo" />
                </div>
                <h1 className="splash-title">SIERRA EXPLORA</h1>
                <p className="splash-subtitle">Experiencias & Tours</p>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
