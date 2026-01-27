import { useCallback, useRef } from 'react';
import { useNotification } from './NotificationProvider';

/**
 * Hook personnalisé pour gérer les notifications avec fonctionnalités avancées
 * 
 * Features:
 * - Déduplication automatique des notifications similaires
 * - Groupement de notifications multiples
 * - Throttling pour éviter le spam
 * - Notifications empilables avec compteur
 */
export const useAdvancedNotifications = () => {
    const notification = useNotification();
    const throttleMap = useRef(new Map());
    const groupCounters = useRef(new Map());

    /**
     * Affiche une notification avec throttling
     * Empêche l'affichage de notifications identiques trop rapidement
     */
    const showThrottled = useCallback((type, message, title, options = {}, throttleMs = 2000) => {
        const key = `${type}-${message}`;
        const now = Date.now();
        const lastShown = throttleMap.current.get(key);

        if (lastShown && now - lastShown < throttleMs) {
            return null;
        }

        throttleMap.current.set(key, now);
        
        const showMethod = notification[`show${type.charAt(0).toUpperCase() + type.slice(1)}`];
        if (showMethod) {
            return showMethod(message, title, options);
        }
        
        return notification.addNotification({ type, message, title, ...options });
    }, [notification]);

    /**
     * Affiche une notification groupée avec compteur
     * Utile pour montrer plusieurs actions similaires (ex: "3 articles ajoutés au panier")
     */
    const showGrouped = useCallback((groupKey, type, message, title, options = {}) => {
        const currentCount = groupCounters.current.get(groupKey) || 0;
        const newCount = currentCount + 1;
        groupCounters.current.set(groupKey, newCount);

        let displayMessage = message;
        if (newCount > 1) {
            displayMessage = `${message} (×${newCount})`;
        }

        const notificationId = notification.addNotification({
            type,
            message: displayMessage,
            title,
            groupKey,
            ...options,
        });

        // Reset le compteur après un délai
        setTimeout(() => {
            groupCounters.current.set(groupKey, 0);
        }, options.duration || 5000);

        return notificationId;
    }, [notification]);

    /**
     * Affiche une notification de succès avec animation spéciale
     */
    const showSuccessWithAnimation = useCallback((message, title, options = {}) => {
        return notification.showSuccess(message, title, {
            ...options,
            className: 'animate-bounce-in',
        });
    }, [notification]);

    /**
     * Affiche une notification d'erreur persistante (ne disparaît pas automatiquement)
     */
    const showPersistentError = useCallback((message, title, options = {}) => {
        return notification.showError(message, title, {
            ...options,
            duration: 0, // Ne disparaît pas automatiquement
        });
    }, [notification]);

    /**
     * Affiche une série de notifications avec un délai entre chacune
     */
    const showSequence = useCallback(async (notifications, delayMs = 500) => {
        const ids = [];
        for (const notif of notifications) {
            const id = notification.addNotification(notif);
            ids.push(id);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        return ids;
    }, [notification]);

    /**
     * Affiche une notification de chargement qui peut être mise à jour
     */
    const showLoading = useCallback((message, title = 'Chargement...') => {
        return notification.showInfo(message, title, {
            duration: 0,
            groupKey: 'loading',
        });
    }, [notification]);

    /**
     * Met à jour une notification de chargement en succès
     */
    const updateLoadingToSuccess = useCallback((message, title = 'Terminé !') => {
        notification.removeNotification('loading');
        return notification.showSuccess(message, title);
    }, [notification]);

    /**
     * Met à jour une notification de chargement en erreur
     */
    const updateLoadingToError = useCallback((message, title = 'Erreur') => {
        notification.removeNotification('loading');
        return notification.showError(message, title);
    }, [notification]);

    /**
     * Affiche une notification avec action (bouton)
     */
    const showWithAction = useCallback((type, message, actionLabel, onAction, options = {}) => {
        const messageWithAction = (
            <div className="flex flex-col space-y-2">
                <span>{message}</span>
                <button
                    onClick={onAction}
                    className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                    {actionLabel}
                </button>
            </div>
        );

        return notification.addNotification({
            type,
            message: messageWithAction,
            ...options,
        });
    }, [notification]);

    /**
     * Affiche une notification de progression
     */
    const showProgress = useCallback((message, progress, title = null) => {
        const messageWithProgress = (
            <div className="space-y-2">
                <span>{message}</span>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs">{progress}%</span>
            </div>
        );

        return notification.showInfo(messageWithProgress, title, {
            duration: 0,
            groupKey: 'progress',
        });
    }, [notification]);

    return {
        ...notification,
        showThrottled,
        showGrouped,
        showSuccessWithAnimation,
        showPersistentError,
        showSequence,
        showLoading,
        updateLoadingToSuccess,
        updateLoadingToError,
        showWithAction,
        showProgress,
    };
};

export default useAdvancedNotifications;
