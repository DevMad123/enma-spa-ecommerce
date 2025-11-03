import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useAppSettings } from '@/Hooks/useAppSettings';
import {
    HiOutlineArrowLeft,
    HiOutlineMail,
    HiOutlineShoppingCart,
    HiOutlineUser,
    HiOutlineBell,
    HiOutlineExternalLink,
    HiOutlineEye,
    HiOutlineClock
} from 'react-icons/hi';

const NOTIFICATION_ICONS = {
    contact_message: HiOutlineMail,
    new_order: HiOutlineShoppingCart,
    new_user: HiOutlineUser,
};

const NOTIFICATION_COLORS = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
};

export default function NotificationShow({ notification }) {
    const { formatCurrency, formatDate, formatDateTime, formatNumber } = useAppSettings();
    const IconComponent = NOTIFICATION_ICONS[notification.type] || HiOutlineBell;
    const colorClass = NOTIFICATION_COLORS[notification.color] || NOTIFICATION_COLORS.blue;

    // Fonction pour détecter si une valeur est une date valide
    const isValidDate = (value) => {
        if (typeof value !== 'string') return false;
        
        // Patterns de dates courants
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, // MySQL datetime
            /^\d{4}-\d{2}-\d{2}$/, // Date simple
            /^\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY ou MM/DD/YYYY
        ];
        
        const matchesPattern = datePatterns.some(pattern => pattern.test(value));
        if (!matchesPattern) return false;
        
        const date = new Date(value);
        return !isNaN(date.getTime()) && date.getFullYear() > 1900;
    };

    // Fonction pour formater intelligemment les valeurs selon leur type
    const formatValue = (key, value) => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        // Détection des montants/prix (contient price, amount, cost, total, etc.)
        const isPriceField = /price|amount|cost|total|subtotal|tax|shipping|discount/i.test(key);
        
        // Détection des dates (contient date, time, created_at, updated_at, etc.)
        const isDateField = /date|time|created_at|updated_at|_at$/i.test(key);
        
        // Détection des pourcentages
        const isPercentageField = /percent|rate|tax_rate|discount_rate/i.test(key) && typeof value === 'number';

        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : 'Aucun élément';
            } else {
                const entries = Object.entries(value).filter(([k, v]) => v !== null && v !== undefined && v !== '');
                return entries.length > 0 
                    ? entries.map(([k, v]) => `${k}: ${formatValue(k, v)}`).join(', ')
                    : 'Objet vide';
            }
        } else if (typeof value === 'boolean') {
            return value ? 'Oui' : 'Non';
        } else if (typeof value === 'number') {
            if (isPriceField) {
                return formatCurrency(value);
            } else if (isPercentageField) {
                return `${value}%`;
            } else {
                return formatNumber(value);
            }
        } else if (typeof value === 'string') {
            if (isPriceField && !isNaN(parseFloat(value))) {
                return formatCurrency(parseFloat(value));
            } else if (isDateField || isValidDate(value)) {
                // Essayer de parser comme date
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return formatDateTime(value);
                }
            }
            return String(value);
        } else {
            return String(value);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Notification - ${notification.title}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <Link
                            href={route('admin.notifications.index')}
                            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <HiOutlineArrowLeft className="h-4 w-4 mr-2" />
                            Retour aux notifications
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-6 border-b border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className={`flex-shrink-0 p-3 rounded-full ${colorClass}`}>
                                    <IconComponent className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {notification.title}
                                        </h1>
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <HiOutlineEye className="h-3 w-3 mr-1" />
                                                Lu
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                                        <span className="flex items-center">
                                            <HiOutlineClock className="h-4 w-4 mr-1" />
                                            Reçu {notification.time_ago}
                                        </span>
                                        <span>
                                            {formatDateTime(notification.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>

                            {/* Métadonnées/Données */}
                            {import.meta.env.DEV && console.log('Notification:', notification)}
                            {notification.data && Object.keys(notification.data).length > 0 && (
                                <div className="mt-8 border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Détails</h3>
                                    
                                    {/* Informations spéciales pour les commandes */}
                                    {notification.type === 'new_order' && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <HiOutlineShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                                                <h4 className="font-medium text-blue-900">Informations de la commande</h4>
                                            </div>
                                            <div className="text-sm text-blue-800">
                                                <p>Une nouvelle commande a été passée sur votre boutique.</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Informations spéciales pour les messages de contact */}
                                    {notification.type === 'contact_message' && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <HiOutlineMail className="h-5 w-5 text-green-600 mr-2" />
                                                <h4 className="font-medium text-green-900">Message de contact</h4>
                                            </div>
                                            <div className="text-sm text-green-800">
                                                <p>Un nouveau message de contact a été reçu.</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Informations spéciales pour les nouveaux utilisateurs */}
                                    {notification.type === 'new_user' && (
                                        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <HiOutlineUser className="h-5 w-5 text-purple-600 mr-2" />
                                                <h4 className="font-medium text-purple-900">Nouvel utilisateur</h4>
                                            </div>
                                            <div className="text-sm text-purple-800">
                                                <p>Un nouvel utilisateur s'est inscrit sur votre site.</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {(() => {
                                                try {
                                                    const parsedData = JSON.parse(notification.data);
                                                    return Object.entries(parsedData).map(([key, value]) => {
                                                        if (value === null || value === undefined || value === '') {
                                                            return null;
                                                        }
                                                        
                                                        // Formatage des clés pour un affichage lisible
                                                        const formattedKey = key
                                                            .replace(/_/g, ' ')
                                                            .replace(/\b\w/g, l => l.toUpperCase());
                                                        
                                                        // Utilisation de notre fonction de formatage intelligente
                                                        const formattedValue = formatValue(key, value);
                                                        
                                                        return (
                                                            <div key={key}>
                                                                <dt className="text-sm font-medium text-gray-500">
                                                                    {formattedKey}
                                                                </dt>
                                                                <dd className="mt-1 text-sm text-gray-900 break-words">
                                                                    {formattedValue}
                                                                </dd>
                                                            </div>
                                                        );
                                                    }).filter(Boolean);
                                                } catch (error) {
                                                    console.error('Erreur lors du parsing des données JSON:', error);
                                                    return (
                                                        <div className="col-span-2">
                                                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                                                                <p className="font-medium">Erreur de formatage des données</p>
                                                                <p className="mt-1">Les données de cette notification ne peuvent pas être affichées correctement.</p>
                                                                <details className="mt-2">
                                                                    <summary className="cursor-pointer text-red-700 hover:text-red-800">
                                                                        Données brutes (cliquez pour voir)
                                                                    </summary>
                                                                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                                                                        {notification.data}
                                                                    </pre>
                                                                </details>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </dl>
                                    </div>
                                </div>
                            )}

                            {/* Message quand il n'y a pas de données supplémentaires */}
                            {(() => {
                                try {
                                    const hasData = notification.data && Object.keys(JSON.parse(notification.data || '{}')).length > 0;
                                    if (!hasData) {
                                        return (
                                            <div className="mt-8 border-t border-gray-200 pt-6">
                                                <div className="text-center py-6">
                                                    <div className="text-gray-400 mb-2">
                                                        <HiOutlineBell className="h-12 w-12 mx-auto" />
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Aucune donnée supplémentaire disponible pour cette notification.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                } catch (error) {
                                    // En cas d'erreur JSON, ne pas afficher le message "pas de données"
                                    return null;
                                }
                            })()}

                            {/* Actions */}
                            {notification.action_url && (
                                <div className="mt-8 border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                                    <div className="flex space-x-3">
                                        <Link
                                            href={notification.action_url}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <HiOutlineExternalLink className="h-4 w-4 mr-2" />
                                            Voir l'élément concerné
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
