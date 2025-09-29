import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CheckCircleIcon,
    XCircleIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import CustomerModal from "./CustomerModal";

export default function Index({ customers, filters, flash }) {
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [selectedItems, setSelectedItems] = useState([]);
    const [sortField, setSortField] = useState(filters?.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters?.direction || 'desc');

    // Stats calculées
    const stats = useMemo(() => {
        const customerList = Array.isArray(customers?.data) ? customers.data : customers || [];
        
        return {
            total: customerList.length,
            active: customerList.filter(c => c.status === 1 || c.status === 'active').length,
            inactive: customerList.filter(c => c.status === 0 || c.status === 'inactive').length,
            totalOrders: customerList.reduce((sum, c) => sum + (c.orders_count || 0), 0)
        };
    }, [customers]);

    // Gestion des filtres
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.customers.index'), {
            ...filters,
            search: searchTerm,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        router.get(route('admin.customers.index'), {
            ...filters,
            status: status,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        
        router.get(route('admin.customers.index'), {
            ...filters,
            sort: field,
            direction: direction,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Sélection des éléments
    const handleSelectAll = (e) => {
        const customerList = Array.isArray(customers?.data) ? customers.data : customers || [];
        if (e.target.checked) {
            setSelectedItems(customerList.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleBulkAction = (action) => {
        if (selectedItems.length === 0) {
            alert('Veuillez sélectionner au moins un client.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} client(s) ?`)) {
                router.post(route('admin.customers.bulk-delete'), {
                    ids: selectedItems
                });
            }
        } else if (action === 'export') {
            window.location.href = route('admin.customers.export', { ids: selectedItems.join(',') });
        } else if (action === 'activate') {
            router.post(route('admin.customers.bulk-activate'), {
                ids: selectedItems
            });
        } else if (action === 'deactivate') {
            router.post(route('admin.customers.bulk-deactivate'), {
                ids: selectedItems
            });
        }
    };

    const handleDelete = (customerId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            router.delete(route('admin.customers.destroy', customerId));
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowCustomerModal(true);
    };

    const handleView = (customerId) => {
        router.visit(route('admin.customers.show', customerId));
    };

    const customerList = Array.isArray(customers?.data) ? customers.data : customers || [];
    const isAllSelected = customerList.length > 0 && selectedItems.length === customerList.length;
    const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < customerList.length;

    return (
        <AdminLayout>
            <Head title="Clients" />

            <div className="space-y-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez vos clients e-commerce
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex-none">
                        <button
                            onClick={() => setShowCustomerModal(true)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau client
                        </button>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-700">{flash.success}</div>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{flash.error}</div>
                    </div>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
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
                                        <dt className="text-sm font-medium text-gray-500 truncate">Clients Actifs</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
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
                                        <dt className="text-sm font-medium text-gray-500 truncate">Clients Inactifs</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.inactive}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DocumentArrowDownIcon className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Commandes</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            {/* Recherche */}
                            <div className="sm:col-span-2">
                                <form onSubmit={handleSearch}>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Rechercher par nom, email ou téléphone..."
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Filtre statut */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="1">Actif</option>
                                    <option value="0">Inactif</option>
                                </select>
                            </div>

                            {/* Actions groupées */}
                            <div>
                                {selectedItems.length > 0 && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleBulkAction('activate')}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                            title="Activer"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('deactivate')}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700"
                                            title="Désactiver"
                                        >
                                            <XCircleIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('export')}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                                            title="Exporter"
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('delete')}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={input => {
                                                if (input) input.indeterminate = isPartiallySelected;
                                            }}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avatar
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('first_name')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Nom</span>
                                            {sortField === 'first_name' && (
                                                <span className="text-indigo-600">
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Téléphone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Adresse
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Statut</span>
                                            {sortField === 'status' && (
                                                <span className="text-indigo-600">
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Commandes
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Inscription</span>
                                            {sortField === 'created_at' && (
                                                <span className="text-indigo-600">
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customerList.length > 0 ? (
                                    customerList.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(customer.id)}
                                                    onChange={() => handleSelectItem(customer.id)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {customer.image || customer.avatar ? (
                                                        <img
                                                            src={customer.image_url || customer.image || customer.avatar}
                                                            alt={`${customer.first_name} ${customer.last_name}`}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {customer.first_name} {customer.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                                                        {customer.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {customer.phone_one || customer.phone ? (
                                                        <div className="flex items-center">
                                                            <PhoneIcon className="h-3 w-3 mr-1" />
                                                            {customer.phone_one || customer.phone}
                                                        </div>
                                                    ) : (
                                                        <span className="italic">Non renseigné</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 max-w-xs">
                                                    {customer.present_address || customer.address ? (
                                                        <div className="flex items-start">
                                                            <MapPinIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                                            <span>
                                                                {(customer.present_address || customer.address).length > 40 ? 
                                                                `${(customer.present_address || customer.address).substring(0, 40)}...` : 
                                                                (customer.present_address || customer.address)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="italic">Non renseigné</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    customer.status === 1 || customer.status === 'active'
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {customer.status === 1 || customer.status === 'active' ? (
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-500">
                                                    {customer.orders_count || customer.total_orders || 0} commande{(customer.orders_count || customer.total_orders || 0) > 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-500">
                                                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    }) : "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleView(customer.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Voir les détails"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(customer)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Modifier"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(customer.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun client</h3>
                                            <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier client.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {customers?.links && customers.links.length > 3 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {customers.prev_page_url && (
                                    <Link
                                        href={customers.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Précédent
                                    </Link>
                                )}
                                {customers.next_page_url && (
                                    <Link
                                        href={customers.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Suivant
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Affichage de {customers.from || 0} à {customers.to || 0} sur {customers.total || 0} résultats
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {customers.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                preserveState
                                                preserveScroll
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal CustomerModal */}
            {showCustomerModal && (
                <CustomerModal
                    open={showCustomerModal}
                    onClose={() => {
                        setShowCustomerModal(false);
                        setEditingCustomer(null);
                    }}
                    mode={editingCustomer ? "edit" : "create"}
                    customer={editingCustomer}
                />
            )}
        </AdminLayout>
    );
}