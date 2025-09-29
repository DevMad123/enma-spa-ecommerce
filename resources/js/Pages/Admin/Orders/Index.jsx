import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { 
    MagnifyingGlassIcon, 
    PlusIcon, 
    EyeIcon, 
    PencilIcon, 
    TrashIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    BanknotesIcon,
    ShoppingBagIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function OrdersList() {
    const { orders, stats, customers, filters, orderStatuses, paymentStatuses, flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        customer_id: filters.customer_id || '',
        order_status: filters.order_status !== null ? filters.order_status : '',
        payment_status: filters.payment_status !== null ? filters.payment_status : '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);
        
        router.get(route('admin.orders.index'), {
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
            customer_id: '',
            order_status: '',
            payment_status: '',
            date_from: '',
            date_to: '',
            per_page: 15,
        });
        router.get(route('admin.orders.index'));
    };

    // Supprimer une commande
    const handleDelete = (order) => {
        if (confirm(`Êtes-vous sûr de vouloir annuler la commande ${order.order_reference} ?`)) {
            router.delete(route('admin.orders.destroy', order.id), {
                onSuccess: () => {
                    // Les messages flash sont gérés automatiquement
                }
            });
        }
    };

    // Exporter en CSV
    const handleExport = () => {
        const exportParams = new URLSearchParams({
            search: searchTerm,
            ...activeFilters,
        });
        window.location.href = route('admin.orders.export') + '?' + exportParams.toString();
    };

    // Obtenir le badge de statut de commande
    const getOrderStatusBadge = (status) => {
        const statusConfig = {
            0: { class: 'bg-yellow-100 text-yellow-800', text: orderStatuses[0] },
            1: { class: 'bg-blue-100 text-blue-800', text: orderStatuses[1] },
            2: { class: 'bg-purple-100 text-purple-800', text: orderStatuses[2] },
            3: { class: 'bg-orange-100 text-orange-800', text: orderStatuses[3] },
            4: { class: 'bg-red-100 text-red-800', text: orderStatuses[4] },
            5: { class: 'bg-red-100 text-red-800', text: orderStatuses[5] },
            6: { class: 'bg-green-100 text-green-800', text: orderStatuses[6] },
        };
        
        const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: 'Inconnu' };
        
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
                {config.text}
            </span>
        );
    };

    // Obtenir le badge de statut de paiement
    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            0: { class: 'bg-red-100 text-red-800', text: paymentStatuses[0] },
            1: { class: 'bg-green-100 text-green-800', text: paymentStatuses[1] },
            2: { class: 'bg-yellow-100 text-yellow-800', text: paymentStatuses[2] },
            3: { class: 'bg-purple-100 text-purple-800', text: paymentStatuses[3] },
        };
        
        const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: 'Inconnu' };
        
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
                {config.text}
            </span>
        );
    };

    // Configuration DataTable
    const columns = [
        {
            key: 'order_reference',
            label: 'Référence',
            render: (order) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {order.order_reference || `#${order.id}`}
                    </div>
                    <div className="text-sm text-gray-500">
                        ID: {order.id}
                    </div>
                </div>
            )
        },
        {
            key: 'customer',
            label: 'Client',
            render: (order) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {order.customer?.first_name} {order.customer?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                        {order.customer?.email}
                    </div>
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (order) => (
                <span className="text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </span>
            )
        },
        {
            key: 'total_amount',
            label: 'Montant',
            render: (order) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(order.total_payable_amount || 0)}
                    </div>
                    {order.total_due > 0 && (
                        <div className="text-sm text-red-600">
                            Dû: {new Intl.NumberFormat('fr-FR', { 
                                style: 'currency', 
                                currency: 'EUR' 
                            }).format(order.total_due)}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'order_status',
            label: 'Statut Commande',
            render: (order) => getOrderStatusBadge(order.order_status)
        },
        {
            key: 'payment_status',
            label: 'Paiement',
            render: (order) => getPaymentStatusBadge(order.payment_status)
        },
        {
            key: 'articles',
            label: 'Articles',
            render: (order) => (
                <span className="text-sm text-gray-900">
                    {order.sell_details?.length || 0} article(s)
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'link',
            href: (order) => route('admin.orders.show', order.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'link',
            href: (order) => route('admin.orders.edit', order.id),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-yellow-600 hover:text-yellow-900',
            condition: (order) => order.order_status < 6
        },
        {
            type: 'button',
            onClick: (order) => handleDelete(order),
            icon: TrashIcon,
            label: 'Annuler',
            className: 'text-red-600 hover:text-red-900',
            condition: (order) => order.order_status < 6
        }
    ];

    const bulkActions = [
        {
            label: 'Exporter CSV',
            value: 'export',
            icon: ArrowDownTrayIcon,
            className: 'bg-green-600 text-white hover:bg-green-700'
        }
    ];

    const handleBulkAction = (action, selectedIds) => {
        if (action === 'export') {
            handleExport();
        }
    };

    const searchableFields = ['order_number', 'customer.name', 'customer.email'];

    return (
        <AdminLayout>
            <Head title="Gestion des Commandes" />
            
            {/* En-tête avec statistiques */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
                    <Link
                        href={route('admin.orders.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Nouvelle Commande
                    </Link>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Commandes
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.total_orders}
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
                                    <BanknotesIcon className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Chiffre d'Affaires
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {new Intl.NumberFormat('fr-FR', { 
                                                style: 'currency', 
                                                currency: 'EUR' 
                                            }).format(stats.total_amount)}
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
                                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            En Attente
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.pending_orders}
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
                                            Terminées
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.completed_orders}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Flash */}
            {flash.success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {flash.success}
                </div>
            )}
            {flash.error && (
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
                                        placeholder="Rechercher par référence, client, email..."
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
                            <button
                                type="button"
                                onClick={handleExport}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                Export CSV
                            </button>
                        </div>

                        {/* Filtres avancés */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Client
                                    </label>
                                    <select
                                        value={activeFilters.customer_id}
                                        onChange={(e) => setActiveFilters({...activeFilters, customer_id: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tous les clients</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.first_name} {customer.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut Commande
                                    </label>
                                    <select
                                        value={activeFilters.order_status}
                                        onChange={(e) => setActiveFilters({...activeFilters, order_status: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tous les statuts</option>
                                        {Object.entries(orderStatuses).map(([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut Paiement
                                    </label>
                                    <select
                                        value={activeFilters.payment_status}
                                        onChange={(e) => setActiveFilters({...activeFilters, payment_status: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tous les paiements</option>
                                        {Object.entries(paymentStatuses).map(([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de début
                                    </label>
                                    <input
                                        type="date"
                                        value={activeFilters.date_from}
                                        onChange={(e) => setActiveFilters({...activeFilters, date_from: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de fin
                                    </label>
                                    <input
                                        type="date"
                                        value={activeFilters.date_to}
                                        onChange={(e) => setActiveFilters({...activeFilters, date_to: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
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
                data={orders.data || []}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par n° commande, nom client ou email..."
                pagination={orders.links ? {
                    from: orders.from,
                    to: orders.to,
                    total: orders.total,
                    links: orders.links
                } : null}
            />
        </AdminLayout>
    );
}