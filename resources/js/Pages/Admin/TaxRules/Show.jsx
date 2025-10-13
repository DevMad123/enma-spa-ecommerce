import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useAppSettings } from '@/Hooks/useAppSettings';
import {
    HiOutlineArrowLeft,
    HiOutlineCash,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineGlobe,
    HiOutlineCalendar,
    HiOutlineHashtag,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineStar,
    HiOutlineTruck,
    HiOutlineCurrencyEuro,
    HiOutlineAnnotation
} from 'react-icons/hi';

export default function ShowTaxRule({ taxRule, title }) {
    const handleEdit = () => {
        router.visit(route('admin.tax-rules.edit', taxRule.id));
    };

    const handleDelete = () => {
        if (taxRule.is_default) {
            alert('Impossible de supprimer le pays par défaut.');
            return;
        }
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer la règle de TVA pour ${taxRule.country_name} ?`)) {
            router.delete(route('admin.tax-rules.destroy', taxRule.id));
        }
    };

    const handleSetDefault = () => {
        if (confirm(`Définir ${taxRule.country_name} comme pays par défaut ?`)) {
            router.patch(route('admin.tax-rules.set-default', taxRule.id));
        }
    };

    const handleToggleActive = () => {
        const action = taxRule.is_active ? 'désactiver' : 'activer';
        if (confirm(`Êtes-vous sûr de vouloir ${action} cette règle de TVA ?`)) {
            router.patch(route('admin.tax-rules.toggle-active', taxRule.id));
        }
    };

    const { formatCurrency, formatDate, formatPercentage } = useAppSettings();

    // Calcul d'exemple pour 100€
    const exampleAmount = 100;
    const taxAmount = (exampleAmount * parseFloat(taxRule.tax_rate)) / 100;
    const totalAmount = exampleAmount + taxAmount;

    return (
        <AdminLayout>
            <Head title={title} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('admin.tax-rules.index')}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
                                    Retour à la liste
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                        <HiOutlineCash className="h-8 w-8 text-green-600 mr-3" />
                                        Règle de TVA - {taxRule.country_name}
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Informations détaillées de la règle de TVA pour {taxRule.country_name} ({taxRule.country_code})
                                    </p>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <HiOutlinePencil className="w-4 h-4 mr-2" />
                                    Modifier
                                </button>
                                
                                {!taxRule.is_default && (
                                    <button
                                        onClick={handleSetDefault}
                                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <HiOutlineStar className="w-4 h-4 mr-2" />
                                        Définir par défaut
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleToggleActive}
                                    className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                                        taxRule.is_active
                                            ? 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'
                                            : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                    }`}
                                >
                                    {taxRule.is_active ? (
                                        <>
                                            <HiOutlineXCircle className="w-4 h-4 mr-2" />
                                            Désactiver
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineCheckCircle className="w-4 h-4 mr-2" />
                                            Activer
                                        </>
                                    )}
                                </button>
                                
                                {!taxRule.is_default && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <HiOutlineTrash className="w-4 h-4 mr-2" />
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Colonne principale */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Informations principales */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <HiOutlineGlobe className="h-6 w-6 text-blue-600 mr-2" />
                                        Informations générales
                                    </h2>
                                </div>
                                
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Pays</h3>
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700 mr-3">
                                                    {taxRule.country_code}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">{taxRule.country_name}</p>
                                                    <p className="text-sm text-gray-500">Code: {taxRule.country_code}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Taux de TVA</h3>
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-700 mr-3">
                                                    %
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-600">{formatPercentage(taxRule.tax_rate, 2)}</p>
                                                    <p className="text-sm text-gray-500">Taux appliqué</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Montant minimum</h3>
                                            <div className="flex items-center">
                                                <HiOutlineCurrencyEuro className="h-6 w-6 text-purple-600 mr-2" />
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {formatCurrency(taxRule.min_order_amount)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Commande minimum</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Statuts</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {taxRule.is_default && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <HiOutlineStar className="w-3 h-3 mr-1" />
                                                        Par défaut
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    taxRule.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {taxRule.is_active ? (
                                                        <>
                                                            <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                                                            Actif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiOutlineXCircle className="w-3 h-3 mr-1" />
                                                            Inactif
                                                        </>
                                                    )}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    taxRule.delivery_allowed 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    <HiOutlineTruck className="w-3 h-3 mr-1" />
                                                    {taxRule.delivery_allowed ? 'Livraison OK' : 'Livraison interdite'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Zones de livraison */}
                            {taxRule.delivery_zones && taxRule.delivery_zones.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                            <HiOutlineTruck className="h-6 w-6 text-purple-600 mr-2" />
                                            Zones de livraison spécifiques
                                        </h2>
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="flex flex-wrap gap-2">
                                            {taxRule.delivery_zones.map((zone, index) => (
                                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                    {zone}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {taxRule.notes && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                            <HiOutlineAnnotation className="h-6 w-6 text-gray-600 mr-2" />
                                            Notes administratives
                                        </h2>
                                    </div>
                                    
                                    <div className="p-6">
                                        <p className="text-gray-700 whitespace-pre-wrap">{taxRule.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Simulation de calcul */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-900">Simulation TVA</h3>
                                </div>
                                
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">Exemple pour {formatCurrency(exampleAmount)}</p>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Montant HT:</span>
                                                <span className="font-medium">{formatCurrency(exampleAmount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">TVA ({formatPercentage(taxRule.tax_rate)}):</span>
                                                <span className="font-medium text-green-600">+{formatCurrency(taxAmount)}</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold text-gray-900">Total TTC:</span>
                                                    <span className="font-bold text-lg text-gray-900">{formatCurrency(totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {taxRule.min_order_amount > 0 && (
                                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                                <p className="text-xs text-yellow-700">
                                                    ⚠️ Montant minimum requis: {formatCurrency(taxRule.min_order_amount)}
                                                </p>
                                                {exampleAmount < taxRule.min_order_amount && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Livraison non autorisée pour ce montant
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informations système */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <HiOutlineHashtag className="h-5 w-5 text-gray-600 mr-2" />
                                        Informations système
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">ID de la règle</h4>
                                        <p className="text-sm font-mono text-gray-900">#{taxRule.id}</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                                            <HiOutlineCalendar className="h-4 w-4 mr-1" />
                                            Créée le
                                        </h4>
                                        <p className="text-sm text-gray-900">{formatDate(taxRule.created_at)}</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                                            <HiOutlineCalendar className="h-4 w-4 mr-1" />
                                            Modifiée le
                                        </h4>
                                        <p className="text-sm text-gray-900">{formatDate(taxRule.updated_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions rapides */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
                                </div>
                                
                                <div className="p-6 space-y-3">
                                    <Link
                                        href={route('admin.tax-rules.edit', taxRule.id)}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50"
                                    >
                                        <HiOutlinePencil className="w-4 h-4 mr-2" />
                                        Modifier cette règle
                                    </Link>
                                    
                                    <Link
                                        href={route('admin.tax-rules.create')}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-green-700 hover:bg-green-50"
                                    >
                                        <HiOutlineCash className="w-4 h-4 mr-2" />
                                        Nouvelle règle
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}