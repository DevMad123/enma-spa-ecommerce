import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { 
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function ShippingsList() {
    const { shippings, stats, filters, flash } = usePage().props;
    const [editingShipping, setEditingShipping] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status || '',
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);
        
        router.get(route('admin.shippings.index'), {
            search: searchTerm,
            ...updatedFilters,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Recherche
    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // Effacer les filtres
    const clearFilters = () => {
        setSearchTerm('');
        setActiveFilters({
            status: '',
            per_page: 15,
        });
        router.get(route('admin.shippings.index'));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins un mode de livraison.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} mode(s) de livraison ?`)) {
                router.post(route('admin.shippings.bulk-delete'), {
                    ids: selectedIds
                });
            }
        } else if (action === 'export') {
            const exportParams = new URLSearchParams({
                search: searchTerm,
                ...activeFilters,
                ids: selectedIds.join(',')
            });
            window.location.href = route('admin.shippings.export') + '?' + exportParams.toString();
        } else if (action === 'activate') {
            router.post(route('admin.shippings.bulk-activate'), {
                ids: selectedIds
            });
        } else if (action === 'deactivate') {
            router.post(route('admin.shippings.bulk-deactivate'), {
                ids: selectedIds
            });
        }
    };

    const handleDelete = (shippingId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce mode de livraison ?')) {
            router.delete(route('admin.shippings.destroy', shippingId));
        }
    };

    const handleEdit = (shipping) => {
        setEditingShipping(shipping);
    };

    const handleView = (shippingId) => {
        router.visit(route('admin.shippings.show', shippingId));
    };

    const toggleStatus = (shipping) => {
        router.patch(route('admin.shippings.toggle', shipping.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Exporter en CSV
    const handleExport = () => {
        const exportParams = new URLSearchParams({
            search: searchTerm,
            ...activeFilters,
        });
        window.location.href = route('admin.shippings.export') + '?' + exportParams.toString();
    };

    const getStatusBadge = (isActive) => {
        const config = isActive 
            ? { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Actif' }
            : { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Inactif' };
        
        const Icon = config.icon;

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${config.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.text}
            </span>
        );
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'name',
            label: 'Mode de livraison',
            render: (shipping) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <TruckIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {shipping.name}
                        </div>
                        {shipping.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                {shipping.description}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'price',
            label: 'Prix',
            render: (shipping) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {shipping.price == 0 ? (
                            <span className="text-green-600 font-semibold">Gratuit</span>
                        ) : (
                            `${new Intl.NumberFormat('fr-FR').format(shipping.price)} XOF`
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'estimated_days',
            label: 'Délai',
            render: (shipping) => (
                <div className="text-sm text-gray-500">
                    {shipping.estimated_days 
                        ? `${shipping.estimated_days} jour${shipping.estimated_days > 1 ? 's' : ''}`
                        : 'Non défini'
                    }
                </div>
            )
        },
        {
            key: 'is_active',
            label: 'Statut',
            render: (shipping) => getStatusBadge(shipping.is_active)
        },
        {
            key: 'sells_count',
            label: 'Commandes',
            render: (shipping) => (
                <div className="text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {shipping.sells_count || 0} commande{(shipping.sells_count || 0) > 1 ? 's' : ''}
                    </span>
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Date création',
            render: (shipping) => (
                <span className="text-sm text-gray-500">
                    {shipping.created_at ? new Date(shipping.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (shipping) => handleView(shipping.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-blue-600 hover:text-blue-900'
        },
        {
            type: 'button',
            onClick: (shipping) => handleEdit(shipping),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (shipping) => toggleStatus(shipping),
            icon: CheckCircleIcon,
            label: 'Activer/Désactiver',
            className: 'text-green-600 hover:text-green-900'
        },
        {
            type: 'button',
            onClick: (shipping) => handleDelete(shipping.id),
            icon: TrashIcon,
            label: 'Supprimer',
            className: 'text-red-600 hover:text-red-900'
        }
    ];

    // Configuration des actions groupées
    const bulkActions = [
        {
            label: 'Activer',
            value: 'activate',
            icon: CheckCircleIcon,
            className: 'bg-green-600 text-white hover:bg-green-700'
        },
        {
            label: 'Désactiver',
            value: 'deactivate',
            icon: XCircleIcon,
            className: 'bg-orange-600 text-white hover:bg-orange-700'
        },
        {
            label: 'Supprimer',
            value: 'delete',
            icon: TrashIcon,
            className: 'bg-red-600 text-white hover:bg-red-700'
        },
        {
            label: 'Exporter CSV',
            value: 'export',
            icon: ArrowDownTrayIcon,
            className: 'bg-blue-600 text-white hover:bg-blue-700'
        }
    ];

    const searchableFields = ['name', 'description', 'price', 'delivery_time'];

    return (
        <AdminLayout>
            <Head title="Modes de livraison" />

            <div className="mb-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Modes de Livraison</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez les différents modes de livraison et leurs tarifs
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex-none">
                        <Link
                            href={route('admin.shippings.create')}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau mode de livraison
                        </Link>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    {flash.error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tableau de bord statistiques */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <TruckIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Modes</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.total || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <CheckCircleIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Modes Actifs</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.active || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                    <XCircleIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Modes Inactifs</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.inactive || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <ArchiveBoxIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Commandes Total</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.total_orders || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom, description..."
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <FunnelIcon className="h-4 w-4 mr-2" />
                                    Filtres
                                    {Object.values(activeFilters).some(value => value && value !== 15) && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            Actifs
                                        </span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExport}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Export
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Rechercher
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Statut
                                        </label>
                                        <select
                                            value={activeFilters.status}
                                            onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Tous les statuts</option>
                                            <option value="1">Actif</option>
                                            <option value="0">Inactif</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Éléments par page
                                        </label>
                                        <select
                                            value={activeFilters.per_page}
                                            onChange={(e) => setActiveFilters(prev => ({ ...prev, per_page: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="15">15 par page</option>
                                            <option value="25">25 par page</option>
                                            <option value="50">50 par page</option>
                                            <option value="100">100 par page</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Effacer tous les filtres
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyFilters()}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                    >
                                        Appliquer les filtres
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* DataTable */}
            <DataTable
                data={shippings.data || []}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par nom, description ou prix..."
                pagination={shippings.links ? {
                    from: shippings.from,
                    to: shippings.to,
                    total: shippings.total,
                    links: shippings.links
                } : null}
            />
        </AdminLayout>
    );
}