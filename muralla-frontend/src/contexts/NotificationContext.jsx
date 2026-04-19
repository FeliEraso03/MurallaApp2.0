import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="notification-container">
                {notifications.map(n => (
                    <div key={n.id} className={`notification-toast ${n.type}`} onClick={() => removeNotification(n.id)}>
                        <div className="notification-icon">
                            {n.type === 'success' && '✓'}
                            {n.type === 'error' && '✕'}
                            {n.type === 'info' && 'ℹ'}
                        </div>
                        <div className="notification-message">{n.message}</div>
                        <div className="notification-close">×</div>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
