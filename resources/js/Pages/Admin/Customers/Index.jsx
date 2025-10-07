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
    BuildingOfficeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ArchiveBoxIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';

export default function CustomersList() {
    const { customerList, filters, stats, flash } = usePage().props;
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters?.status !== null ? filters?.status : '',
        per_page: filters?.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);

        router.get(route('admin.customers.index'), {
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
        router.get(route('admin.customers.index'));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins un client.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} client(s) ?`)) {
                router.post(route('admin.customers.bulk-delete'), {
                    ids: selectedIds
                });
            }
        }
    };

    const handleDelete = (customerId) => {
        if (!customerId) {
            return;
        }
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            router.delete(route('admin.customers.destroy', customerId));
        }
    };

    const handleEdit = (customer) => {
        if (!customer || !customer.id) {
            return;
        }
        router.visit(route('admin.customers.edit', customer.id));
    };

    const handleView = (customerId) => {
        if (!customerId) {
            return;
        }
        router.visit(route('admin.customers.show', customerId));
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'image',
            label: 'Photo',
            render: (customer) => (
                <div className="flex-shrink-0 h-12 w-12">
                    {customer.image ? (
                        <img 
                            className="h-12 w-12 rounded-full object-cover" 
                            src={customer.image?.startsWith('http') ? customer.image : `/${customer.image}`} 
                            alt={`${customer.first_name} ${customer.last_name}`}
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'customer_info',
            label: 'Client',
            render: (customer) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.first_name} {customer.last_name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        {customer.email}
                    </div>
                    {customer.phone_one && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {customer.phone_one}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (customer) => {
                const isActive = customer.status === 1 || customer.status === true || customer.status === '1';
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {isActive ? (
                            <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Actif
                            </>
                        ) : (
                            <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Inactif
                            </>
                        )}
                    </span>
                );
            }
        },
        {
            key: 'orders_info',
            label: 'Commandes',
            render: (customer) => (
                <div className="text-sm">
                    <div className="text-gray-900 font-medium">
                        {customer.total_orders || 0} commande{(customer.total_orders || 0) > 1 ? 's' : ''}
                    </div>
                    {customer.total_amount && (
                        <div className="text-gray-500">
                            {parseFloat(customer.total_amount).toFixed(2)}€
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'address',
            label: 'Adresse',
            render: (customer) => (
                <span className="text-sm text-gray-500">
                    {customer.present_address ? 
                        (customer.present_address.length > 40 
                            ? customer.present_address.substring(0, 40) + '...' 
                            : customer.present_address
                        ) : 'Non renseignée'
                    }
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Date création',
            render: (customer) => (
                <span className="text-sm text-gray-500">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (customer) => handleView(customer?.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-blue-600 hover:text-blue-900'
        },
        {
            type: 'button',
            onClick: (customer) => handleEdit(customer),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (customer) => handleDelete(customer?.id),
            icon: TrashIcon,
            label: 'Supprimer',
            className: 'text-red-600 hover:text-red-900'
        }
    ];

    const bulkActions = [
        {
            label: 'Supprimer',
            value: 'delete',
            icon: TrashIcon,
            className: 'bg-red-600 text-white hover:bg-red-700'
        }
    ];

    const searchableFields = ['first_name', 'last_name', 'email', 'phone_one'];

    return (
        <AdminLayout>
            <Head title="Gestion des clients" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des clients</h1>
                        <p className="mt-2 text-gray-600">
                            Gérez vos clients et leur historique de commandes
                        </p>
                    </div>
                    <Link
                        href={route('admin.customers.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nouveau client
                    </Link>
                </div>

                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total clients
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.total_customers || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Clients actifs
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.active_customers || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <XCircleIcon className="h-6 w-6 text-red-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Clients inactifs
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.inactive_customers || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ArchiveBoxIcon className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Avec commandes
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.customers_with_orders || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Flash */}
                {flash?.success && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {flash.error}
                    </div>
                )}

                {/* Filtres et recherche */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Recherche principale */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Rechercher par nom, prénom, email, téléphone..."
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Rechercher
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                                >
                                    <FunnelIcon className="w-4 h-4 mr-2" />
                                    Filtres
                                </button>
                            </div>

                            {/* Filtres avancés */}
                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Statut
                                        </label>
                                        <select
                                            value={activeFilters.status}
                                            onChange={(e) => setActiveFilters({...activeFilters, status: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                                            onChange={(e) => setActiveFilters({...activeFilters, per_page: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value={15}>15</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => applyFilters()}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                        >
                                            Appliquer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Effacer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* DataTable */}
                <DataTable
                    data={Array.isArray(customerList) ? customerList : (customerList?.data || [])}
                    columns={columns}
                    actions={actions}
                    bulkActions={bulkActions}
                    searchableFields={searchableFields}
                    onBulkAction={handleBulkAction}
                    searchPlaceholder="Rechercher par nom, prénom, email ou téléphone..."
                    pagination={customerList?.links ? {
                        from: customerList.from,
                        to: customerList.to,
                        total: customerList.total,
                        links: customerList.links
                    } : null}
                />
            </div>
        </AdminLayout>
    );
}
