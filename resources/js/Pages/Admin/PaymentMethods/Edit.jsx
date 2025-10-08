import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatDate, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    ArrowLeftIcon,
    CreditCardIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    EyeSlashIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function EditPaymentMethod() {
    const { paymentMethod, localeConfig } = usePage().props;
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    const [configFields, setConfigFields] = useState([]);
    const [showSecrets, setShowSecrets] = useState({});

    const { data, setData, put, processing, errors, delete: destroy } = useForm({
        name: paymentMethod.name || '',
        code: paymentMethod.code || '',
        description: paymentMethod.description || '',
        is_active: paymentMethod.is_active || false,
        sort_order: paymentMethod.sort_order || 0,
        config: paymentMethod.config || {},
    });

    // Initialiser la configuration de locale
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
            setIsLocaleInitialized(true);
        }
    }, [localeConfig]);

    // Configuration des champs selon la méthode de paiement
    const configFieldsMapping = {
        'paypal': [
            { key: 'client_id', label: 'Client ID', type: 'text', required: true, placeholder: 'Votre PayPal Client ID' },
            { key: 'client_secret', label: 'Client Secret', type: 'password', required: true, placeholder: 'Votre PayPal Client Secret' },
            { key: 'mode', label: 'Mode', type: 'select', options: [
                { value: 'sandbox', label: 'Sandbox (Test)' },
                { value: 'live', label: 'Live (Production)' }
            ], required: true }
        ],
        'orange_money': [
            { key: 'merchant_key', label: 'Clé Marchand', type: 'text', required: true, placeholder: 'Clé marchand Orange Money' },
            { key: 'api_url', label: 'URL API', type: 'url', required: true, placeholder: 'https://api.orange.com/...' },
            { key: 'return_url', label: 'URL de Retour', type: 'url', required: false, placeholder: 'URL de retour après paiement' }
        ],
        'mtn_money': [
            { key: 'api_key', label: 'Clé API', type: 'text', required: true, placeholder: 'Clé API MTN Money' },
            { key: 'api_secret', label: 'Secret API', type: 'password', required: true, placeholder: 'Secret API MTN Money' },
            { key: 'subscription_key', label: 'Clé Souscription', type: 'text', required: true, placeholder: 'Clé de souscription' }
        ],
        'wave': [
            { key: 'api_key', label: 'Clé API', type: 'text', required: true, placeholder: 'Clé API Wave' },
            { key: 'secret_key', label: 'Clé Secrète', type: 'password', required: true, placeholder: 'Clé secrète Wave' },
            { key: 'webhook_secret', label: 'Secret Webhook', type: 'password', required: false, placeholder: 'Secret pour les webhooks' }
        ],
        'moov_money': [
            { key: 'merchant_id', label: 'ID Marchand', type: 'text', required: true, placeholder: 'Identifiant marchand Moov Money' },
            { key: 'api_key', label: 'Clé API', type: 'text', required: true, placeholder: 'Clé API Moov Money' },
            { key: 'api_secret', label: 'Secret API', type: 'password', required: true, placeholder: 'Secret API Moov Money' }
        ],
        'visa': [
            { key: 'merchant_id', label: 'ID Marchand', type: 'text', required: true, placeholder: 'Identifiant marchand VISA' },
            { key: 'api_key', label: 'Clé API', type: 'text', required: true, placeholder: 'Clé API VISA' },
            { key: 'secret_key', label: 'Clé Secrète', type: 'password', required: true, placeholder: 'Clé secrète VISA' },
            { key: 'environment', label: 'Environnement', type: 'select', options: [
                { value: 'sandbox', label: 'Sandbox (Test)' },
                { value: 'production', label: 'Production' }
            ], required: true }
        ],
        'cash_on_delivery': [
            { key: 'delivery_fee', label: 'Frais de Livraison', type: 'number', required: false, placeholder: '0' },
            { key: 'min_order_amount', label: 'Montant Minimum Commande', type: 'number', required: false, placeholder: '0' }
        ]
    };

    useEffect(() => {
        setConfigFields(configFieldsMapping[paymentMethod.code] || []);
    }, [paymentMethod.code]);

    const handleConfigChange = (key, value) => {
        setData('config', {
            ...data.config,
            [key]: value
        });
    };

    const toggleSecretVisibility = (fieldKey) => {
        setShowSecrets(prev => ({
            ...prev,
            [fieldKey]: !prev[fieldKey]
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.payment-methods.update', paymentMethod.id));
    };

    const handleDelete = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la méthode de paiement "${paymentMethod.name}" ?`)) {
            destroy(route('admin.payment-methods.destroy', paymentMethod.id));
        }
    };

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

    // Ne pas rendre tant que la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }

    return (
        <AdminLayout>
            <Head title={`Modifier ${paymentMethod.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <span className="text-2xl">{getPaymentMethodIcon(paymentMethod.code)}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Modifier {paymentMethod.name}</h1>
                                <p className="text-gray-600">Modifiez les paramètres de cette méthode de paiement</p>
                                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                    <span>Code: {paymentMethod.code}</span>
                                    <span>•</span>
                                    <span>Créée le {formatDate(paymentMethod.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
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

                {/* Formulaire */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <form onSubmit={submit} className="p-6 space-y-6">
                        {/* Informations de base */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nom de la méthode de paiement"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.code}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    placeholder="Code de la méthode"
                                />
                                <p className="mt-1 text-xs text-gray-500">Le code ne peut pas être modifié</p>
                                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ordre d'affichage
                            </label>
                            <input
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                            {errors.sort_order && <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Description de la méthode de paiement"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                                Activer cette méthode de paiement
                            </label>
                        </div>

                        {/* Configuration spécifique */}
                        {configFields.length > 0 && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {configFields.map((field) => (
                                        <div key={field.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    value={data.config[field.key] || ''}
                                                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {field.options.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'password' ? (
                                                <div className="relative">
                                                    <input
                                                        type={showSecrets[field.key] ? 'text' : 'password'}
                                                        value={data.config[field.key] || ''}
                                                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder={field.placeholder}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSecretVisibility(field.key)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showSecrets[field.key] ? (
                                                            <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                                                        ) : (
                                                            <EyeIcon className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={data.config[field.key] || ''}
                                                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder={field.placeholder}
                                                />
                                            )}
                                            {errors[`config.${field.key}`] && (
                                                <p className="mt-1 text-sm text-red-600">{errors[`config.${field.key}`]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                            <Link
                                href={route('admin.payment-methods.index')}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2 bg-blue-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mise à jour...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                                        Mettre à jour
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}