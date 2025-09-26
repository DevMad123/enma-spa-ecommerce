import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

// Contexte des notifications
const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// Types de notifications
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Configuration des styles pour chaque type
const notificationConfig = {
    [NOTIFICATION_TYPES.SUCCESS]: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: CheckCircleIcon,
        iconColor: 'text-green-400'
    },
    [NOTIFICATION_TYPES.ERROR]: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: XCircleIcon,
        iconColor: 'text-red-400'
    },
    [NOTIFICATION_TYPES.WARNING]: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-400'
    },
    [NOTIFICATION_TYPES.INFO]: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: InformationCircleIcon,
        iconColor: 'text-blue-400'
    }
};

// Composant Notification individuel
const NotificationItem = ({ notification, onRemove }) => {
    const config = notificationConfig[notification.type];
    const IconComponent = config.icon;

    return (
        <div 
            className={`
                ${config.bg} ${config.border} ${config.text}
                border rounded-lg p-4 shadow-lg backdrop-blur-sm
                transform transition-all duration-300 ease-in-out
                animate-slide-in-right hover:scale-102
                max-w-md w-full
            `}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="ml-3 flex-1">
                    {notification.title && (
                        <h3 className="text-sm font-semibold mb-1">
                            {notification.title}
                        </h3>
                    )}
                    <p className="text-sm">
                        {notification.message}
                    </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={() => onRemove(notification.id)}
                        className={`
                            inline-flex rounded-md p-1.5 
                            ${config.text} hover:bg-white/50
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            transition-colors duration-200
                        `}
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Conteneur des notifications
const NotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div 
            aria-live="assertive" 
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <div 
                        key={notification.id} 
                        className="pointer-events-auto"
                    >
                        <NotificationItem 
                            notification={notification} 
                            onRemove={onRemove} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Provider des notifications
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Fonction pour ajouter une notification
    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: NOTIFICATION_TYPES.INFO,
            title: null,
            message: '',
            duration: 5000,
            ...notification
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-suppression après la durée spécifiée
        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    }, []);

    // Fonction pour supprimer une notification
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Fonctions helper pour différents types
    const showSuccess = useCallback((message, title = null, options = {}) => {
        return addNotification({
            type: NOTIFICATION_TYPES.SUCCESS,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showError = useCallback((message, title = null, options = {}) => {
        return addNotification({
            type: NOTIFICATION_TYPES.ERROR,
            title,
            message,
            duration: 7000, // Erreurs restent plus longtemps
            ...options
        });
    }, [addNotification]);

    const showWarning = useCallback((message, title = null, options = {}) => {
        return addNotification({
            type: NOTIFICATION_TYPES.WARNING,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showInfo = useCallback((message, title = null, options = {}) => {
        return addNotification({
            type: NOTIFICATION_TYPES.INFO,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    // Fonction pour vider toutes les notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAll
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer 
                notifications={notifications} 
                onRemove={removeNotification}
            />
        </NotificationContext.Provider>
    );
};