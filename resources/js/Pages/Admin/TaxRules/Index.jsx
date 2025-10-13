import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    StarIcon,
    GlobeAltIcon,
    ArrowDownTrayIcon,
    CogIcon,
    // RefreshIcon
} from '@heroicons/react/24/outline';
import TaxRulesFilter from '@/Components/Admin/TaxRulesFilter';
import { useAppSettings } from '@/Hooks/useAppSettings';

export default function Index({ auth, taxRules, filters, stats }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRule, setSelectedRule] = useState(null);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedRules, setSelectedRules] = useState([]);
    
    const { delete: destroy, processing } = useForm();
    const { formatCurrency, formatPercentage, formatDate } = useAppSettings();

    const handleDelete = (rule) => {
        setSelectedRule(rule);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        destroy(route('admin.tax-rules.destroy', selectedRule.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedRule(null);
            }
        });
    };

    const handleSetDefault = (rule) => {
        router.patch(route('admin.tax-rules.set-default', rule.id));
    };

    const handleToggleActive = (rule) => {
        router.patch(route('admin.tax-rules.toggle-active', rule.id));
    };

    const handleSelectRule = (ruleId) => {
        if (selectedRules.includes(ruleId)) {
            setSelectedRules(selectedRules.filter(id => id !== ruleId));
        } else {
            setSelectedRules([...selectedRules, ruleId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedRules.length === taxRules.data.length) {
            setSelectedRules([]);
        } else {
            setSelectedRules(taxRules.data.map(rule => rule.id));
        }
    };

    const handleBulkAction = (action) => {
        if (selectedRules.length === 0) return;
        
        switch (action) {
            case 'activate':
                router.post(route('admin.tax-rules.bulk-activate'), { ids: selectedRules });
                break;
            case 'deactivate':
                router.post(route('admin.tax-rules.bulk-deactivate'), { ids: selectedRules });
                break;
            case 'delete':
                if (confirm(`Supprimer ${selectedRules.length} règle(s) sélectionnée(s) ?`)) {
                    router.delete(route('admin.tax-rules.bulk-delete'), { data: { ids: selectedRules } });
                }
                break;
        }
        setSelectedRules([]);
    };

    const handleExport = () => {
        window.location.href = route('admin.tax-rules.export', filters);
    };

    return (
        <AdminLayout
            user={auth.user}
        >
            <Head title="Règles de TVA" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-2">
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Règles de TVA
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Gérez les taux de TVA et règles de livraison par pays
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:outline-none focus:ring ring-gray-300 transition ease-in-out duration-150"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                Exporter
                            </button>
                            <Link
                                href={route('admin.settings.index')}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 focus:outline-none focus:ring ring-purple-300 transition ease-in-out duration-150"
                            >
                                <CogIcon className="w-4 h-4 mr-2" />
                                Paramètres
                            </Link>
                            <Link
                                href={route('admin.tax-rules.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Nouvelle règle
                            </Link>
                        </div>
                    </div>
                    {/* Filtres */}
                    <TaxRulesFilter filters={filters} />

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <GlobeAltIcon className="w-8 h-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total pays</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats?.total || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Actifs</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats?.active || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <StarIcon className="w-8 h-8 text-yellow-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Par défaut</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {stats?.default_country || 'Aucun'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    %
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Taux moyen</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {formatPercentage(stats?.average_tax_rate || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-8 h-8 text-indigo-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Avec livraison</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats?.with_delivery || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions en lot */}
                    {selectedRules.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-blue-900">
                                        {selectedRules.length} règle(s) sélectionnée(s)
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    >
                                        Activer
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('deactivate')}
                                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                                    >
                                        Désactiver
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                    >
                                        Supprimer
                                    </button>
                                    <button
                                        onClick={() => setSelectedRules([])}
                                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table des règles */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedRules.length === taxRules.data.length && taxRules.data.length > 0}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pays
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Taux TVA
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Commande min.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Livraison
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {taxRules.data.map((rule) => (
                                        <tr key={rule.id} className={rule.is_default ? 'bg-yellow-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRules.includes(rule.id)}
                                                    onChange={() => handleSelectRule(rule.id)}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                                                            {rule.country_code}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                                            {rule.country_name}
                                                            {rule.is_default && (
                                                                <StarIcon className="w-4 h-4 text-yellow-500 ml-2" />
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {rule.country_code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatPercentage(rule.tax_rate)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {rule.min_order_amount > 0 
                                                    ? formatCurrency(rule.min_order_amount) 
                                                    : 'Aucun'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {rule.delivery_allowed ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                        Autorisée
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <XCircleIcon className="w-3 h-3 mr-1" />
                                                        Interdite
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleActive(rule)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        rule.is_active 
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    } cursor-pointer transition-colors`}
                                                >
                                                    {rule.is_active ? (
                                                        <>
                                                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                            Actif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircleIcon className="w-3 h-3 mr-1" />
                                                            Inactif
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={route('admin.tax-rules.show', rule.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Voir"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.tax-rules.edit', rule.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Modifier"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </Link>
                                                    {!rule.is_default && (
                                                        <button
                                                            onClick={() => handleSetDefault(rule)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Définir par défaut"
                                                        >
                                                            <StarIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {!rule.is_default && (
                                                        <button
                                                            onClick={() => handleDelete(rule)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Supprimer"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {taxRules.data.length === 0 && (
                            <div className="text-center py-12">
                                <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune règle de TVA</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Commencez par créer votre première règle de TVA.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('admin.tax-rules.create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Nouvelle règle
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {taxRules.links && taxRules.links.length > 3 && (
                        <div className="mt-6">
                            <nav className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {taxRules.prev_page_url && (
                                        <Link
                                            href={taxRules.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Précédent
                                        </Link>
                                    )}
                                    {taxRules.next_page_url && (
                                        <Link
                                            href={taxRules.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Suivant
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Affichage de <span className="font-medium">{taxRules.from}</span> à{' '}
                                            <span className="font-medium">{taxRules.to}</span> sur{' '}
                                            <span className="font-medium">{taxRules.total}</span> résultats
                                        </p>
                                    </div>
                                    <div className="flex space-x-1">
                                        {taxRules.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } border`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-3">
                                Confirmer la suppression
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Êtes-vous sûr de vouloir supprimer la règle de TVA pour{' '}
                                    <span className="font-medium">{selectedRule?.country_name}</span> ?
                                    Cette action ne peut pas être annulée.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 disabled:opacity-50"
                                >
                                    {processing ? 'En cours...' : 'Supprimer'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}