import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { normalizeImageUrl } from '@/Utils/imageUtils.jsx';
import { initLocale, formatCurrency, formatDate, getCurrentCurrency, getCurrentCurrencySymbol, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CubeIcon,
    TagIcon,
    BanknotesIcon,
    BuildingStorefrontIcon,
    SwatchIcon,
    PhotoIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function ShowProduct({ product, flash }) {
    const { localeConfig } = usePage().props;
    
    // État pour gérer l'initialisation de la locale
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    
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

    const handleDelete = (productId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            router.delete(route('admin.products.destroy', productId));
        }
    };

    const getStatusBadge = (product) => {
        if (product.status === 1) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Actif
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Inactif
                </span>
            );
        }
    };

    const getStockStatus = (quantity) => {
        if (quantity > 10) {
            return <span className="text-green-600 font-medium">En stock ({quantity})</span>;
        } else if (quantity > 0) {
            return <span className="text-yellow-600 font-medium">Stock faible ({quantity})</span>;
        } else {
            return <span className="text-red-600 font-medium">Rupture de stock</span>;
        }
    };

    return (
        <AdminLayout>
            <Head title={`Produit - ${product.name}`} />

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

            {/* En-tête */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center flex-wrap gap-2">
                        <Link
                            href={route('admin.products.index')}
                            className="flex items-center text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-1" />
                            Retour aux produits
                        </Link>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate max-w-[70vw] sm:max-w-none">{product.name}</h1>
                        {getStatusBadge(product)}
                    </div>
                    
                    <div className="flex items-center gap-2 sm:space-x-3 flex-wrap sm:flex-nowrap">
                        <Link
                            href={route('admin.products.edit', product.id)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Modifier
                        </Link>
                        <button
                            onClick={() => handleDelete(product.id)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Informations générales */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <CubeIcon className="h-5 w-5 mr-2" />
                            Informations générales
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Nom</label>
                                <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Code produit (SKU)</label>
                                <p className="mt-1 text-sm text-gray-900">{product.code || 'Non défini'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Type</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {product.type === 'simple' ? 'Produit simple' : 'Produit variable'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Unité</label>
                                <p className="mt-1 text-sm text-gray-900">{product.unit_type || 'Non défini'}</p>
                            </div>
                        </div>
                        
                        {product.description && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-sm text-gray-900">{product.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Catégorisation */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <TagIcon className="h-5 w-5 mr-2" />
                            Catégorisation
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Catégorie</label>
                                <p className="mt-1 text-sm text-gray-900">{product.category?.name || 'Non défini'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Sous-catégorie</label>
                                <p className="mt-1 text-sm text-gray-900">{product.subcategory?.name || 'Non défini'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Marque</label>
                                <p className="mt-1 text-sm text-gray-900">{product.brand?.name || 'Non défini'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Fournisseur</label>
                                <p className="mt-1 text-sm text-gray-900">{product.supplier?.supplier_name || 'Non défini'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Prix et stock */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <BanknotesIcon className="h-5 w-5 mr-2" />
                            Prix et stock
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Prix d'achat</label>
                                <p className="mt-1 text-sm text-gray-900">{formatCurrency(product.current_purchase_cost)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Prix de vente</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">{formatCurrency(product.current_sale_price)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Prix de gros</label>
                                <p className="mt-1 text-sm text-gray-900">{formatCurrency(product.wholesale_price || 0)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Stock disponible</label>
                                <p className="mt-1 text-sm">{getStockStatus(product.available_quantity)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Quantité min. gros</label>
                                <p className="mt-1 text-sm text-gray-900">{product.wholesale_minimum_qty || 1}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Remise</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {product.discount || 0}{product.discount_type === 1 ? '%' : getCurrentCurrencySymbol()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attributs et variantes */}
                    {(product.attributes?.length > 0 || product.variants?.length > 0) && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <SwatchIcon className="h-5 w-5 mr-2" />
                                Attributs et variantes
                            </h2>
                            
                            {product.attributes?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Attributs</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.attributes.map((attr, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {attr.color?.name && `Couleur: ${attr.color.name}`}
                                                {attr.size?.size && `Taille: ${attr.size.size}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {product.variants?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Variantes</h3>
                                    <div className="space-y-2">
                                        {product.variants.map((variant, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <span className="text-sm font-medium">{variant.sku}</span>
                                                    <div className="text-xs text-gray-500">
                                                        {variant.color?.name && `Couleur: ${variant.color.name} `}
                                                        {variant.size?.size && `Taille: ${variant.size.size}`}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">{formatCurrency(variant.sale_price)}</div>
                                                    <div className="text-xs text-gray-500">Stock: {variant.available_quantity}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Colonne droite */}
                <div className="space-y-6">
                    
                    {/* Images */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <PhotoIcon className="h-5 w-5 mr-2" />
                            Images
                        </h2>
                        
                        {product.image ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Image principale</label>
                                    <img 
                                        src={normalizeImageUrl(product.image)} 
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-lg border"
                                    />
                                </div>
                                
                                {product.images?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Images supplémentaires</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.images.map((image, index) => (
                                                <img 
                                                    key={index}
                                                    src={normalizeImageUrl(image.image)} 
                                                    alt={`${product.name} ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded border"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <PhotoIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>Aucune image</p>
                            </div>
                        )}
                    </div>

                    {/* Métadonnées */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                            Métadonnées
                        </h2>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={product.is_trending} 
                                    disabled 
                                    className="mr-2"
                                />
                                <span>Produit tendance</span>
                            </div>
                            
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={product.is_popular} 
                                    disabled 
                                    className="mr-2"
                                />
                                <span>Produit populaire</span>
                            </div>
                            
                            <div className="pt-3 border-t">
                                <div className="text-xs text-gray-500">
                                    <div>Créé le: {formatDate(new Date(product.created_at))}</div>
                                    <div>Modifié le: {formatDate(new Date(product.updated_at))}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
