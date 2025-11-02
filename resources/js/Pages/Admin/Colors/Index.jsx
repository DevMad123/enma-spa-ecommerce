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
    RectangleStackIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    CubeIcon,
    ClockIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function ColorsList() {
    const { colorList, filters, stats, flash } = usePage().props;
    const [editingColor, setEditingColor] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);

        router.get(route('admin.colors.list'), {
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
            per_page: 15,
        });
        router.get(route('admin.colors.list'));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins une couleur.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} couleur(s) ?`)) {
                router.post(route('admin.colors.bulk-delete'), {
                    ids: selectedIds
                });
            }
        } else if (action === 'export') {
            const exportParams = new URLSearchParams({
                search: searchTerm,
                ...activeFilters,
            });
            window.location.href = route('admin.colors.export') + '?' + exportParams.toString();
        }
    };

    const handleDelete = (colorId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette couleur ?')) {
            router.delete(route('admin.colors.destroy', colorId));
        }
    };

    const handleEdit = (color) => {
        router.visit(route('admin.colors.edit', color.id));
    };

    const handleView = (colorId) => {
        router.visit(route('admin.colors.show', colorId));
    };

    // Exporter en CSV
    const handleExport = () => {
        const exportParams = new URLSearchParams({
            search: searchTerm,
            ...activeFilters,
        });
        window.location.href = route('admin.colors.export') + '?' + exportParams.toString();
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'id',
            label: 'ID',
            render: (color) => (
                <span className="text-sm font-medium text-gray-900">#{color.id}</span>
            )
        },
        {
            key: 'color',
            label: 'Aperçu',
            render: (color) => (
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 border border-gray-300 rounded-full shadow-sm"
                        style={{
                            backgroundColor: color.color_code || "#e5e7eb",
                        }}
                        title={color.color_code || "Pas de code couleur"}
                    ></div>
                </div>
            )
        },
        {
            key: 'name',
            label: 'Nom',
            render: (color) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{color.name}</div>
                    <div className="text-sm text-gray-500">
                        {color.color_code ? (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {color.color_code}
                            </span>
                        ) : (
                            <span className="text-gray-400">N/A</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'products_count',
            label: 'Produits',
            render: (color) => (
                <span className="text-sm text-gray-500">
                    {color.products_count || 0} produit{(color.products_count || 0) > 1 ? 's' : ''}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Date création',
            render: (color) => (
                <span className="text-sm text-gray-500">
                    {color.created_at ? new Date(color.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (color) => handleView(color.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-blue-600 hover:text-blue-900'
        },
        {
            type: 'button',
            onClick: (color) => handleEdit(color),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (color) => handleDelete(color.id),
            icon: TrashIcon,
            label: 'Supprimer',
            className: 'text-red-600 hover:text-red-900'
        }
    ];

    // Configuration des actions groupées
    const bulkActions = [
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

    const searchableFields = ['name', 'color_code'];

    return (
        <AdminLayout>
            <Head title="Gestion des Couleurs" />

            {/* En-tête avec statistiques */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Couleurs</h1>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.colors.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-semibold text-sm text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Nouvelle Couleur
                        </Link>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <RectangleStackIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Couleurs
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {colorList?.total || 0}
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
                                            Avec Code
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {colorList?.data?.filter(c => c.color_code).length || 0}
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
                                    <CubeIcon className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Avec Produits
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {colorList?.data?.filter(c => (c.products_count || 0) > 0).length || 0}
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
                                    <ClockIcon className="h-6 w-6 text-orange-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Cette Semaine
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {colorList?.data?.filter(c => {
                                                const weekAgo = new Date();
                                                weekAgo.setDate(weekAgo.getDate() - 7);
                                                return new Date(c.created_at) >= weekAgo;
                                            }).length || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Flash */}
            {/* {flash?.success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )} */}

            {/* Filtres et recherche */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Recherche principale */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher par nom ou code couleur..."
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Rechercher
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
                    </form>
                </div>
            </div>

            {/* DataTable */}
            <DataTable
                data={Array.isArray(colorList) ? colorList : (colorList?.data || [])}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par nom ou code couleur..."
                pagination={colorList?.links ? {
                    from: colorList.from,
                    to: colorList.to,
                    total: colorList.total,
                    links: colorList.links
                } : null}
            />
        </AdminLayout>
    );
}


