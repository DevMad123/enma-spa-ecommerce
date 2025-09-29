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
import SizeModal from "./SizeModal";

export default function SizesList() {
    const { sizes, filters, stats, flash } = usePage().props;
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [editingSize, setEditingSize] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);
        
        router.get(route('admin.sizes.list'), {
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
        router.get(route('admin.sizes.list'));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins une taille.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} taille(s) ?`)) {
                router.post(route('admin.sizes.bulk-delete'), {
                    ids: selectedIds
                });
            }
        } else if (action === 'export') {
            const exportParams = new URLSearchParams({
                search: searchTerm,
                ...activeFilters,
            });
            window.location.href = route('admin.sizes.export') + '?' + exportParams.toString();
        }
    };

    const handleDelete = (sizeId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette taille ?')) {
            router.delete(route('admin.sizes.deleteSizes', sizeId));
        }
    };

    const handleEdit = (size) => {
        setEditingSize(size);
        setShowSizeModal(true);
    };

    const handleView = (sizeId) => {
        router.visit(route('admin.sizes.show', sizeId));
    };

    // Exporter en CSV
    const handleExport = () => {
        const exportParams = new URLSearchParams({
            search: searchTerm,
            ...activeFilters,
        });
        window.location.href = route('admin.sizes.export') + '?' + exportParams.toString();
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'id',
            label: 'ID',
            render: (size) => (
                <span className="text-sm font-medium text-gray-900">#{size.id}</span>
            )
        },
        {
            key: 'size',
            label: 'Taille',
            render: (size) => (
                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center">
                        <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-lg text-gray-700 font-semibold text-sm">
                            {size.size}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'size_display',
            label: 'Affichage',
            render: (size) => (
                <span className="text-sm text-gray-900 font-medium">
                    {size.size}
                </span>
            )
        },
        {
            key: 'products_count',
            label: 'Produits',
            render: (size) => (
                <span className="text-sm text-gray-500">
                    {size.products_count || 0} produit{(size.products_count || 0) > 1 ? 's' : ''}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Date création',
            render: (size) => (
                <span className="text-sm text-gray-500">
                    {size.created_at ? new Date(size.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (size) => handleEdit(size),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (size) => handleDelete(size.id),
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

    const searchableFields = ['size'];

    return (
        <AdminLayout>
            <Head title="Gestion des Tailles" />
            
            {/* En-tête avec statistiques */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Tailles</h1>
                    <button
                        onClick={() => setShowSizeModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Nouvelle Taille
                    </button>
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
                                            Total Tailles
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {Array.isArray(sizes) ? sizes.length : 0}
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
                                    <CubeIcon className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Avec Produits
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {Array.isArray(sizes) ? sizes.filter(s => (s.products_count || 0) > 0).length : 0}
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
                                    <CheckCircleIcon className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Populaires
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {Array.isArray(sizes) ? sizes.filter(s => (s.products_count || 0) > 5).length : 0}
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
                                            {Array.isArray(sizes) ? sizes.filter(s => {
                                                const weekAgo = new Date();
                                                weekAgo.setDate(weekAgo.getDate() - 7);
                                                return new Date(s.created_at) >= weekAgo;
                                            }).length : 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                        placeholder="Rechercher par taille..."
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
                data={Array.isArray(sizes) ? sizes : []}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par taille..."
                pagination={null}
            />

            {/* Modal SizeModal */}
            {showSizeModal && (
                <SizeModal
                    open={showSizeModal}
                    onClose={() => {
                        setShowSizeModal(false);
                        setEditingSize(null);
                    }}
                    mode={editingSize ? "edit" : "create"}
                    size={editingSize}
                />
            )}
        </AdminLayout>
    );
}