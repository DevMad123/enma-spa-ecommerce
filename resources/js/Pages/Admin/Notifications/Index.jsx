import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    HiOutlineBell,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineCheck,
    HiOutlineFilter,
    HiOutlineRefresh,
    HiOutlineMail,
    HiOutlineShoppingCart,
    HiOutlineUser,
    HiOutlineX
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

export default function NotificationIndex({ notifications, stats, filters }) {
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedNotifications(notifications.data.map(n => n.id));
        } else {
            setSelectedNotifications([]);
        }
    };

    const handleSelectNotification = (id) => {
        setSelectedNotifications(prev => 
            prev.includes(id) 
                ? prev.filter(n => n !== id)
                : [...prev, id]
        );
    };

    const handleMarkAsRead = async (id) => {
        try {
            await router.put(route('admin.notifications.read', id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['notifications', 'stats'] });
                }
            });
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        setProcessing(true);
        try {
            await router.put(route('admin.notifications.mark-all-read'), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['notifications', 'stats'] });
                },
                onFinish: () => setProcessing(false)
            });
        } catch (error) {
            console.error('Erreur lors du marquage de toutes comme lues:', error);
            setProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedNotifications.length === 0) return;
        
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedNotifications.length} notification(s) ?`)) {
            return;
        }

        setProcessing(true);
        try {
            await router.post(route('admin.notifications.bulk-delete'), {
                ids: selectedNotifications
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedNotifications([]);
                    router.reload({ only: ['notifications', 'stats'] });
                },
                onFinish: () => setProcessing(false)
            });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setProcessing(false);
        }
    };

    const handleFilter = (type, value) => {
        const params = { ...filters };
        if (value === '') {
            delete params[type];
        } else {
            params[type] = value;
        }
        
        router.get(route('admin.notifications.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getNotificationIcon = (type) => {
        const IconComponent = NOTIFICATION_ICONS[type] || HiOutlineBell;
        return IconComponent;
    };

    return (
        <AdminLayout>
            <Head title="Notifications" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="mt-2 text-gray-600">
                                Gérez toutes vos notifications administratives
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <HiOutlineFilter className="h-4 w-4 mr-2" />
                                Filtres
                            </button>
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={processing || stats.unread === 0}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineCheck className="h-4 w-4 mr-2" />
                                Tout marquer comme lu
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <HiOutlineBell className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <HiOutlineEye className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Non lues</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <HiOutlineRefresh className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    {showFilters && (
                        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                    <select
                                        value={filters.type || ''}
                                        onChange={(e) => handleFilter('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Tous les types</option>
                                        <option value="contact_message">Messages de contact</option>
                                        <option value="new_order">Nouvelles commandes</option>
                                        <option value="new_user">Nouveaux utilisateurs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                    <select
                                        value={filters.read || ''}
                                        onChange={(e) => handleFilter('read', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Toutes</option>
                                        <option value="false">Non lues</option>
                                        <option value="true">Lues</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            router.get(route('admin.notifications.index'), {}, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Réinitialiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions bulk */}
                {selectedNotifications.length > 0 && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800">
                                {selectedNotifications.length} notification(s) sélectionnée(s)
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={processing}
                                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    <HiOutlineTrash className="h-4 w-4 mr-1" />
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => setSelectedNotifications([])}
                                    className="flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <HiOutlineX className="h-4 w-4 mr-1" />
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Liste des notifications */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    {notifications.data.length > 0 ? (
                        <>
                            {/* Header du tableau */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.length === notifications.data.length && notifications.data.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                        Sélectionner tout
                                    </span>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="divide-y divide-gray-200">
                                {notifications.data.map((notification) => {
                                    const IconComponent = getNotificationIcon(notification.type);
                                    const colorClass = NOTIFICATION_COLORS[notification.color] || NOTIFICATION_COLORS.blue;
                                    
                                    return (
                                        <div key={notification.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNotifications.includes(notification.id)}
                                                    onChange={() => handleSelectNotification(notification.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                
                                                <div className={`flex-shrink-0 p-2 rounded-full ${colorClass}`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <div className="flex items-center space-x-2">
                                                            {!notification.is_read && (
                                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                {notification.time_ago}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex-shrink-0 flex items-center space-x-2">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Marquer comme lu"
                                                        >
                                                            <HiOutlineCheck className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {notification.action_url && (
                                                        <Link
                                                            href={route('admin.notifications.show', notification.id)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Voir"
                                                        >
                                                            <HiOutlineEye className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {notifications.links && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Affichage de {notifications.from} à {notifications.to} sur {notifications.total} résultats
                                        </div>
                                        <div className="flex space-x-1">
                                            {notifications.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : link.url
                                                            ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                            : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <HiOutlineBell className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-sm font-medium text-gray-900">Aucune notification</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Vous n'avez aucune notification pour le moment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}