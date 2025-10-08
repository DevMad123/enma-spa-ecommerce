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
    DocumentTextIcon 
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
                                    </div>
                                    {data.description && (
                                        <div className="text-sm text-gray-500 mt-1">{data.description}</div>
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