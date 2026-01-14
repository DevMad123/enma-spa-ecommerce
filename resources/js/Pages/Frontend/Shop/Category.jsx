import React, { useState } from 'react';
import FrontendLayout, { CartProvider } from '@/Layouts/FrontendLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    ChevronRightIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    ChevronDownIcon,
    StarIcon,
    HeartIcon,
    ShoppingCartIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/Layouts/FrontendLayout';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import ProductCardUnified from '@/Components/Frontend/ProductCardNew';
import { useNotification } from '@/Components/Notifications/NotificationProvider';
import { formatVariablePrice } from '@/Utils/productPrice';
import { formatCurrency } from '@/Utils/LocaleUtils';

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const { addToCart } = useCart();
    const { showSuccess } = useNotification();
    const { appSettings } = usePage().props;
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';

    const handleAddToCart = () => {
        addToCart(product, 1);
        showSuccess(`${product.name} ajouté au panier`, "🛒 Produit ajouté");
    };

    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="flex">
                    <div className="w-48 h-48 flex-shrink-0">
                        <img
                            src={product.image || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-sm text-amber-600 font-medium mb-1">
                                    {product.subcategory?.name || product.category?.name}
                                </p>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    <Link 
                                        href={route('frontend.shop.show', product.id)}
                                        className="hover:text-amber-600 transition-colors"
                                    >
                                        {product.name}
                                    </Link>
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {product.description}
                                </p>
                                
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(product.average_rating || 4.5) 
                                                    ? 'text-yellow-400 fill-current' 
                                                    : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({product.reviews_count || 0} avis)
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        {(() => {
                                            const fp = formatVariablePrice(product);
                                            return (
                                                <>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {fp.hasRange && <span>À partir de </span>}
                                                        <span>{formatCurrency(fp.min)}</span>
                                                    </span>
                                                    {fp.compareAt && (
                                                        <span className="ml-2 text-lg text-gray-500 line-through">
                                                            {formatCurrency(fp.compareAt)}
                                                        </span>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="ml-6 flex flex-col items-end space-y-2">
                                <WishlistButton 
                                    product={product} 
                                    size="default"
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                                />
                                <CartButton
                                    product={product}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2"
                                >
                                    <ShoppingCartIcon className="h-5 w-5" />
                                    <span>Ajouter</span>
                                </CartButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Badge de promotion */}
            {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount_percentage}%
                    </span>
                </div>
            )}

            {/* Bouton favoris */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <WishlistButton 
                    product={product} 
                    size="default"
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all" 
                />
            </div>

            {/* Image du produit */}
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div className="p-6">
                {/* Sous-catégorie ou catégorie */}
                <p className="text-sm text-amber-600 font-medium mb-2">
                    {product.subcategory?.name || product.category?.name}
                </p>

                {/* Nom du produit */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link href={route('frontend.shop.show', product.id)} className="hover:text-amber-600 transition-colors">
                        {product.name}
                    </Link>
                </h3>

                {/* Description courte */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                </p>

                {/* Évaluations */}
                <div className="flex items-center mb-4">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(product.average_rating || 4.5) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                        ({product.reviews_count || 0})
                    </span>
                </div>

                {/* Prix */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        {(() => {
                            const fp = formatVariablePrice(product);
                            return (
                                <>
                                    <span className="text-xl font-bold text-gray-900">
                                        {fp.hasRange && <span>À partir de </span>}
                                        <span>{formatCurrency(fp.min)}</span>
                                    </span>
                                    {fp.compareAt && (
                                        <span className="ml-2 text-base text-gray-500 line-through">
                                            {formatCurrency(fp.compareAt)}
                                        </span>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Bouton d'ajout au panier */}
                <CartButton
                    product={product}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Ajouter au panier</span>
                </CartButton>
            </div>
        </div>
    );
};

const FilterSidebar = ({ 
    subcategories, 
    brands, 
    colors, 
    sizes,
    filters, 
    onFilterChange,
    isOpen,
    onClose 
}) => {
    const { appSettings } = usePage().props;
    const maxPriceDefault = appSettings?.max_price_filter || 1000;
    const [priceRange, setPriceRange] = useState([
        typeof filters.min_price === 'number' ? filters.min_price : (parseInt(filters.min_price) || 0),
        typeof filters.max_price === 'number' ? filters.max_price : (parseInt(filters.max_price) || maxPriceDefault),
    ]);

    const handlePriceChange = (index, value) => {
        const newRange = [...priceRange];
        // Autoriser la saisie vide, sinon parser en entier
        const parsed = value === '' ? '' : parseInt(value, 10);
        newRange[index] = isNaN(parsed) ? '' : parsed;
        setPriceRange(newRange);

        const next = { ...filters };
        if (newRange[0] === '' || newRange[0] === null) delete next.min_price; else next.min_price = newRange[0];
        if (newRange[1] === '' || newRange[1] === null) delete next.max_price; else next.max_price = newRange[1];
        onFilterChange(next);
    };

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={sidebarClasses}>
                <div className="h-full overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <h2 className="text-lg font-semibold">Filtres</h2>
                        <button onClick={onClose} className="p-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Sous-catégories */}
                    {subcategories.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Sous-catégories</h3>
                            <div className="space-y-3">
                                {subcategories.map((subcategory) => (
                                    <label key={subcategory.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(filters.subcategories) ? filters.subcategories.includes(subcategory.id.toString()) : false}
                                            onChange={(e) => {
                                                const subcategories = filters.subcategories || [];
                                                const newSubcategories = e.target.checked
                                                    ? [...subcategories, subcategory.id.toString()]
                                                    : subcategories.filter(id => id !== subcategory.id.toString());
                                                onFilterChange({ ...filters, subcategories: newSubcategories });
                                            }}
                                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">{subcategory.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Prix */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Prix</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Min</label>
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => handlePriceChange(0, e.target.value)}
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Max</label>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => handlePriceChange(1, e.target.value)}
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Marques */}
                    {brands.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Marques</h3>
                            <div className="space-y-3">
                                {brands.map((brand) => (
                                    <label key={brand.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(filters.brands) ? filters.brands.includes(brand.id.toString()) : false}
                                            onChange={(e) => {
                                                const brands = filters.brands || [];
                                                const newBrands = e.target.checked
                                                    ? [...brands, brand.id.toString()]
                                                    : brands.filter(id => id !== brand.id.toString());
                                                onFilterChange({ ...filters, brands: newBrands });
                                            }}
                                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">{brand.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Couleurs */}
                    {colors.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Couleurs</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {colors.map((color) => (
                                    <label key={color.id} className="flex flex-col items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(filters.colors) ? filters.colors.includes(color.id.toString()) : false}
                                            onChange={(e) => {
                                                const colors = filters.colors || [];
                                                const newColors = e.target.checked
                                                    ? [...colors, color.id.toString()]
                                                    : colors.filter(id => id !== color.id.toString());
                                                onFilterChange({ ...filters, colors: newColors });
                                            }}
                                            className="sr-only"
                                        />
                                        <div 
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 relative"
                                            style={{ backgroundColor: color.color_code || color.name.toLowerCase() }}
                                        >
                                            {filters.colors?.includes(color.id.toString()) && (
                                                <div className="absolute inset-0 rounded-full border-2 border-amber-500" />
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-600 mt-1">{color.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tailles */}
                    {sizes.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Tailles</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {sizes.map((size) => (
                                    <label key={size.id} className="cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(filters.sizes) ? filters.sizes.includes(size.id.toString()) : false}
                                            onChange={(e) => {
                                                const sizes = filters.sizes || [];
                                                const newSizes = e.target.checked
                                                    ? [...sizes, size.id.toString()]
                                                    : sizes.filter(id => id !== size.id.toString());
                                                onFilterChange({ ...filters, sizes: newSizes });
                                            }}
                                            className="sr-only"
                                        />
                                        <div className={`
                                            px-3 py-2 border border-gray-300 rounded-md text-center text-sm
                                            ${filters.sizes?.includes(size.id.toString()) 
                                                ? 'bg-amber-500 text-white border-amber-500' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }
                                        `}>
                                            {size.size}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bouton de réinitialisation */}
                    <button
                        onClick={() => onFilterChange({})}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            </div>
        </>
    );
};

function CategoryShow({ 
    category, 
    products, 
    subcategories = [], 
    brands = [], 
    colors = [], 
    sizes = [],
    filters = {} 
}) {
    // Protection complète contre les données nulles/undefined
    const safeProducts = products && typeof products === 'object' ? {
        data: Array.isArray(products.data) ? products.data.filter(p => p && p.id) : [],
        links: Array.isArray(products.links) ? products.links : [],
        total: products.total || 0
    } : { data: [], links: [], total: 0 };
    
    const safeSubcategories = Array.isArray(subcategories) ? subcategories.filter(s => s && s.id) : [];
    const safeBrands = Array.isArray(brands) ? brands.filter(b => b && b.id) : [];
    const safeColors = Array.isArray(colors) ? colors.filter(c => c && c.id) : [];
    const safeSizes = Array.isArray(sizes) ? sizes.filter(s => s && s.id) : [];
    const safeFilters = filters && typeof filters === 'object' ? filters : {};
    const safeCategory = category && typeof category === 'object' ? category : { id: null, name: '', slug: '' };
    
    // Fonction pour nettoyer les filtres avant envoi à Inertia
    const cleanFilters = (filters) => {
        if (!filters || typeof filters !== 'object') return {};
        
        const cleaned = {};
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '' && value !== 'null' && value !== 'undefined') {
                if (Array.isArray(value) && value.length > 0) {
                    cleaned[key] = value.filter(v => v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'undefined');
                } else if (!Array.isArray(value)) {
                    cleaned[key] = value;
                }
            }
        });
        return cleaned;
    };
    
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState(() => {
        const s = (safeFilters && typeof safeFilters.sort !== 'undefined') ? safeFilters.sort : 'newest';
        return typeof s === 'string' ? s : String(s);
    });
    const [localFilters, setLocalFilters] = useState(() => cleanFilters(safeFilters));
    const [filtersOpen, setFiltersOpen] = useState(false);

    const handleFilterChange = (newFilters) => {
        const cleanedFilters = cleanFilters(newFilters);
        setLocalFilters(cleanedFilters);
        
        // Debounced filter application
        clearTimeout(window.filterTimeout);
        window.filterTimeout = setTimeout(() => {
            if (safeCategory?.id) {
                router.get(route('frontend.shop.category', safeCategory.id), cleanedFilters, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 500);
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        if (safeCategory?.id) {
            const newFilters = cleanFilters({
                ...localFilters,
                sort: newSort
            });
            router.get(route('frontend.shop.category', safeCategory.id), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }
    };

    return (
        <>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-gray-900 via-amber-900 to-orange-900 py-16">
                <div className="absolute inset-0">
                    {safeCategory.banner_image && (
                        <img
                            src={safeCategory.banner_image}
                            alt={safeCategory.name}
                            className="w-full h-full object-cover opacity-30"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex mb-8" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4 text-white">
                            <li>
                                <Link href={route('home')} className="hover:text-amber-300 transition-colors">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-300" />
                                    <Link href={route('frontend.shop.index')} className="ml-4 hover:text-amber-300 transition-colors">
                                        Boutique
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-300" />
                                    <span className="ml-4 text-amber-300 font-medium">{safeCategory.name}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{safeCategory.name}</h1>
                        {safeCategory.description && (
                            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                                {safeCategory.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setFiltersOpen(true)}
                                className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                Filtres
                            </button>
                        </div>
                        
                        <div className="hidden lg:block">
                            <h2 className="text-lg font-semibold mb-6">Affiner la recherche</h2>
                            <FilterSidebar
                                subcategories={safeSubcategories}
                                brands={safeBrands}
                                colors={safeColors}
                                sizes={safeSizes}
                                filters={localFilters}
                                onFilterChange={handleFilterChange}
                                isOpen={false}
                                onClose={() => {}}
                            />
                        </div>
                    </div>

                    {/* Mobile Filter Sidebar - uniquement sur mobile */}
                    <div className="lg:hidden">
                        <FilterSidebar
                            subcategories={safeSubcategories}
                            brands={safeBrands}
                            colors={safeColors}
                            sizes={safeSizes}
                            filters={localFilters}
                            onFilterChange={handleFilterChange}
                            isOpen={filtersOpen}
                            onClose={() => setFiltersOpen(false)}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div>
                                <p className="text-gray-600">
                                    {safeProducts.total} produit{safeProducts.total > 1 ? 's' : ''} trouvé{safeProducts.total > 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                {/* View Mode Toggle */}
                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === 'grid' 
                                                ? 'bg-white text-amber-600 shadow-sm' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <Squares2X2Icon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === 'list' 
                                                ? 'bg-white text-amber-600 shadow-sm' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <ListBulletIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <select
                                        value={String(sortBy)}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="newest">Plus récents</option>
                                        <option value="price_asc">Prix croissant</option>
                                        <option value="name">Nom A-Z</option>
                                        <option value="name_desc">Nom Z-A</option>
                                        <option value="price">Prix croissant</option>
                                        <option value="price_desc">Prix décroissant</option>
                                        <option value="created_at_desc">Plus récents</option>
                                        <option value="created_at">Plus anciens</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {safeProducts.data.length > 0 ? (
                            <>
                                <div className={
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                                        : 'space-y-6'
                                }>
                                    {safeProducts.data.map((product) => (
                                        <ProductCardUnified 
                                            key={product.id} 
                                            product={product} 
                                            variant={viewMode === 'grid' ? 'default' : 'compact'}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {safeProducts.last_page > 1 && (
                                    <div className="mt-12 flex justify-center">
                                        <div className="flex items-center space-x-2">
                                            {safeProducts.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    preserveState
                                                    preserveScroll
                                                    className={`
                                                        px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                                        ${link.active 
                                                            ? 'bg-amber-500 text-white' 
                                                            : link.url 
                                                                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' 
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }
                                                    `}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Aucun produit dans cette catégorie
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Essayez de modifier vos filtres ou explorez d'autres catégories
                                </p>
                                <Link
                                    href={route('frontend.shop.index')}
                                    className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                                >
                                    Voir tous les produits
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Wrapper avec le nouveau système
export default function CategoryShowWithCart({ wishlistItems, ...props }) {
    return (
        <FrontendLayout 
            title={`${props.category?.name || 'Catégorie'} - ENMA SPA`} 
            wishlistItems={wishlistItems}
        >
            <CategoryShow {...props} />
        </FrontendLayout>
    );
}
