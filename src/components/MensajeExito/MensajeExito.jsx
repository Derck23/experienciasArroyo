import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleOutlined } from '@ant-design/icons';

const MensajeExito = ({ mensaje, submensaje, onClose, duracion = 2500 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duracion);

        return () => clearTimeout(timer);
    }, [duracion, onClose]);

    return createPortal(
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            color: '#333',
            padding: '20px 28px',
            borderRadius: '12px',
            border: '2px solid #52c41a',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            zIndex: 10000,
            minWidth: '320px',
            maxWidth: '90vw',
            animation: 'slideInDown 0.3s ease-out'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: submensaje ? '8px' : '0'
            }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                <div style={{ fontSize: '17px', fontWeight: '600' }}>
                    {mensaje}
                </div>
            </div>
            {submensaje && (
                <div style={{
                    fontSize: '14px',
                    color: '#666',
                    paddingLeft: '36px'
                }}>
                    {submensaje}
                </div>
            )}
        </div>,
        document.body
    );
};

export default MensajeExito;
