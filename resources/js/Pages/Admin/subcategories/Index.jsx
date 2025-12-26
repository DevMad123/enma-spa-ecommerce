import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { normalizeImageUrl } from '@/Utils/imageUtils';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    CubeIcon,
    Squares2X2Icon,
    ClockIcon,
    ArchiveBoxIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    FolderIcon
} from '@heroicons/react/24/outline';

export default function SubcategoriesList() {
    const { subcategoryList, categoryList, stats, filters, flash, auth } = usePage().props;
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status !== null ? filters.status : '',
        category_id: filters.category_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        products_count_filter: filters.products_count_filter || '',
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Données à utiliser
    const subcategories = subcategoryList || { data: [], links: [] };
    const categories = categoryList || [];

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);

        router.get(route('admin.subcategories.index'), {
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
            category_id: '',
            date_from: '',
            date_to: '',
            products_count_filter: '',
            per_page: 15,
        });
        router.get(route('admin.subcategories.index'));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins une sous-catégorie.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} sous-catégorie(s) ?`)) {
                router.post(route('admin.subcategories.bulk-delete'), {
                    ids: selectedIds
                });
            }
        } else if (action === 'export') {
            const exportParams = new URLSearchParams({
                search: searchTerm,
                ...activeFilters,
            });
            window.location.href = route('admin.subcategories.export') + '?' + exportParams.toString();
        } else if (action === 'activate') {
            router.post(route('admin.subcategories.bulk-activate'), {
                ids: selectedIds
            });
        } else if (action === 'deactivate') {
            router.post(route('admin.subcategories.bulk-deactivate'), {
                ids: selectedIds
            });
        }
    };

    const handleDelete = (subcategoryId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
            router.delete(route('admin.subcategories.destroy', subcategoryId));
        }
    };

    const handleEdit = (subcategory) => {
        // Navigation vers la page d'édition dédiée
        router.visit(route('admin.subcategories.edit', subcategory.id));
    };

    const handleView = (subcategoryId) => {
        router.visit(route('admin.subcategories.show', subcategoryId));
    };

    // Exporter en CSV
    const handleExport = () => {
        const exportParams = new URLSearchParams({
            search: searchTerm,
            ...activeFilters,
        });
        window.location.href = route('admin.subcategories.export') + '?' + exportParams.toString();
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'image',
            label: 'Image',
            render: (subcategory) => (
                <Link href={route('admin.subcategories.show', subcategory.id)} className="block hover:opacity-80 transition">
                    <div className="flex-shrink-0 h-12 w-12">
                        {subcategory.image ? (
                            <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={normalizeImageUrl(subcategory.image)}
                                alt={subcategory.name}
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <TagIcon className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                </Link>
            )
        },
        {
            key: 'name',
            label: 'Nom',
            render: (subcategory) => (
                <Link href={route('admin.subcategories.show', subcategory.id)} className="block hover:text-indigo-600 transition">
                    <div>
                        <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                        <div className="text-sm text-gray-500">Slug: {subcategory.slug || 'N/A'}</div>
                    </div>
                </Link>
            )
        },
        {
            key: 'category',
            label: 'Catégorie parente',
            render: (subcategory) => (
                <div className="text-sm text-gray-900">
                    {subcategory.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {subcategory.category.name}
                        </span>
                    ) : (
                        <span className="text-gray-400 italic">Non assignée</span>
                    )}
                </div>
            )
        },
        {
            key: 'description',
            label: 'Description',
            render: (subcategory) => (
                <div className="text-sm text-gray-900 max-w-xs">
                    {subcategory.note ?
                        (subcategory.note.length > 50
                            ? subcategory.note.substring(0, 50) + '...'
                            : subcategory.note
                        ) : 'Aucune description'
                    }
                </div>
            )
        },
        {
            key: 'products_count',
            label: 'Produits',
            render: (subcategory) => (
                <span className="text-sm text-gray-500">
                    {subcategory.products_count || 0} produit{(subcategory.products_count || 0) > 1 ? 's' : ''}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (subcategory) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subcategory.status === true || subcategory.status === 1 || subcategory.status === "1"
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {subcategory.status === true || subcategory.status === 1 || subcategory.status === "1" ? (
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
            )
        },
        {
            key: 'created_at',
            label: 'Date création',
            render: (subcategory) => (
                <span className="text-sm text-gray-500">
                    {subcategory.created_at ? new Date(subcategory.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (subcategory) => handleView(subcategory.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-blue-600 hover:text-blue-900'
        },
        {
            type: 'button',
            onClick: (subcategory) => handleEdit(subcategory),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (subcategory) => handleDelete(subcategory.id),
            icon: TrashIcon,
            label: 'Supprimer',
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

    const searchableFields = ['name', 'slug', 'note', 'category.name'];

    return (
        <AdminLayout>
            <Head title="Gestion des Sous-catégories" />

            {/* En-tête avec statistiques */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Sous-catégories</h1>
                    <Link
                        href={route('admin.subcategories.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Nouvelle Sous-catégorie
                    </Link>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TagIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Sous-catégories
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.total_subcategories || 0}
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
                                            Sous-catégories Actives
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.active_subcategories || 0}
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
                                            {stats?.subcategories_with_products || 0}
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
                                    <FolderIcon className="h-6 w-6 text-orange-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Par Catégories
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {typeof stats?.subcategories_by_category === 'object'
                                                ? Object.keys(stats.subcategories_by_category || {}).length
                                                : stats?.subcategories_by_category || 0}
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
                                        placeholder="Rechercher par nom, slug, description..."
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
                            <button
                                type="button"
                                onClick={handleExport}
                                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
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
                                        Catégorie parente
                                    </label>
                                    <select
                                        value={activeFilters.category_id}
                                        onChange={(e) => setActiveFilters({...activeFilters, category_id: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Toutes les catégories</option>
                                        {categories?.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

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
                                        Nombre de produits
                                    </label>
                                    <select
                                        value={activeFilters.products_count_filter}
                                        onChange={(e) => setActiveFilters({...activeFilters, products_count_filter: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tous</option>
                                        <option value="with_products">Avec produits</option>
                                        <option value="without_products">Sans produits</option>
                                        <option value="many_products">Beaucoup de produits (&gt;10)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de création (de)
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
                                        Date de création (à)
                                    </label>
                                    <input
                                        type="date"
                                        value={activeFilters.date_to}
                                        onChange={(e) => setActiveFilters({...activeFilters, date_to: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="flex items-end space-x-2 md:col-span-2 lg:col-span-3">
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
                data={Array.isArray(subcategories) ? subcategories : (subcategories?.data || [])}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par nom, slug ou description..."
                pagination={subcategories?.links ? {
                    from: subcategories.from,
                    to: subcategories.to,
                    total: subcategories.total,
                    links: subcategories.links
                } : null}
            />
        </AdminLayout>
    );
}
