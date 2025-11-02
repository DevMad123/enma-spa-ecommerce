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
    TagIcon
} from '@heroicons/react/24/outline';

export default function BrandsList() {
    const { brandList, filters, stats, flash } = usePage().props;
    
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

        router.get(route('admin.brands.index'), {
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
        router.get(route('admin.brands.index'));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins une marque.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} marque(s) ?`)) {
                router.post(route('admin.brands.bulk-delete'), {
                    ids: selectedIds
                });
            }
        }
    };

    const handleDelete = (brandId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) {
            router.delete(route('admin.brands.destroy', brandId));
        }
    };

    const handleEdit = (brand) => {
        router.visit(route('admin.brands.edit', brand.id));
    };

    const handleView = (brandId) => {
        router.visit(route('admin.brands.show', brandId));
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'image',
            label: 'Logo',
            render: (brand) => (
                <div className="flex-shrink-0 h-12 w-12">
                    {brand.image ? (
                        <img 
                            className="h-12 w-12 rounded-lg object-cover" 
                            src={brand.image?.startsWith('http') ? brand.image : `/${brand.image}`} 
                            alt={brand.name}
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <TagIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'brand_info',
            label: 'Marque',
            render: (brand) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                        <TagIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {brand.name}
                    </div>
                    {brand.description && (
                        <div className="text-sm text-gray-500">
                            {brand.description.length > 50 
                                ? brand.description.substring(0, 50) + '...' 
                                : brand.description
                            }
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (brand) => {
                const isActive = brand.status === 1 || brand.status === true || brand.status === '1';
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
            key: 'products_count',
            label: 'Produits',
            render: (brand) => (
                <span className="text-sm text-gray-500">
                    {brand.products_count || 0} produit{(brand.products_count || 0) > 1 ? 's' : ''}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Date création',
            render: (brand) => (
                <span className="text-sm text-gray-500">
                    {brand.created_at ? new Date(brand.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (brand) => handleView(brand.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-blue-600 hover:text-blue-900'
        },
        {
            type: 'button',
            onClick: (brand) => handleEdit(brand),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (brand) => handleDelete(brand.id),
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

    const searchableFields = ['name', 'description', 'slug'];

    return (
        <AdminLayout>
            <Head title="Gestion des marques" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des marques</h1>
                        <p className="mt-2 text-gray-600">
                            Gérez les marques de votre catalogue produits
                        </p>
                    </div>
                    <Link
                        href={route('admin.brands.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nouvelle marque
                    </Link>
                </div>

                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total marques
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.total_brands || 0}
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
                                                Marques actives
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.active_brands || 0}
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
                                                Marques inactives
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.inactive_brands || 0}
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
                                        <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Avec produits
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.brands_with_products || 0}
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
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Rechercher par nom, description..."
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
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center"
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
                    data={Array.isArray(brandList) ? brandList : (brandList?.data || [])}
                    columns={columns}
                    actions={actions}
                    bulkActions={bulkActions}
                    searchableFields={searchableFields}
                    onBulkAction={handleBulkAction}
                    searchPlaceholder="Rechercher par nom ou description..."
                    pagination={brandList?.links ? {
                        from: brandList.from,
                        to: brandList.to,
                        total: brandList.total,
                        links: brandList.links
                    } : null}
                />
            </div>
        </AdminLayout>
    );
}
