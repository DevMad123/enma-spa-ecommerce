import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { 
    MagnifyingGlassIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function List({ users, roles, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            search: searchTerm,
            role: selectedRole,
            status: selectedStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (type, value) => {
        const params = {
            search: searchTerm,
            role: selectedRole,
            status: selectedStatus,
        };
        
        params[type] = value;

        router.get(route('admin.users.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedStatus('');
        router.get(route('admin.users.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (user) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    const toggleStatus = (user) => {
        const action = (user.status == 1 || user.status === '1') ? 'désactiver' : 'activer';
        if (confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur "${user.name}" ?`)) {
            router.patch(route('admin.users.toggleStatus', user.id));
        }
    };

    const getStatusBadge = (status) => {
        if (status == 1 || status === '1') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Actif
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <XCircleIcon className="w-3 h-3 mr-1" />
                Inactif
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fonction pour gérer les actions groupées
    const handleBulkAction = (action, selectedIds) => {
        if (action === 'export') {
            const exportParams = new URLSearchParams({...filters, ids: selectedIds.join(',')});
            window.location.href = route('admin.users.export') + '?' + exportParams.toString();
        }
    };

    // Configuration DataTable
    const columns = [
        {
            key: 'name',
            label: 'Utilisateur',
            render: (user) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {user.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Rôle',
            render: (user) => (
                <div className="text-sm text-gray-900">
                    {user.roles && user.roles.length > 0 
                        ? user.roles.map(role => role.name).join(', ')
                        : 'Aucun rôle'
                    }
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (user) => getStatusBadge(user.status)
        },
        {
            key: 'created_at',
            label: 'Date d\'inscription',
            render: (user) => (
                <span className="text-sm text-gray-900">
                    {formatDate(user.created_at)}
                </span>
            )
        },
        {
            key: 'last_login',
            label: 'Dernière connexion',
            render: (user) => (
                <span className="text-sm text-gray-500">
                    {user.last_login_at ? formatDate(user.last_login_at) : 'Jamais connecté'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (user) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={route('admin.users.show', user.id)}
                        className="p-2 rounded-lg transition-colors text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                        title="Voir les détails"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('admin.users.edit', user.id)}
                        className="p-2 rounded-lg transition-colors text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                        title="Modifier"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => toggleStatus(user)}
                        className={`p-2 rounded-lg transition-colors hover:bg-opacity-50 ${
                            (user.status == 1 || user.status === '1') 
                                ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={(user.status == 1 || user.status === '1') ? 'Désactiver' : 'Activer'}
                    >
                        {(user.status == 1 || user.status === '1') ? (
                            <XCircleIcon className="h-4 w-4" />
                        ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={() => handleDelete(user)}
                        className="p-2 rounded-lg transition-colors text-red-600 hover:text-red-900 hover:bg-red-50"
                        title="Supprimer"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    const actions = [];

    const bulkActions = [
        {
            label: 'Exporter CSV',
            value: 'export',
            icon: AdjustmentsHorizontalIcon,
            className: 'bg-green-600 text-white hover:bg-green-700'
        }
    ];

    const searchableFields = ['name', 'email', 'first_name', 'last_name'];

    return (
        <AdminLayout>
            <Head title="Gestion des Utilisateurs" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                            {flash.error}
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                        <UserIcon className="h-5 w-5 mr-2" />
                                        Gestion des Utilisateurs
                                    </h3>
                                    <p className="mt-2 max-w-4xl text-sm text-gray-500">
                                        Gérez les utilisateurs de votre plateforme et leurs rôles.
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <Link
                                        href={route('admin.users.create')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Nouvel Utilisateur
                                    </Link>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    {/* Search */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rechercher
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Nom ou email..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Role Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rôle
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => {
                                                setSelectedRole(e.target.value);
                                                handleFilterChange('role', e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Tous les rôles</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.name}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Statut
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => {
                                                setSelectedStatus(e.target.value);
                                                handleFilterChange('status', e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Tous les statuts</option>
                                            <option value="1">Actif</option>
                                            <option value="0">Inactif</option>
                                        </select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-end space-x-2">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <MagnifyingGlassIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* DataTable */}
                    <div className="mt-6">
                        <DataTable
                            data={users.data || []}
                            columns={columns}
                            actions={actions}
                            bulkActions={bulkActions}
                            searchableFields={searchableFields}
                            onBulkAction={handleBulkAction}
                            searchPlaceholder="Rechercher par nom, prénom ou email..."
                            pagination={users.links ? {
                                from: users.from,
                                to: users.to,
                                total: users.total,
                                links: users.links
                            } : null}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}