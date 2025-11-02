import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { initLocale, formatCurrency, formatDate, getCurrentCurrency, getCurrentCurrencySymbol, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CubeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    BanknotesIcon,
    ShoppingBagIcon,
    ClockIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function ProductsList() {
    const { productList, categories, brands, filters, stats, flash, localeConfig } = usePage().props;
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        category_id: filters.category_id || '',
        brand_id: filters.brand_id || '',
        status: filters.status !== null ? filters.status : '',
        price_min: filters.price_min || '',
        price_max: filters.price_max || '',
        stock_status: filters.stock_status || '',
        per_page: filters.per_page || 15,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Initialiser la configuration de locale DE SUITE et forcer un re-render
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
            setIsLocaleInitialized(true); // Force un re-render
        }
    }, [localeConfig]);

    // Ne pas rendre tant que la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }

    // Appliquer les filtres
    const applyFilters = (newFilters = {}) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);
        
        router.get(route('admin.products.index', undefined, false), {
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
            brand_id: '',
            status: '',
            price_min: '',
            price_max: '',
            stock_status: '',
            per_page: 15,
        });
        router.get(route('admin.products.index', undefined, false));
    };

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins un produit.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} produit(s) ?`)) {
                router.post(route('admin.products.bulk-delete', undefined, false), {
                    ids: selectedIds
                });
            }
        } else if (action === 'export') {
            const exportParams = new URLSearchParams({
                search: searchTerm,
                ...activeFilters,
            });
            window.location.href = route('admin.products.export', undefined, false) + '?' + exportParams.toString();
        } else if (action === 'activate') {
            router.post(route('admin.products.bulk-activate', undefined, false), {
                ids: selectedIds
            });
        } else if (action === 'deactivate') {
            router.post(route('admin.products.bulk-deactivate', undefined, false), {
                ids: selectedIds
            });
        }
    };

    const handleDelete = (productId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            router.delete(route('admin.products.destroy', productId, false));
        }
    };

    const handleEdit = (product) => {
        router.visit(route('admin.products.edit', product.id, false));
    };

    const handleView = (productId) => {
        router.visit(route('admin.products.show', productId, false));
    };

    // Exporter en CSV
    const handleExport = () => {
        const exportParams = new URLSearchParams({
            search: searchTerm,
            ...activeFilters,
        });
        window.location.href = route('admin.products.export', undefined, false) + '?' + exportParams.toString();
    };

    // Obtenir le badge de statut de stock
    const getStockStatusBadge = (stock) => {
        if (stock > 10) {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">En stock</span>;
        } else if (stock > 0) {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Stock faible</span>;
        } else {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rupture</span>;
        }
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'image',
            label: 'Image',
            render: (product) => (
                <div className="flex-shrink-0 h-12 w-12">
                    {product.image ? (
                        <img 
                            className="h-12 w-12 rounded-lg object-cover" 
                            src={product.image?.startsWith('http') ? product.image : `/${product.image}`} 
                            alt={product.name}
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <CubeIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'name',
            label: 'Produit',
            render: (product) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                </div>
            )
        },
        {
            key: 'category',
            label: 'Catégorie',
            render: (product) => (
                <div>
                    <div className="text-sm text-gray-900">
                        {product.category?.name || 'N/A'}
                    </div>
                    {product.brand && (
                        <div className="text-sm text-gray-500">
                            {product.brand.brand_name}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'price',
            label: 'Prix',
            render: (product) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.current_sale_price || product.sale_price || product.price)}
                    </div>
                    {product.sale_price && product.current_sale_price !== product.sale_price && (
                        <div className="text-sm text-red-600">
                            Promo: {formatCurrency(product.sale_price)}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'stock',
            label: 'Stock',
            render: (product) => (
                <div>
                    <div className={`text-sm font-medium ${
                        (product.available_quantity || 0) > 10 ? 'text-green-600' : 
                        (product.available_quantity || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        {Math.floor(product.available_quantity) || 0} unités
                    </div>
                    <div className="mt-1">
                        {getStockStatusBadge(product.available_quantity || 0)}
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (product) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {product.status === 1 ? (
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
            render: (product) => (
                <span className="text-sm text-gray-500">
                    {formatDate(new Date(product.created_at))}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (product) => handleView(product.id),
            icon: EyeIcon,
            label: 'Voir les détails',
            className: 'text-blue-600 hover:text-blue-900'
        },
        {
            type: 'button',
            onClick: (product) => handleEdit(product),
            icon: PencilIcon,
            label: 'Modifier',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (product) => handleDelete(product.id),
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

    const searchableFields = ['name', 'sku', 'category.name'];

    return (
        <AdminLayout>
            <Head title="Gestion des Produits" />
            
            {/* En-tête avec statistiques */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
                    <Link
                        href={route('admin.products.create', undefined, false)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Nouveau Produit
                    </Link>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CubeIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Produits
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.total_products || 0}
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
                                            Produits Actifs
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.active_products || 0}
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
                                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Stock Faible
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.low_stock_products || 0}
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
                                    <ArchiveBoxIcon className="h-6 w-6 text-red-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Rupture Stock
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats?.out_of_stock_products || 0}
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
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher par nom, SKU, catégorie..."
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
                                        Catégorie
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
                                        Marque
                                    </label>
                                    <select
                                        value={activeFilters.brand_id}
                                        onChange={(e) => setActiveFilters({...activeFilters, brand_id: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Toutes les marques</option>
                                        {brands?.map(brand => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.brand_name}
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
                                        Prix minimum
                                    </label>
                                    <input
                                        type="number"
                                        value={activeFilters.price_min}
                                        onChange={(e) => setActiveFilters({...activeFilters, price_min: e.target.value})}
                                        placeholder="0"
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix maximum
                                    </label>
                                    <input
                                        type="number"
                                        value={activeFilters.price_max}
                                        onChange={(e) => setActiveFilters({...activeFilters, price_max: e.target.value})}
                                        placeholder="100000"
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock
                                    </label>
                                    <select
                                        value={activeFilters.stock_status}
                                        onChange={(e) => setActiveFilters({...activeFilters, stock_status: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tous les stocks</option>
                                        <option value="in_stock">En stock</option>
                                        <option value="low_stock">Stock faible</option>
                                        <option value="out_of_stock">Rupture</option>
                                    </select>
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
                data={Array.isArray(productList) ? productList : (productList?.data || [])}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par nom, SKU ou catégorie..."
                pagination={productList?.links ? {
                    from: productList.from,
                    to: productList.to,
                    total: productList.total,
                    links: productList.links
                } : null}
            />
        </AdminLayout>
    );
}
