import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale } from '@/Utils/LocaleUtils';
import {
    HiOutlineCog,
    HiOutlineGlobe,
    HiOutlineColorSwatch,
    HiOutlineShoppingCart,
    HiOutlinePhotograph,
    HiOutlineTrash,
    HiOutlineUpload
} from 'react-icons/hi';

export default function SettingsIndex({ settings, currencies = {}, languages = {}, localeConfig = {}, flash: pageFlash = {} }) {
    const [activeTab, setActiveTab] = useState('general');
    const [imageUploading, setImageUploading] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

    // Accéder aux props flash globales via usePage
    const { props } = usePage();
    const flash = props.flash || {};

    // Initialiser la configuration de locale
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
        }
    }, [localeConfig]);

    // Gérer les messages venant du contrôleur
    useEffect(() => {
        const uploadSuccess = flash.upload_success || pageFlash.upload_success;
        const uploadError = flash.upload_error || pageFlash.upload_error;
        const deleteSuccess = flash.delete_success || pageFlash.delete_success;
        const deleteError = flash.delete_error || pageFlash.delete_error;
        
        if (uploadSuccess) {
            const message = typeof uploadSuccess === 'object' ? uploadSuccess.message : uploadSuccess;
            setUploadSuccessMessage(`✅ ${message}`);
            setTimeout(() => setUploadSuccessMessage(''), 4000);
        }
        if (uploadError) {
            setUploadSuccessMessage(`❌ ${uploadError}`);
            setTimeout(() => setUploadSuccessMessage(''), 4000);
        }
        if (deleteSuccess) {
            setUploadSuccessMessage(`🗑️ ${deleteSuccess}`);
            setTimeout(() => setUploadSuccessMessage(''), 3000);
        }
        if (deleteError) {
            setUploadSuccessMessage(`❌ ${deleteError}`);
            setTimeout(() => setUploadSuccessMessage(''), 3000);
        }
    }, [flash, pageFlash]);

    // Définir les devises par défaut si elles ne sont pas fournies
    const defaultCurrencies = {
        'XOF': 'Franc CFA (XOF)',
        'EUR': 'Euro (EUR)',
        'USD': 'Dollar US (USD)',
        'GBP': 'Livre Sterling (GBP)',
        'MAD': 'Dirham Marocain (MAD)',
        'TND': 'Dinar Tunisien (TND)'
    };
    
    // Définir les langues par défaut si elles ne sont pas fournies
    const defaultLanguages = {
        'fr-CI': 'Français (Côte d\'Ivoire)',
        'fr-FR': 'Français (France)',
        'en-US': 'English (United States)',
        'en-GB': 'English (United Kingdom)',
        'ar-MA': 'العربية (المغرب)',
        'es-ES': 'Español (España)'
    };
    
    const availableCurrencies = Object.keys(currencies).length > 0 ? currencies : defaultCurrencies;
    const availableLanguages = Object.keys(languages).length > 0 ? languages : defaultLanguages;

    // Fonction utilitaire pour récupérer une valeur de setting
    const getSetting = (key, group = null) => {
        // Chercher d'abord dans le groupe spécifié
        if (group && settings[group]) {
            const setting = settings[group].find(s => s.key === key);
            if (setting) return setting.value;
        }
        
        // Chercher dans tous les groupes
        for (const groupName of Object.keys(settings)) {
            const setting = settings[groupName]?.find(s => s.key === key);
            if (setting) return setting.value;
        }
        
        return null;
    };

    const { data, setData, post, processing, errors } = useForm({
        general: {
            currency: getSetting('currency') || getSetting('default_currency') || 'XOF',
            language: getSetting('language') || getSetting('locale') || 'fr-CI',
            site_name: getSetting('site_name') || '',
            site_description: getSetting('site_description') || '',
            contact_email: getSetting('site_email') || getSetting('contact_email') || '',
            contact_phone: getSetting('site_phone') || getSetting('phone') || '',
        },
        appearance: {
            hero_banner: null,
            promo_banner: null,
            show_popular_products: getSetting('show_popular_products') === '1' || getSetting('show_popular_products') === true,
            show_promotions: getSetting('show_promotions') === '1' || getSetting('show_promotions') === true,
            show_new_arrivals: getSetting('show_new_arrivals') === '1' || getSetting('show_new_arrivals') === true,
            show_categories: getSetting('show_categories') === '1' || getSetting('show_categories') === true,
        },
        ecommerce: {
            default_shipping_cost: parseFloat(getSetting('shipping_cost')) || 0,
            free_shipping_threshold: parseFloat(getSetting('free_shipping_threshold')) || 0,
            allow_guest_checkout: getSetting('allow_guest_checkout') === '1' || getSetting('allow_guest_checkout') === true,
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Préparer les données de paramètres pour le backend
        const settingsData = [];
        
        // Ajouter les paramètres généraux
        Object.keys(data.general).forEach(key => {
            let settingKey = key;
            // Mapper les clés frontend vers les clés backend
            if (key === 'currency') settingKey = 'default_currency';
            if (key === 'contact_email') settingKey = 'site_email';
            if (key === 'contact_phone') settingKey = 'site_phone';
            
            settingsData.push({
                key: settingKey,
                value: data.general[key]
            });
        });
        
        // Ajouter les paramètres d'apparence (sauf les fichiers)
        Object.keys(data.appearance).forEach(key => {
            if (!['hero_banner', 'promo_banner'].includes(key)) {
                settingsData.push({
                    key: key,
                    value: data.appearance[key] ? '1' : '0'
                });
            }
        });
        
        // Ajouter les paramètres e-commerce
        Object.keys(data.ecommerce).forEach(key => {
            let settingKey = key;
            if (key === 'default_shipping_cost') settingKey = 'shipping_cost';
            
            settingsData.push({
                key: settingKey,
                value: String(data.ecommerce[key])
            });
        });

        router.put(route('admin.settings.update'), {
            settings: settingsData
        }, {
            onSuccess: (response) => {
                console.log('Paramètres mis à jour avec succès');
                setSuccessMessage('Paramètres mis à jour avec succès !');
                // Cacher le message après 5 secondes
                setTimeout(() => setSuccessMessage(''), 5000);
                // Recharger les données pour mettre à jour l'interface
                router.reload({ only: ['settings'] });
            },
            onError: (errors) => {
                console.error('Erreurs de validation:', errors);
            }
        });
    };

    const handleFileUpload = async (key, file) => {
        if (!file) return;

        setImageUploading(prev => ({ ...prev, [key]: true }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', key);

        router.post(route('admin.settings.upload-file'), formData, {
            onSuccess: () => {
                // Le message sera géré par useEffect via les props du contrôleur
                console.log('Fichier uploadé avec succès');
            },
            onError: (errors) => {
                console.error('Erreur upload:', errors);
                setUploadSuccessMessage(`❌ Erreur lors de l'upload de "${file.name}"`);
                setTimeout(() => setUploadSuccessMessage(''), 4000);
            },
            onFinish: () => {
                setImageUploading(prev => ({ ...prev, [key]: false }));
            }
        });
    };

    const handleFileDelete = async (key) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
            return;
        }

        router.delete(route('admin.settings.delete-file'), {
            data: { key },
            onSuccess: () => {
                // Le message sera géré par useEffect via les props du contrôleur
                console.log('Fichier supprimé avec succès');
            },
            onError: (errors) => {
                console.error('Erreur suppression:', errors);
                setUploadSuccessMessage(`❌ Erreur lors de la suppression`);
                setTimeout(() => setUploadSuccessMessage(''), 3000);
            }
        });
    };

    const tabs = [
        { id: 'general', name: 'Général', icon: HiOutlineGlobe },
        // { id: 'appearance', name: 'Apparence', icon: HiOutlineColorSwatch },
        { id: 'ecommerce', name: 'E-commerce', icon: HiOutlineShoppingCart },
    ];

    const renderImageUpload = (key, label) => {
        // Chercher l'image dans tous les groupes
        let currentImage = null;
        for (const groupName of Object.keys(settings)) {
            const found = settings[groupName]?.find(s => s.key === key);
            if (found && found.value) {
                currentImage = found;
                break;
            }
        }
        
        return (
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                
                {/* Aperçu de l'image actuelle */}
                {currentImage && currentImage.value && (
                    <div className="relative group">
                        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                            <img
                                src={`/storage/${currentImage.value}`}
                                alt={label}
                                className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            {/* Fallback si l'image ne charge pas */}
                            <div className="hidden w-full h-48 bg-gray-100 items-center justify-center">
                                <span className="text-gray-400">Image non trouvée</span>
                            </div>
                            {/* Overlay avec boutons */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Ouvrir l'image en plein écran
                                        window.open(`/storage/${currentImage.value}`, '_blank');
                                    }}
                                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                                    title="Voir en grand"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFileDelete(key)}
                                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                    title="Supprimer"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 text-center">
                            {currentImage.value.split('/').pop()}
                        </p>
                    </div>
                )}
                
                {/* Zone d'upload */}
                <div className={`border-2 border-dashed rounded-lg transition-colors ${
                    imageUploading[key] 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}>
                    <label className="cursor-pointer block p-6 text-center">
                        {imageUploading[key] ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <span className="text-sm font-medium text-blue-600">Upload en cours...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <HiOutlineUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-900">
                                    {currentImage && currentImage.value ? 'Remplacer l\'image' : 'Cliquez pour uploader'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    JPG, PNG, WEBP, AVIF � 2 Mo max
                                </span>
                            </div>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.webp,.avif"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    handleFileUpload(key, file);
                                }
                            }}
                            disabled={imageUploading[key]}
                        />
                    </label>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Paramètres" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                    <p className="mt-2 text-gray-600">
                        Configurez les paramètres généraux de votre site e-commerce
                    </p>
                    
                    {/* Message de succès */}
                    {successMessage && (
                        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline">{successMessage}</span>
                            <span 
                                className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                                onClick={() => setSuccessMessage('')}
                            >
                                <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                                </svg>
                            </span>
                        </div>
                    )}

                    {/* Message d'upload */}
                    {uploadSuccessMessage && (
                        <div className={`mt-4 px-4 py-3 rounded relative ${
                            uploadSuccessMessage.includes('❌') 
                                ? 'bg-red-100 border border-red-400 text-red-700' 
                                : 'bg-green-100 border border-green-400 text-green-700'
                        }`}>
                            <span className="block sm:inline">{uploadSuccessMessage}</span>
                            <span 
                                className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                                onClick={() => setUploadSuccessMessage('')}
                            >
                                <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                                </svg>
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation des onglets */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Contenu des onglets */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Onglet Général */}
                            {activeTab === 'general' && (
                                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Paramètres généraux</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Configuration de base de votre site
                                        </p>
                                    </div>
                                    <div className="px-6 py-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nom du site *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.general.site_name}
                                                    onChange={(e) => setData('general', { ...data.general, site_name: e.target.value })}
                                                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors['general.site_name'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Nom de votre site"
                                                />
                                                {errors['general.site_name'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['general.site_name']}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Devise *
                                                </label>
                                                <select
                                                    value={data.general.currency}
                                                    onChange={(e) => setData('general', { ...data.general, currency: e.target.value })}
                                                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors['general.currency'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                >
                                                    {Object.entries(availableCurrencies).map(([code, name]) => (
                                                        <option key={code} value={code}>{name}</option>
                                                    ))}
                                                </select>
                                                {errors['general.currency'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['general.currency']}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Langue / Locale *
                                                </label>
                                                <select
                                                    value={data.general.language}
                                                    onChange={(e) => setData('general', { ...data.general, language: e.target.value })}
                                                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors['general.language'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                >
                                                    {Object.entries(availableLanguages).map(([code, name]) => (
                                                        <option key={code} value={code}>{name}</option>
                                                    ))}
                                                </select>
                                                {errors['general.language'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['general.language']}</p>
                                                )}
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Format utilisé pour Intl.NumberFormat et les dates
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description du site
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={data.general.site_description}
                                                onChange={(e) => setData('general', { ...data.general, site_description: e.target.value })}
                                                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors['general.site_description'] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Description de votre site e-commerce"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email de contact *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.general.contact_email}
                                                    onChange={(e) => setData('general', { ...data.general, contact_email: e.target.value })}
                                                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors['general.contact_email'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="contact@example.com"
                                                />
                                                {errors['general.contact_email'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['general.contact_email']}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Téléphone de contact
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.general.contact_phone}
                                                    onChange={(e) => setData('general', { ...data.general, contact_phone: e.target.value })}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="+221 XX XXX XX XX"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Onglet Apparence */}
                            {activeTab === 'appearance' && (
                                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Apparence du site</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Configurez l'apparence et les sections de votre page d'accueil
                                        </p>
                                    </div>
                                    <div className="px-6 py-6 space-y-8">
                                        {/* Bannières */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {renderImageUpload('hero_banner', 'Bannière principale')}
                                            {renderImageUpload('promo_banner', 'Bannière promotionnelle')}
                                        </div>

                                        {/* Sections à afficher */}
                                        <div>
                                            <h4 className="text-base font-medium text-gray-900 mb-4">Sections de la page d'accueil</h4>
                                            <div className="space-y-3">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.appearance.show_popular_products}
                                                        onChange={(e) => setData('appearance', { ...data.appearance, show_popular_products: e.target.checked })}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Afficher les produits populaires</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.appearance.show_promotions}
                                                        onChange={(e) => setData('appearance', { ...data.appearance, show_promotions: e.target.checked })}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Afficher les promotions</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.appearance.show_new_arrivals}
                                                        onChange={(e) => setData('appearance', { ...data.appearance, show_new_arrivals: e.target.checked })}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Afficher les nouveautés</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.appearance.show_categories}
                                                        onChange={(e) => setData('appearance', { ...data.appearance, show_categories: e.target.checked })}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Afficher les catégories</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Onglet E-commerce */}
                            {activeTab === 'ecommerce' && (
                                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Paramètres e-commerce</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Configuration des fonctionnalités de votre boutique en ligne
                                        </p>
                                    </div>
                                    <div className="px-6 py-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Coût de livraison par défaut (XOF)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.ecommerce.default_shipping_cost}
                                                    onChange={(e) => setData('ecommerce', { ...data.ecommerce, default_shipping_cost: parseFloat(e.target.value) || 0 })}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Seuil de livraison gratuite (XOF)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.ecommerce.free_shipping_threshold}
                                                    onChange={(e) => setData('ecommerce', { ...data.ecommerce, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Montant minimum pour bénéficier de la livraison gratuite
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.ecommerce.allow_guest_checkout}
                                                    onChange={(e) => setData('ecommerce', { ...data.ecommerce, allow_guest_checkout: e.target.checked })}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Autoriser les achats sans créer de compte</span>
                                            </label>
                                            <p className="mt-1 ml-6 text-xs text-gray-500">
                                                Les clients peuvent passer commande sans s'inscrire
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-blue-800">
                                                        Gestion de la TVA
                                                    </h3>
                                                    <div className="mt-2 text-sm text-blue-700">
                                                        <p>
                                                            La TVA est maintenant gérée via les{' '}
                                                            <Link 
                                                                href={route('admin.tax-rules.index')} 
                                                                className="font-medium underline hover:text-blue-600"
                                                            >
                                                                Règles de TVA
                                                            </Link>
                                                            . Vous pouvez configurer des taux différents par pays et gérer les règles de livraison.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg border">
                                <button
                                    type="button"
                                    onClick={() => router.reload()}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

