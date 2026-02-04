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
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    CubeIcon,
    StarIcon,
    ClockIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function CategoriesList() {
    const { categoryList, stats, filters, flash } = usePage().props;
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status !== null ? filters.status : '',
        is_popular: filters.is_popular || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        products_count_filter: filters.products_count_filter || '',
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);

        router.get(route('admin.categories.list'), {
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
            is_popular: '',
            date_from: '',
            date_to: '',
            products_count_filter: '',
            per_page: 15,
        });
        router.get(route('admin.categories.list'));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins une catégorie.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} catégorie(s) ?`)) {
                router.post(route('admin.categories.bulk-delete'), {
                    ids: selectedIds
                });
            }
        } else if (action === 'export') {
            const exportParams = new URLSearchParams({
                search: searchTerm,
                ...activeFilters,
            });
            window.location.href = route('admin.categories.export') + '?' + exportParams.toString();
        } else if (action === 'activate') {
            router.post(route('admin.categories.bulk-activate'), {
                ids: selectedIds
            });
        } else if (action === 'deactivate') {
            router.post(route('admin.categories.bulk-deactivate'), {
                ids: selectedIds
            });
        }
    };

    const handleDelete = (categoryId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            router.delete(route('admin.categories.destroy', categoryId));
        }
    };

    const handleEdit = (category) => {
        // Nouvelle méthode : rediriger vers la page d'édition dédiée
        router.visit(route('admin.categories.edit', category.id));
    };

    const handleView = (categoryId) => {
        router.visit(route('admin.categories.show', categoryId));
    };

    // Exporter en CSV
    const handleExport = () => {
        const exportParams = new URLSearchParams({
            search: searchTerm,
            ...activeFilters,
        });
        window.location.href = route('admin.categories.export') + '?' + exportParams.toString();
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'image',
            label: 'Image',
            render: (category) => (
                <Link href={route('admin.categories.show', category.id)} className="flex-shrink-0 h-12 w-12 block hover:opacity-80 transition">
                    {category.image ? (
                        <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={category.image}
                            alt={category.name}
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <TagIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </Link>
            )
        },
        {
            key: 'name',
            label: 'Nom',
            render: (category) => (
                <Link href={route('admin.categories.show', category.id)} className="block hover:text-indigo-600 transition">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">Slug: {category.slug || 'N/A'}</div>
                </Link>
            )
        },
        {
            key: 'parent',
            label: 'Catégorie parente',
            render: (category) => (
                category.parent ? (
                    <Link 
                        href={route('admin.categories.show', category.parent.id)} 
                        className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                        {category.parent.name}
                    </Link>
                ) : (
                    <span className="text-sm text-gray-400 italic">Racine</span>
                )
            )
        },
        {
            key: 'description',
            label: 'Description',
            render: (category) => (
                <div className="text-sm text-gray-900 max-w-xs">
                    {category.note ?
                        (category.note.length > 50
                            ? category.note.substring(0, 50) + '...'
                            : category.note
                        ) : 'Aucune description'
                    }
                </div>
            )
        },
        {
            key: 'products_count',
            label: 'Produits',
            render: (category) => (
                <span className="text-sm text-gray-500">
                    {category.products_count || 0} produit{(category.products_count || 0) > 1 ? 's' : ''}
                </span>
            )
        },
        {
            key: 'is_popular',
            label: 'Populaire',
            render: (category) => {
                const isPopular = category.is_popular === 1 || category.is_popular === true || category.is_popular === '1';
                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isPopular
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {isPopular ? (
                            <>
                                <StarIcon className="h-3 w-3 mr-1" />
                                Populaire
                            </>
                        ) : (
                            'Standard'
                        )}
                    </span>
                );
            }
        },
        {
            key: 'status',
            label: 'Statut',
            render: (category) => {
                const isActive = category.status === 1 || category.status === true || category.status === '1';
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
            key: 'created_at',
            label: 'Date création',
            render: (category) => (
                <span className="text-sm text-gray-500">
                    {category.created_at ? new Date(category.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (category) => handleView(category.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-blue-600 hover:text-blue-900'
        },
        {
            type: 'button',
            onClick: (category) => handleEdit(category),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (category) => handleDelete(category.id),
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

    const searchableFields = ['name', 'slug', 'note'];

    return (
        <AdminLayout>
            <Head title="Gestion des Catégories" />

            {/* En-tête avec statistiques */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
                    <Link
                        href={route('admin.categories.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Nouvelle Catégorie
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
                                            Total Catégories
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.total_categories || 0}
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
                                            Catégories Actives
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.active_categories || 0}
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
                                    <StarIcon className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Populaires
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.popular_categories || 0}
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
                                    <CubeIcon className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Avec Produits
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.categories_with_products || 0}
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
                                        placeholder="Rechercher par nom, slug ou description..."
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
                                        Popularité
                                    </label>
                                    <select
                                        value={activeFilters.is_popular}
                                        onChange={(e) => setActiveFilters({...activeFilters, is_popular: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Toutes</option>
                                        <option value="1">Populaires</option>
                                        <option value="0">Standard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Produits
                                    </label>
                                    <select
                                        value={activeFilters.products_count_filter}
                                        onChange={(e) => setActiveFilters({...activeFilters, products_count_filter: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Toutes</option>
                                        <option value="with_products">Avec produits</option>
                                        <option value="without_products">Sans produits</option>
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
                data={Array.isArray(categoryList) ? categoryList : (categoryList?.data || [])}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par nom, slug ou description..."
                pagination={categoryList?.links ? {
                    from: categoryList.from,
                    to: categoryList.to,
                    total: categoryList.total,
                    links: categoryList.links
                } : null}
            />
        </AdminLayout>
    );
}
