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
        if (action === 'delete') {
            if (confirm('Êtes-vous sûr de vouloir supprimer les marques sélectionnées ?')) {
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

                {/* DataTable */}
                <DataTable
                    data={brandList?.data || []}
                    columns={columns}
                    actions={actions}
                    bulkActions={bulkActions}
                    onBulkAction={handleBulkAction}
                    searchableFields={searchableFields}
                    filters={{
                        searchTerm,
                        setSearchTerm,
                        activeFilters,
                        setActiveFilters,
                        handleSearch,
                        clearFilters,
                        applyFilters,
                        showFilters,
                        setShowFilters
                    }}
                    pagination={brandList}
                    emptyMessage="Aucune marque trouvée"
                    emptyIcon={TagIcon}
                />
            </div>
        </AdminLayout>
    );
}
