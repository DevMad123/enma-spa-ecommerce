import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatDate, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    ArrowLeftIcon,
    CreditCardIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ClockIcon,
    TagIcon,
    CogIcon
} from '@heroicons/react/24/outline';

export default function ShowPaymentMethod() {
    const { paymentMethod, localeConfig } = usePage().props;
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    const [showSecrets, setShowSecrets] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialiser la configuration de locale
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
            setIsLocaleInitialized(true);
        }
    }, [localeConfig]);

    // Ne pas rendre tant que la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }

    const getPaymentMethodIcon = (code) => {
        const icons = {
            'paypal': '💙',
            'orange_money': '🟠',
            'mtn_money': '🟡',
            'wave': '🔵',
            'moov_money': '🟢',
            'visa': '💳',
            'cash_on_delivery': '💵',
        };
        return icons[code] || '💳';
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Actif
            </span>
        ) : (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                <XCircleIcon className="w-4 h-4 mr-1" />
                Inactif
            </span>
        );
    };

    const handleToggleStatus = () => {
        setIsProcessing(true);
        router.patch(
            route('admin.payment-methods.toggle', paymentMethod.id),
            {},
            {
                onFinish: () => setIsProcessing(false),
                preserveScroll: true,
            }
        );
    };

    const handleDelete = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la méthode de paiement "${paymentMethod.name}" ?`)) {
            router.delete(route('admin.payment-methods.destroy', paymentMethod.id));
        }
    };

    const renderConfigValue = (key, value) => {
        // Masquer les valeurs sensibles
        const sensitiveFields = ['secret', 'password', 'key', 'client_secret', 'api_secret', 'secret_key', 'webhook_secret'];
        const isSensitive = sensitiveFields.some(field => key.toLowerCase().includes(field));
        
        if (isSensitive && value) {
            return (
                <div className="flex items-center space-x-2">
                    <span className={showSecrets[key] ? 'font-mono' : ''}>
                        {showSecrets[key] ? value : '••••••••••••'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        {showSecrets[key] ? (
                            <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                            <EyeIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
            );
        }
        
        return value || '-';
    };

    const getConfigFieldLabel = (key) => {
        const labels = {
            'client_id': 'Client ID',
            'client_secret': 'Client Secret',
            'mode': 'Mode',
            'environment': 'Environnement',
            'merchant_key': 'Clé Marchand',
            'api_url': 'URL API',
            'return_url': 'URL de Retour',
            'api_key': 'Clé API',
            'api_secret': 'Secret API',
            'subscription_key': 'Clé Souscription',
            'secret_key': 'Clé Secrète',
            'webhook_secret': 'Secret Webhook',
            'merchant_id': 'ID Marchand',
            'delivery_fee': 'Frais de Livraison',
            'min_order_amount': 'Montant Minimum Commande',
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
    };

    return (
        <AdminLayout>
            <Head title={paymentMethod.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <span className="text-3xl">{getPaymentMethodIcon(paymentMethod.code)}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{paymentMethod.name}</h1>
                                <p className="text-gray-600">Détails de la méthode de paiement</p>
                                <div className="mt-2 flex items-center space-x-4">
                                    {getStatusBadge(paymentMethod.is_active)}
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                        <TagIcon className="w-3 h-3 mr-1" />
                                        {paymentMethod.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleToggleStatus}
                                disabled={isProcessing}
                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg font-medium text-sm text-white transition-colors ${
                                    paymentMethod.is_active
                                        ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {paymentMethod.is_active ? (
                                    <>
                                        <XCircleIcon className="w-4 h-4 mr-2" />
                                        Désactiver
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                                        Activer
                                    </>
                                )}
                            </button>
                            <Link
                                href={route('admin.payment-methods.edit', paymentMethod.id)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Modifier
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Supprimer
                            </button>
                            <Link
                                href={route('admin.payment-methods.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Retour
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Informations générales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations de base */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Nom</label>
                                <p className="mt-1 text-sm text-gray-900">{paymentMethod.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Code</label>
                                <p className="mt-1 text-sm text-gray-900 font-mono">{paymentMethod.code}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {paymentMethod.description || 'Aucune description'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Statut</label>
                                <div className="mt-1">
                                    {getStatusBadge(paymentMethod.is_active)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Ordre d'affichage</label>
                                <p className="mt-1 text-sm text-gray-900">{paymentMethod.sort_order}</p>
                            </div>
                        </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    <ClockIcon className="w-4 h-4 inline mr-1" />
                                    Date de création
                                </label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(paymentMethod.created_at)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    <ClockIcon className="w-4 h-4 inline mr-1" />
                                    Dernière modification
                                </label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(paymentMethod.updated_at)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">ID</label>
                                <p className="mt-1 text-sm text-gray-900 font-mono">{paymentMethod.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration */}
                {paymentMethod.config && Object.keys(paymentMethod.config).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <CogIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(paymentMethod.config).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        {getConfigFieldLabel(key)}
                                    </label>
                                    <div className="text-sm text-gray-900">
                                        {renderConfigValue(key, value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}