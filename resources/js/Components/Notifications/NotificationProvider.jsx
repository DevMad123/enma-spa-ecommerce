import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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

// Composant Notification individuel avec barre de progression
const NotificationItem = ({ notification, onRemove }) => {
    const config = notificationConfig[notification.type];
    const IconComponent = config.icon;
    const [progress, setProgress] = useState(100);
    const [isLeaving, setIsLeaving] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (notification.duration > 0) {
            // Animation de la barre de progression
            const interval = 50; // Update every 50ms
            const decrementValue = (100 / notification.duration) * interval;
            
            timerRef.current = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - decrementValue;
                    if (newProgress <= 0) {
                        setIsLeaving(true);
                        setTimeout(() => onRemove(notification.id), 300);
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return newProgress;
                });
            }, interval);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [notification.duration, notification.id, onRemove]);

    const handleClose = () => {
        setIsLeaving(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setTimeout(() => onRemove(notification.id), 300);
    };

    const handleMouseEnter = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const handleMouseLeave = () => {
        if (notification.duration > 0 && progress > 0) {
            const interval = 50;
            const decrementValue = (100 / notification.duration) * interval;
            
            timerRef.current = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - decrementValue;
                    if (newProgress <= 0) {
                        setIsLeaving(true);
                        setTimeout(() => onRemove(notification.id), 300);
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return newProgress;
                });
            }, interval);
        }
    };

    return (
        <div 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
                ${config.bg} ${config.border} ${config.text}
                border rounded-lg shadow-lg backdrop-blur-sm
                transform transition-all duration-300 ease-in-out
                max-w-md w-full overflow-hidden relative
                ${isLeaving ? 'animate-slide-out-right opacity-0' : 'animate-slide-in-right'}
                hover:shadow-xl hover:scale-[1.02]
            `}
        >
            {/* Barre de progression */}
            {notification.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 bg-opacity-30">
                    <div 
                        className={`h-full ${config.iconColor.replace('text-', 'bg-')} transition-all ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <IconComponent className={`h-6 w-6 ${config.iconColor} animate-bounce-in`} />
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
                            onClick={handleClose}
                            className={`
                                inline-flex rounded-md p-1.5 
                                ${config.text} hover:bg-white/50
                                focus:outline-none focus:ring-2 focus:ring-offset-2
                                transition-all duration-200 hover:rotate-90
                            `}
                            aria-label="Fermer la notification"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
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
    const notificationQueue = useRef([]);

    // Fonction pour ajouter une notification avec déduplication
    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: NOTIFICATION_TYPES.INFO,
            title: null,
            message: '',
            duration: 5000,
            groupKey: null, // Pour déduplication
            ...notification
        };

        // Déduplication: si une notification avec la même groupKey existe déjà, on la met à jour
        if (newNotification.groupKey) {
            setNotifications(prev => {
                const existingIndex = prev.findIndex(n => n.groupKey === newNotification.groupKey);
                if (existingIndex !== -1) {
                    // Remplace la notification existante
                    const updated = [...prev];
                    updated[existingIndex] = { ...newNotification, id: prev[existingIndex].id };
                    return updated;
                }
                return [...prev, newNotification];
            });
        } else {
            setNotifications(prev => [...prev, newNotification]);
        }

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