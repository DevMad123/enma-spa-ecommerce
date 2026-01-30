import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    FolderIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

export default function BlogCategoriesIndex() {
    const { categories, filters, stats, flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        is_active: filters.is_active || '',
        per_page: filters.per_page || 15,
    });

    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);

        router.get(route('admin.blog.categories.index'), {
            search: searchTerm,
            ...updatedFilters,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setActiveFilters({ is_active: '', per_page: 15 });
        router.get(route('admin.blog.categories.index'));
    };

    const handleDelete = (categoryId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            router.delete(route('admin.blog.categories.destroy', categoryId));
        }
    };

    const handleEdit = (category) => {
        router.visit(route('admin.blog.categories.edit', category.id));
    };

    const columns = [
        {
            key: 'name',
            label: 'Catégorie',
            render: (category) => (
                <div className="flex items-center">
                    {category.image_url ? (
                        <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <FolderIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">{category.description}</div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'slug',
            label: 'Slug',
            render: (category) => (
                <div className="text-sm text-gray-600 font-mono">{category.slug}</div>
            )
        },
        {
            key: 'posts_count',
            label: 'Articles',
            render: (category) => (
                <div className="text-sm font-medium text-gray-900">
                    {category.posts_count || 0} article{category.posts_count > 1 ? 's' : ''}
                </div>
            )
        },
        {
            key: 'order',
            label: 'Ordre',
            render: (category) => (
                <div className="flex items-center text-sm text-gray-600">
                    <ArrowsUpDownIcon className="h-4 w-4 mr-1" />
                    {category.order}
                </div>
            )
        },
        {
            key: 'is_active',
            label: 'Statut',
            render: (category) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    category.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {category.is_active ? (
                        <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Active
                        </>
                    ) : (
                        <>
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Inactive
                        </>
                    )}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (category) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEdit(category)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        title="Modifier"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Supprimer"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            )
        },
    ];

    return (
        <AdminLayout>
            <Head title="Catégories de Blog" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FolderIcon className="h-8 w-8 mr-3 text-indigo-600" />
                                Catégories de Blog
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Gérez les catégories de votre blog
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('admin.blog.index')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                Retour aux Articles
                            </Link>
                            <Link
                                href={route('admin.blog.categories.create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Nouvelle Catégorie
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                <FolderIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Catégories</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.total_categories}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                <CheckCircleIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Actives</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.active_categories}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                                <XCircleIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Inactives</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.inactive_categories}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recherche */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher par nom ou description..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Rechercher
                            </button>
                            {(searchTerm || activeFilters.is_active) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                <select
                                    value={activeFilters.is_active}
                                    onChange={(e) => applyFilters({ is_active: e.target.value })}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="1">Actives</option>
                                    <option value="0">Inactives</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Tableau */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={categories.data}
                        pagination={categories}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
