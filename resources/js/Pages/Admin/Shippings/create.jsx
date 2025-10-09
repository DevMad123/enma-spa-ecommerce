import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatCurrency, formatDate, getCurrentCurrency, getCurrentCurrencySymbol, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    ArrowLeftIcon, 
    TruckIcon, 
    CurrencyDollarIcon,
    ClockIcon,
    ListBulletIcon,
    DocumentTextIcon,
    GiftIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

export default function ShippingCreate() {
    const { localeConfig } = usePage().props;
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        price: '',
        description: '',
        estimated_days: '',
        sort_order: '',
        is_active: true,
        supports_free_shipping: false,
        free_shipping_threshold: '',
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('admin.shippings.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Nouveau mode de livraison" />

            <div className="mb-6">
                <div className="flex items-center space-x-3">
                    <Link
                        href={route('admin.shippings.index')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau mode de livraison</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Ajouter un nouveau mode de livraison pour vos commandes.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations principales */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <TruckIcon className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-lg font-medium text-gray-900">Informations principales</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom du mode de livraison *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ex: Livraison Standard, Express..."
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prix ({getCurrentCurrencySymbol()}) *
                                </label>
                                <div className="relative">
                                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        className={`w-full border rounded-md pl-10 pr-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                            errors.price ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Saisissez 0 pour une livraison gratuite
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Délai estimé (jours)
                                </label>
                                <div className="relative">
                                    <ClockIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.estimated_days}
                                        onChange={(e) => setData('estimated_days', e.target.value)}
                                        placeholder="Ex: 2, 5, 7..."
                                        className={`w-full border rounded-md pl-10 pr-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                            errors.estimated_days ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                </div>
                                {errors.estimated_days && (
                                    <p className="mt-1 text-sm text-red-600">{errors.estimated_days}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Configuration */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <ListBulletIcon className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-lg font-medium text-gray-900">Configuration</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ordre d'affichage
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                    placeholder="1, 2, 3..."
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                        errors.sort_order ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.sort_order && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Plus le nombre est petit, plus le mode sera affiché en premier
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Mode actif</span>
                                </label>
                                <p className="mt-1 text-xs text-gray-500 ml-6">
                                    {data.is_active 
                                        ? 'Ce mode sera proposé aux clients' 
                                        : 'Ce mode ne sera pas visible pour les clients'
                                    }
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <div className="relative">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Décrivez ce mode de livraison (optionnel)..."
                                        rows={4}
                                        className={`w-full border rounded-md pl-10 pr-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
                                            errors.description ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                </div>
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Livraison gratuite */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <GiftIcon className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-medium text-gray-900">Livraison gratuite</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={data.supports_free_shipping}
                                    onChange={(e) => setData('supports_free_shipping', e.target.checked)}
                                    className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Supporte la livraison gratuite
                                </span>
                            </label>
                            <p className="mt-1 text-xs text-gray-500 ml-6">
                                {data.supports_free_shipping 
                                    ? 'Cette méthode de livraison peut devenir gratuite selon le montant du panier' 
                                    : 'Cette méthode de livraison garde toujours son prix fixe'
                                }
                            </p>
                        </div>

                        {data.supports_free_shipping && (
                            <div className="ml-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-emerald-800 mb-1">
                                        Seuil de livraison gratuite ({getCurrentCurrencySymbol()})
                                    </label>
                                    <div className="relative">
                                        <SparklesIcon className="h-5 w-5 text-emerald-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="number"
                                            step="1000"
                                            min="0"
                                            value={data.free_shipping_threshold}
                                            onChange={(e) => setData('free_shipping_threshold', e.target.value)}
                                            placeholder="Ex: 50000, 75000..."
                                            className={`w-full border rounded-md pl-10 pr-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                errors.free_shipping_threshold ? 'border-red-300' : 'border-emerald-300'
                                            }`}
                                        />
                                    </div>
                                    {errors.free_shipping_threshold && (
                                        <p className="mt-1 text-sm text-red-600">{errors.free_shipping_threshold}</p>
                                    )}
                                    <p className="mt-1 text-xs text-emerald-600">
                                        Laissez vide pour utiliser le seuil global de l'application (75 000 {getCurrentCurrencySymbol()})
                                    </p>
                                </div>
                                
                                <div className="bg-white p-3 rounded border border-emerald-200">
                                    <div className="flex items-start space-x-2">
                                        <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                                        <div className="text-xs text-emerald-700">
                                            <strong>Comment ça fonctionne :</strong><br />
                                            Quand le montant du panier atteint ce seuil, la livraison devient gratuite automatiquement.
                                            Si aucun seuil spécifique n'est défini, le seuil global sera utilisé.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Aperçu */}
                {data.name && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu client</h3>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 flex items-center space-x-2">
                                        <TruckIcon className="h-4 w-4 text-indigo-500" />
                                        <span>{data.name}</span>
                                        {!data.is_active && (
                                            <span className="text-xs text-red-500">(Inactif)</span>
                                        )}
                                        {data.supports_free_shipping && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                <GiftIcon className="w-3 h-3 mr-1" />
                                                Livraison gratuite possible
                                            </span>
                                        )}
                                    </div>
                                    {data.description && (
                                        <div className="text-sm text-gray-500 mt-1">{data.description}</div>
                                    )}
                                    {data.supports_free_shipping && (
                                        <div className="text-xs text-emerald-600 mt-1">
                                            Gratuit à partir de {formatCurrency(data.free_shipping_threshold || 75000)}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">
                                        {data.price == 0 || !data.price ? (
                                            <span className="text-green-600">Gratuit</span>
                                        ) : (
                                            <span>{formatCurrency(data.price)}</span>
                                        )}
                                    </div>
                                    {data.estimated_days && (
                                        <div className="text-xs text-gray-500 flex items-center justify-end space-x-1 mt-1">
                                            <ClockIcon className="h-3 w-3" />
                                            <span>{data.estimated_days} jour{data.estimated_days > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <Link
                        href={route('admin.shippings.index')}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {processing ? 'Création...' : 'Créer le mode de livraison'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}