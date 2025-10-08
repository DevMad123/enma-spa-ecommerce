import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatCurrency, formatDate, getCurrentCurrency, getCurrentCurrencySymbol, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    ArrowLeftIcon, 
    TruckIcon, 
    CurrencyDollarIcon,
    ClockIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function ShippingShow({ shipping }) {
    const { localeConfig } = usePage().props;
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);

    // Initialiser la configuration de locale
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
            setIsLocaleInitialized(true);
        }
    }, [localeConfig]);

    // Afficher un écran de chargement si la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }
    const getStatusBadge = (isActive) => {
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {isActive ? 'Actif' : 'Inactif'}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title={`Mode de livraison - ${shipping.name}`} />

            <div className="mb-6">
                <div className="flex items-center space-x-3">
                    <Link
                        href={route('admin.shippings.index')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Détails du mode de livraison</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Informations détaillées pour "{shipping.name}".
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <TruckIcon className="h-5 w-5 text-indigo-500" />
                                <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
                            </div>
                            <div className="flex space-x-2">
                                <Link
                                    href={route('admin.shippings.edit', shipping.id)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Modifier
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Nom</label>
                                <div className="mt-1 text-sm text-gray-900 font-medium">{shipping.name}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Prix</label>
                                <div className="mt-1 text-sm text-gray-900 font-medium">
                                    {shipping.price == 0 ? (
                                        <span className="text-green-600 font-semibold">Gratuit</span>
                                    ) : (
                                        formatCurrency(shipping.price)
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Délai estimé</label>
                                <div className="mt-1 text-sm text-gray-900">
                                    {shipping.estimated_days 
                                        ? `${shipping.estimated_days} jour${shipping.estimated_days > 1 ? 's' : ''}`
                                        : 'Non défini'
                                    }
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Ordre d'affichage</label>
                                <div className="mt-1 text-sm text-gray-900">#{shipping.sort_order}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Statut</label>
                                <div className="mt-1">
                                    {getStatusBadge(shipping.is_active)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Date de création</label>
                                <div className="mt-1 text-sm text-gray-900">
                                    {formatDate(shipping.created_at)}
                                </div>
                            </div>
                        </div>

                        {shipping.description && (
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <div className="mt-1 text-sm text-gray-900">{shipping.description}</div>
                            </div>
                        )}
                    </div>

                    {/* Aperçu client */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu client</h3>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 flex items-center space-x-2">
                                        <TruckIcon className="h-4 w-4 text-indigo-500" />
                                        <span>{shipping.name}</span>
                                        {!shipping.is_active && (
                                            <span className="text-xs text-red-500">(Inactif)</span>
                                        )}
                                    </div>
                                    {shipping.description && (
                                        <div className="text-sm text-gray-500 mt-1">{shipping.description}</div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">
                                        {shipping.price == 0 ? (
                                            <span className="text-green-600">Gratuit</span>
                                        ) : (
                                            <span>{formatCurrency(shipping.price)}</span>
                                        )}
                                    </div>
                                    {shipping.estimated_days && (
                                        <div className="text-xs text-gray-500 flex items-center justify-end space-x-1 mt-1">
                                            <ClockIcon className="h-3 w-3" />
                                            <span>{shipping.estimated_days} jour{shipping.estimated_days > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
                        <div className="space-y-4">
                            <div className="text-center p-4 bg-indigo-50 rounded-lg">
                                <div className="text-3xl font-bold text-indigo-600">{shipping.sells_count || 0}</div>
                                <div className="text-sm text-gray-600">Commande{(shipping.sells_count || 0) > 1 ? 's' : ''}</div>
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">
                                    {shipping.price == 0 ? '0' : formatCurrency(shipping.price, false)}
                                </div>
                                <div className="text-sm text-gray-600">Prix ({getCurrentCurrencySymbol()})</div>
                            </div>

                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-3xl font-bold text-orange-600">
                                    {shipping.estimated_days || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-600">Délai (jours)</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href={route('admin.shippings.edit', shipping.id)}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Modifier ce mode
                            </Link>

                            {(!shipping.sells_count || shipping.sells_count === 0) && (
                                <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Supprimer ce mode
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Informations système */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations système</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">ID:</span>
                                <span className="font-mono">#{shipping.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Créé le:</span>
                                <span>{formatDate(shipping.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Modifié le:</span>
                                <span>{formatDate(shipping.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}