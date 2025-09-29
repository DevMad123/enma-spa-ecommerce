import React, { useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
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
    ClockIcon,
    ArrowsUpDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import BrandModal from "./BrandModal";

export default function BrandsList() {
    const { brands, filters, flash } = usePage().props;
    const { get, post, delete: destroy, processing } = useForm();
    
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status || '',
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortBy, setSortBy] = useState({
        column: filters.sort_by || '',
        direction: filters.sort_direction || 'asc'
    });

    const searchableFields = ['brand_name', 'description'];

    // Fonction pour gérer les actions en lot
    const handleBulkAction = (action) => {
        if (selectedBrands.length === 0) {
            alert('Veuillez sélectionner au moins une marque');
            return;
        }

        if (window.confirm(`Êtes-vous sûr de vouloir ${action === 'delete' ? 'supprimer' : action === 'activate' ? 'activer' : 'désactiver'} les marques sélectionnées ?`)) {
            post(route('admin.brands.bulk'), {
                ids: selectedBrands,
                action: action
            }, {
                onSuccess: () => {
                    setSelectedBrands([]);
                }
            });
        }
    };

    // Fonction pour gérer la suppression
    const handleDelete = (id) => {
        destroy(route('admin.brands.destroy', id));
    };

    // Fonction pour gérer le tri
    const handleSort = (column) => {
        const newDirection = sortBy.column === column && sortBy.direction === 'asc' ? 'desc' : 'asc';
        setSortBy({ column, direction: newDirection });
        
        applyFilters({
            ...activeFilters,
            sort_by: column,
            sort_direction: newDirection
        });
    };

    // Fonction pour gérer la pagination
    const handlePagination = (page) => {
        get(route('admin.brands.list', {
            ...activeFilters,
            search: searchTerm,
            page: page
        }), {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Fonction pour l'export
    const handleExport = () => {
        window.open(route('admin.brands.export', {
            ...activeFilters,
            search: searchTerm
        }));
    };

    // Fonction pour effacer les filtres
    const clearFilters = () => {
        setActiveFilters({
            status: '',
            per_page: 15
        });
        setSearchTerm('');
        setSortBy({ column: '', direction: 'asc' });
        setShowFilters(false);
        
        get(route('admin.brands.list'), {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Fonction pour appliquer les filtres
    const applyFilters = (customFilters = null) => {
        const filters = customFilters || activeFilters;
        get(route('admin.brands.list', {
            ...filters,
            search: searchTerm,
            sort_by: sortBy.column,
            sort_direction: sortBy.direction
        }), {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Fonction pour gérer la recherche
    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    return (
        <AdminLayout>
            <Head title="Marques" />

            <div className="mb-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Marques</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez les marques de produits et leurs informations
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex-none">
                        <button
                            onClick={() => setShowBrandModal(true)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouvelle marque
                        </button>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    {flash.error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tableau de bord statistiques */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <BuildingOfficeIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Marques</dt>
                                    <dd className="text-lg font-medium text-gray-900">{brands?.total || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <CheckCircleIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Marques Actives</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {brands?.data ? brands.data.filter(b => b.status === 1).length : 0}
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
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <ArchiveBoxIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avec Produits</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {brands?.data ? brands.data.filter(b => (b.products_count || 0) > 0).length : 0}
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
                                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                                    <ClockIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Cette Semaine</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {brands?.data ? brands.data.filter(b => {
                                            if (!b.created_at) return false;
                                            const weekAgo = new Date();
                                            weekAgo.setDate(weekAgo.getDate() - 7);
                                            return new Date(b.created_at) >= weekAgo;
                                        }).length : 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom de marque..."
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <FunnelIcon className="h-4 w-4 mr-2" />
                                    Filtres
                                    {Object.values(activeFilters).some(value => value && value !== 15) && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            Actifs
                                        </span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExport}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Export
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Rechercher
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Statut
                                        </label>
                                        <select
                                            value={activeFilters.status}
                                            onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                                            onChange={(e) => setActiveFilters(prev => ({ ...prev, per_page: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="15">15 par page</option>
                                            <option value="25">25 par page</option>
                                            <option value="50">50 par page</option>
                                            <option value="100">100 par page</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Effacer tous les filtres
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyFilters()}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                    >
                                        Appliquer les filtres
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* DataTable */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Actions en lot */}
                {selectedBrands.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-sm text-gray-700">
                                    {selectedBrands.length} marque(s) sélectionnée(s)
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleBulkAction('activate')}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                                >
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Activer
                                </button>
                                <button
                                    onClick={() => handleBulkAction('deactivate')}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                                >
                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                    Désactiver
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                                >
                                    <TrashIcon className="h-4 w-4 mr-1" />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tableau */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        checked={brands?.data?.length > 0 && selectedBrands.length === brands.data.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedBrands(brands.data.map(brand => brand.id));
                                            } else {
                                                setSelectedBrands([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('brand_name')}
                                        className="group inline-flex items-center"
                                    >
                                        Nom de la marque
                                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-700" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Logo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="group inline-flex items-center"
                                    >
                                        Statut
                                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-700" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('products_count')}
                                        className="group inline-flex items-center"
                                    >
                                        Nb Produits
                                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-700" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="group inline-flex items-center"
                                    >
                                        Date de création
                                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-700" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {brands?.data?.length > 0 ? (
                                brands.data.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                checked={selectedBrands.includes(brand.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedBrands([...selectedBrands, brand.id]);
                                                    } else {
                                                        setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {brand.brand_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {brand.logo ? (
                                                <img
                                                    src={brand.logo}
                                                    alt={brand.brand_name}
                                                    className="h-8 w-8 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                                                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                brand.status === 1
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {brand.status === 1 ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {brand.products_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {brand.created_at ? new Date(brand.created_at).toLocaleDateString('fr-FR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingBrand(brand);
                                                        setShowBrandModal(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Modifier"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) {
                                                            handleDelete(brand.id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                                        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-lg font-medium text-gray-900 mb-2">Aucune marque trouvée</p>
                                        <p>Commencez par ajouter votre première marque.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {brands?.total > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePagination(brands.current_page - 1)}
                                    disabled={brands.current_page <= 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Précédent
                                </button>
                                <button
                                    onClick={() => handlePagination(brands.current_page + 1)}
                                    disabled={brands.current_page >= brands.last_page}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Affichage de{' '}
                                        <span className="font-medium">{brands.from || 0}</span>
                                        {' '}à{' '}
                                        <span className="font-medium">{brands.to || 0}</span>
                                        {' '}sur{' '}
                                        <span className="font-medium">{brands.total}</span>
                                        {' '}résultats
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => handlePagination(brands.current_page - 1)}
                                            disabled={brands.current_page <= 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeftIcon className="h-5 w-5" />
                                        </button>
                                        
                                        {[...Array(brands.last_page)].map((_, index) => {
                                            const pageNumber = index + 1;
                                            const isCurrentPage = pageNumber === brands.current_page;
                                            
                                            // Affiche seulement quelques pages autour de la page actuelle
                                            if (
                                                pageNumber === 1 ||
                                                pageNumber === brands.last_page ||
                                                (pageNumber >= brands.current_page - 2 && pageNumber <= brands.current_page + 2)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => handlePagination(pageNumber)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            isCurrentPage
                                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            } else if (
                                                pageNumber === brands.current_page - 3 ||
                                                pageNumber === brands.current_page + 3
                                            ) {
                                                return (
                                                    <span
                                                        key={pageNumber}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}
                                        
                                        <button
                                            onClick={() => handlePagination(brands.current_page + 1)}
                                            disabled={brands.current_page >= brands.last_page}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRightIcon className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal BrandModal */}
            {showBrandModal && (
                <BrandModal
                    open={showBrandModal}
                    onClose={() => {
                        setShowBrandModal(false);
                        setEditingBrand(null);
                    }}
                    mode={editingBrand ? "edit" : "create"}
                    brand={editingBrand}
                />
            )}
        </AdminLayout>
    );
}