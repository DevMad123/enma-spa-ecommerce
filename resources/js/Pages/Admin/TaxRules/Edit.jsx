import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { HiOutlineArrowLeft, HiOutlineCash, HiOutlineGlobe } from 'react-icons/hi';
import { useAppSettings } from '@/Hooks/useAppSettings';
import clsx from 'clsx';

export default function EditTaxRule({ taxRule, title }) {
    const { currency, currencySymbol, formatDate } = useAppSettings();
    const [deliveryZones, setDeliveryZones] = useState(
        Array.isArray(taxRule.delivery_zones) && taxRule.delivery_zones.length > 0 
            ? taxRule.delivery_zones 
            : ['']
    );

    const { data, setData, put, processing, errors } = useForm({
        country_code: taxRule.country_code || '',
        country_name: taxRule.country_name || '',
        tax_rate: taxRule.tax_rate || '',
        is_default: taxRule.is_default || false,
        delivery_allowed: taxRule.delivery_allowed !== undefined ? taxRule.delivery_allowed : true,
        is_active: taxRule.is_active !== undefined ? taxRule.is_active : true,
        delivery_zones: taxRule.delivery_zones || [],
        min_order_amount: taxRule.min_order_amount || '',
        notes: taxRule.notes || '',
    });

    useEffect(() => {
        // Synchroniser les zones de livraison avec le formulaire
        const cleanedZones = deliveryZones.filter(zone => zone.trim() !== '');
        setData('delivery_zones', cleanedZones);
    }, [deliveryZones]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Nettoyer les zones de livraison vides
        const cleanedZones = deliveryZones.filter(zone => zone.trim() !== '');
        setData('delivery_zones', cleanedZones);
        
        put(route('admin.tax-rules.update', taxRule.id));
    };

    const addDeliveryZone = () => {
        setDeliveryZones([...deliveryZones, '']);
    };

    const removeDeliveryZone = (index) => {
        const newZones = deliveryZones.filter((_, i) => i !== index);
        setDeliveryZones(newZones);
    };

    const updateDeliveryZone = (index, value) => {
        const newZones = [...deliveryZones];
        newZones[index] = value;
        setDeliveryZones(newZones);
    };

    // Liste des pays courants avec leurs codes
    const commonCountries = [
        { code: 'FR', name: 'France' },
        { code: 'BE', name: 'Belgique' },
        { code: 'CH', name: 'Suisse' },
        { code: 'LU', name: 'Luxembourg' },
        { code: 'DE', name: 'Allemagne' },
        { code: 'ES', name: 'Espagne' },
        { code: 'IT', name: 'Italie' },
        { code: 'CI', name: 'Côte d\'Ivoire' },
        { code: 'SN', name: 'Sénégal' },
        { code: 'MA', name: 'Maroc' },
        { code: 'GB', name: 'Royaume-Uni' },
        { code: 'NL', name: 'Pays-Bas' },
        { code: 'PT', name: 'Portugal' },
    ];

    return (
        <AdminLayout>
            <Head title={title} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => window.history.back()}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Retour"
                                >
                                    <HiOutlineArrowLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                        <HiOutlineCash className="h-8 w-8 text-green-600 mr-3" />
                                        Modifier la règle de TVA
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Modifier la règle de TVA pour {taxRule.country_name} ({taxRule.country_code})
                                    </p>
                                </div>
                            </div>
                            
                            {/* Badge statut */}
                            <div className="flex items-center space-x-2">
                                {taxRule.is_default && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Par défaut
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    taxRule.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {taxRule.is_active ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <HiOutlineGlobe className="h-6 w-6 text-blue-600 mr-2" />
                                Informations du pays
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Modifiez les règles de TVA et de livraison pour ce pays
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Colonne gauche */}
                                <div className="space-y-6">
                                    {/* Pays */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-2">
                                                Code pays <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex">
                                                <select
                                                    id="country_code"
                                                    value={data.country_code}
                                                    onChange={(e) => {
                                                        const selectedCountry = commonCountries.find(c => c.code === e.target.value);
                                                        setData('country_code', e.target.value);
                                                        if (selectedCountry && !data.country_name) {
                                                            setData('country_name', selectedCountry.name);
                                                        }
                                                    }}
                                                    className={clsx(
                                                        "flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
                                                        errors.country_code ? "border-red-500" : "border-gray-300"
                                                    )}
                                                    required
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {commonCountries.map((country) => (
                                                        <option key={country.code} value={country.code}>
                                                            {country.code} - {country.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.country_code && (
                                                <p className="mt-1 text-sm text-red-600">{errors.country_code}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="country_name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom du pays <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="country_name"
                                                value={data.country_name}
                                                onChange={(e) => setData('country_name', e.target.value)}
                                                className={clsx(
                                                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
                                                    errors.country_name ? "border-red-500" : "border-gray-300"
                                                )}
                                                placeholder="Ex: France, Belgique..."
                                                required
                                            />
                                            {errors.country_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.country_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Taux de TVA */}
                                    <div>
                                        <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-2">
                                            Taux de TVA (%) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="tax_rate"
                                                value={data.tax_rate}
                                                onChange={(e) => setData('tax_rate', e.target.value)}
                                                className={clsx(
                                                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12",
                                                    errors.tax_rate ? "border-red-500" : "border-gray-300"
                                                )}
                                                placeholder="Ex: 20.00"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <span className="text-gray-500">%</span>
                                            </div>
                                        </div>
                                        {errors.tax_rate && (
                                            <p className="mt-1 text-sm text-red-600">{errors.tax_rate}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Entrez le taux de TVA en pourcentage (ex: 20 pour 20%)
                                        </p>
                                    </div>

                                    {/* Montant minimum */}
                                    <div>
                                        <label htmlFor="min_order_amount" className="block text-sm font-medium text-gray-700 mb-2">
                                            Montant minimum de commande ({currencySymbol})
                                        </label>
                                        <input
                                            type="number"
                                            id="min_order_amount"
                                            value={data.min_order_amount}
                                            onChange={(e) => setData('min_order_amount', e.target.value)}
                                            className={clsx(
                                                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
                                                errors.min_order_amount ? "border-red-500" : "border-gray-300"
                                            )}
                                            placeholder="Ex: 50.00"
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.min_order_amount && (
                                            <p className="mt-1 text-sm text-red-600">{errors.min_order_amount}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Laisser vide s'il n'y a pas de montant minimum
                                        </p>
                                    </div>
                                </div>

                                {/* Colonne droite */}
                                <div className="space-y-6">
                                    {/* Options */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Options</h3>
                                        
                                        <div className="space-y-3">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_default}
                                                    onChange={(e) => setData('is_default', e.target.checked)}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Pays par défaut
                                                </span>
                                            </label>
                                            {data.is_default && (
                                                <p className="text-xs text-yellow-600 ml-6">
                                                    ⚠️ Activer cette option désactivera le statut par défaut des autres pays
                                                </p>
                                            )}

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.delivery_allowed}
                                                    onChange={(e) => setData('delivery_allowed', e.target.checked)}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Livraison autorisée
                                                </span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Règle active
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Zones de livraison */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Zones de livraison spécifiques
                                        </label>
                                        <div className="space-y-2">
                                            {deliveryZones.map((zone, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={zone}
                                                        onChange={(e) => updateDeliveryZone(index, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                        placeholder="Ex: Île-de-France, Provence..."
                                                    />
                                                    {deliveryZones.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDeliveryZone(index)}
                                                            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addDeliveryZone}
                                            className="mt-2 text-sm text-green-600 hover:text-green-800"
                                        >
                                            + Ajouter une zone
                                        </button>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Optionnel : spécifiez des zones de livraison particulières
                                        </p>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes administratives
                                        </label>
                                        <textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={4}
                                            className={clsx(
                                                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none",
                                                errors.notes ? "border-red-500" : "border-gray-300"
                                            )}
                                            placeholder="Notes internes, références légales, etc..."
                                        />
                                        {errors.notes && (
                                            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                        )}
                                    </div>

                                    {/* Informations sur la règle */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Informations</h4>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <p>Créé le : {formatDate(taxRule.created_at, { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p>Modifié le : {formatDate(taxRule.updated_at, { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={clsx(
                                            "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center",
                                            processing && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mise à jour...
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineCash className="w-5 h-5 mr-2" />
                                                Mettre à jour
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}