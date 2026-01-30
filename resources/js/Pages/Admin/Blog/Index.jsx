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
    NewspaperIcon,
    CheckCircleIcon,
    XCircleIcon,
    FunnelIcon,
    ClockIcon,
    EyeIcon as ViewsIcon,
    StarIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

export default function BlogIndex() {
    const { blogPosts, categories, authors, filters, stats, flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        category_id: filters.category_id || '',
        author_id: filters.author_id || '',
        status: filters.status || '',
        is_featured: filters.is_featured || '',
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);

        router.get(route('admin.blog.index'), {
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
            category_id: '',
            author_id: '',
            status: '',
            is_featured: '',
            per_page: 15,
        });
        router.get(route('admin.blog.index'));
    };

    const handleDelete = (postId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            router.delete(route('admin.blog.destroy', postId));
        }
    };

    const handleEdit = (post) => {
        router.visit(route('admin.blog.edit', post.id));
    };

    const handleView = (postId) => {
        router.visit(route('admin.blog.show', postId));
    };

    // Obtenir le badge de statut de publication
    const getPublicationStatusBadge = (post) => {
        if (!post.published_at) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                <ClockIcon className="h-3 w-3 mr-1" />
                Brouillon
            </span>;
        }
        
        const publishedDate = new Date(post.published_at);
        const now = new Date();
        
        if (publishedDate > now) {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Programmé
            </span>;
        }
        
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Publié
        </span>;
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'cover_image',
            label: 'Image',
            render: (post) => (
                <Link href={route('admin.blog.show', post.id)} className="block hover:opacity-80 transition">
                    <div className="flex-shrink-0 h-16 w-24">
                        {post.cover_image_url ? (
                            <img
                                className="h-16 w-24 rounded-lg object-cover"
                                src={post.cover_image_url}
                                alt={post.title}
                            />
                        ) : (
                            <div className="h-16 w-24 rounded-lg bg-gray-100 flex items-center justify-center">
                                <NewspaperIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                    </div>
                </Link>
            )
        },
        {
            key: 'title',
            label: 'Article',
            render: (post) => (
                <Link href={route('admin.blog.show', post.id)} className="block hover:text-indigo-600 transition">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            {post.is_featured && (
                                <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">{post.excerpt}</div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {tag}
                                    </span>
                                ))}
                                {post.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                </Link>
            )
        },
        {
            key: 'category',
            label: 'Catégorie',
            render: (post) => (
                <div>
                    <div className="text-sm text-gray-900">
                        {post.category?.name || 'N/A'}
                    </div>
                    {post.author && (
                        <div className="text-sm text-gray-500 mt-1">
                            Par {post.author.name}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'stats',
            label: 'Statistiques',
            render: (post) => (
                <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                        <ViewsIcon className="h-4 w-4 mr-1" />
                        {post.views || 0} vues
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {post.read_time || 0} min
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (post) => (
                <div>
                    {getPublicationStatusBadge(post)}
                    {post.published_at && (
                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(post.published_at).toLocaleDateString('fr-FR')}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (post) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleView(post.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                        title="Voir"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleEdit(post)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        title="Modifier"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(post.id)}
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
            <Head title="Gestion des Articles" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <NewspaperIcon className="h-8 w-8 mr-3 text-indigo-600" />
                                Gestion des Articles
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Gérez tous les articles de blog de votre site
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('admin.blog.categories.index')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                Catégories
                            </Link>
                            <Link
                                href={route('admin.blog.create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Nouvel Article
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                <NewspaperIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Articles</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.total_posts}</dd>
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">Publiés</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.published_posts}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
                                <ClockIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Brouillons</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.draft_posts}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Programmés</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.scheduled_posts}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                <ViewsIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Vues</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.total_views.toLocaleString()}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recherche et filtres */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher par titre, extrait ou catégorie..."
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
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                Filtres
                            </button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                                    <select
                                        value={activeFilters.category_id}
                                        onChange={(e) => applyFilters({ category_id: e.target.value })}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                                    >
                                        <option value="">Toutes les catégories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Auteur</label>
                                    <select
                                        value={activeFilters.author_id}
                                        onChange={(e) => applyFilters({ author_id: e.target.value })}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                                    >
                                        <option value="">Tous les auteurs</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                    <select
                                        value={activeFilters.status}
                                        onChange={(e) => applyFilters({ status: e.target.value })}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                                    >
                                        <option value="">Tous les statuts</option>
                                        <option value="published">Publié</option>
                                        <option value="draft">Brouillon</option>
                                        <option value="scheduled">Programmé</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
                                    <select
                                        value={activeFilters.is_featured}
                                        onChange={(e) => applyFilters({ is_featured: e.target.value })}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                                    >
                                        <option value="">Tous</option>
                                        <option value="1">Featured</option>
                                        <option value="0">Non-featured</option>
                                    </select>
                                </div>

                                <div className="md:col-span-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Tableau */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={blogPosts.data}
                        pagination={blogPosts}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
