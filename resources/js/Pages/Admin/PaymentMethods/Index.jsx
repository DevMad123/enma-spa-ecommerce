import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { initLocale, formatDate, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CreditCardIcon,
    CheckCircleIcon,
    XCircleIcon,
    CogIcon,
    FunnelIcon,
    ChevronUpDownIcon
} from '@heroicons/react/24/outline';

export default function PaymentMethodsList() {
    const { paymentMethods, flash, localeConfig } = usePage().props;
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
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

    // Filtrer les méthodes de paiement
    const filteredPaymentMethods = paymentMethods.filter(method => {
        const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            method.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || 
                            (statusFilter === 'active' && method.is_active) ||
                            (statusFilter === 'inactive' && !method.is_active);
        return matchesSearch && matchesStatus;
    });

    const handleSearch = (e) => {
        e.preventDefault();
        // La recherche se fait côté client pour simplifier
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
    };

    const handleDelete = (paymentMethod) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la méthode de paiement "${paymentMethod.name}" ?`)) {
            setIsProcessing(true);
            router.delete(route('admin.payment-methods.destroy', paymentMethod.id), {
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleToggleStatus = (paymentMethod) => {
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

    const handleView = (paymentMethodId) => {
        router.visit(route('admin.payment-methods.show', paymentMethodId));
    };

    const handleEdit = (paymentMethod) => {
        router.visit(route('admin.payment-methods.edit', paymentMethod.id));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins une méthode de paiement.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} méthode(s) de paiement ?`)) {
                setIsProcessing(true);
                router.post(route('admin.payment-methods.bulk-delete'), {
                    ids: selectedIds
                }, {
                    onFinish: () => setIsProcessing(false),
                });
            }
        } else if (action === 'activate') {
            setIsProcessing(true);
            router.post(route('admin.payment-methods.bulk-activate'), {
                ids: selectedIds
            }, {
                onFinish: () => setIsProcessing(false),
            });
        } else if (action === 'deactivate') {
            setIsProcessing(true);
            router.post(route('admin.payment-methods.bulk-deactivate'), {
                ids: selectedIds
            }, {
                onFinish: () => setIsProcessing(false),
            });
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

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Actif
            </span>
        ) : (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                <XCircleIcon className="w-3 h-3 mr-1" />
                Inactif
            </span>
        );
    };

    // Définir les colonnes pour le DataTable
    const columns = [
        {
            key: 'name',
            title: 'Méthode',
            sortable: true,
            render: (paymentMethod) => (
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getPaymentMethodIcon(paymentMethod.code)}</span>
                    <div>
                        <div className="font-medium text-gray-900">{paymentMethod.name}</div>
                        <div className="text-sm text-gray-500">{paymentMethod.code}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'description',
            title: 'Description',
            sortable: false,
            render: (paymentMethod) => (
                <div className="max-w-xs">
                    <p className="text-sm text-gray-600 truncate">
                        {paymentMethod.description || 'Aucune description'}
                    </p>
                </div>
            )
        },
        {
            key: 'is_active',
            title: 'Statut',
            sortable: true,
            render: (paymentMethod) => (
                <button
                    onClick={() => handleToggleStatus(paymentMethod)}
                    disabled={isProcessing}
                    className="focus:outline-none"
                >
                    {getStatusBadge(paymentMethod.is_active)}
                </button>
            )
        },
        {
            key: 'sort_order',
            title: 'Ordre',
            sortable: true,
            render: (paymentMethod) => (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                    {paymentMethod.sort_order}
                </span>
            )
        },
        {
            key: 'created_at',
            title: 'Créé le',
            sortable: true,
            render: (paymentMethod) => (
                <span className="text-sm text-gray-600">
                    {formatDate(paymentMethod.created_at)}
                </span>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            sortable: false,
            render: (paymentMethod) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleView(paymentMethod.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Voir"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(paymentMethod)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Modifier"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(paymentMethod)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                        disabled={isProcessing}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Actions en lot disponibles
    const bulkActions = [
        { value: 'activate', label: 'Activer' },
        { value: 'deactivate', label: 'Désactiver' },
        { value: 'delete', label: 'Supprimer', dangerous: true }
    ];

    // Statistiques rapides
    const stats = {
        total: paymentMethods.length,
        active: paymentMethods.filter(method => method.is_active).length,
        inactive: paymentMethods.filter(method => !method.is_active).length,
    };

    return (
        <AdminLayout>
            <Head title="Méthodes de Paiement" />

            <div className="space-y-6">
                {/* Header avec statistiques */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <CreditCardIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Méthodes de Paiement</h1>
                                <p className="text-gray-600">Gérez les moyens de paiement acceptés</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Statistiques rapides */}
                            <div className="flex space-x-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                    <div className="text-xs text-gray-500">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                                    <div className="text-xs text-gray-500">Actives</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                                    <div className="text-xs text-gray-500">Inactives</div>
                                </div>
                            </div>

                            <Link
                                href={route('admin.payment-methods.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Ajouter une méthode
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Recherche */}
                        <div className="flex-1">
                            <form onSubmit={handleSearch} className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom ou code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </form>
                        </div>

                        {/* Filtres */}
                        <div className="flex items-center space-x-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="active">Actives</option>
                                <option value="inactive">Inactives</option>
                            </select>

                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Effacer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table des données */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <DataTable
                        data={filteredPaymentMethods}
                        columns={columns}
                        searchable={false} // Recherche gérée manuellement
                        selectable={true}
                        bulkActions={bulkActions}
                        onBulkAction={handleBulkAction}
                        emptyMessage="Aucune méthode de paiement trouvée"
                        className="rounded-xl"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}