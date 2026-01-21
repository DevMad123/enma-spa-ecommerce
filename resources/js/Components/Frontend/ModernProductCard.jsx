import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { BoltIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/Utils/LocaleUtils';
import { formatVariablePrice, getDiscountPercentage } from '@/Utils/productPrice';
import WishlistButton from '@/Components/Frontend/WishlistButton';

// Modern Product Card - Composant réutilisable
const ModernProductCard = ({ product }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const productUrl = product?.slug ? `/shop/product/${product.slug}` : `/shop/product/${product?.id || '#'}`;

    // Utilisation des nouvelles fonctions utilitaires
    const priceInfo = useMemo(() => formatVariablePrice(product), [product]);
    const discountPercent = useMemo(() => getDiscountPercentage(product), [product]);

    return (
        <div className="group cursor-pointer" style={{ fontFamily: 'Barlow, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <div className="relative aspect-square bg-gray-50 overflow-hidden mb-3">
                {/* Badges */}
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {/* Badge de réduction */}
                    {discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-sm font-bold tracking-wide">
                            -{discountPercent}%
                        </span>
                    )}
                    
                    {/* Badge Variable */}
                    {priceInfo.isVariable && (
                        <span className="bg-gray-100 text-black text-xs px-2 py-1 rounded-sm font-bold tracking-wide">
                            VARIABLE
                        </span>
                    )}

                    {/* Badge rupture de stock */}
                    {(product?.available_quantity ?? 1) <= 0 && (
                        <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-sm font-bold tracking-wide">
                            ÉPUISÉ
                        </span>
                    )}

                    {/* Badge sur commande */}
                    {product?.on_order && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-sm font-bold tracking-wide">
                            SUR COMMANDE
                        </span>
                    )}
                    
                    {/* Badge 24H */}
                    {product?.fast_delivery && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide flex items-center gap-1">
                            <BoltIcon className="w-3 h-3" />
                            24H
                        </span>
                    )}

                    {/* Badge NOUVEAU */}
                    {product?.is_new && (
                        <span className="bg-black text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide">
                            NOUVEAU
                        </span>
                    )}
                </div>

                {/* Bouton Wishlist */}
                <div className="absolute top-2 right-2 z-20">
                    <WishlistButton 
                        product={product}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full transition-all"
                    />
                </div>

                {/* Product Image */}
                <Link href={productUrl}>
                    <img
                        src={product?.image || '/images/placeholder.jpg'}
                        alt={product?.name || 'Produit'}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setIsLoaded(true)}
                    />
                </Link>
            </div>

            {/* Product Info */}
            <Link href={productUrl}>
                <div className="space-y-1">
                    {/* Nom produit */}
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2 leading-tight">
                        {product?.name || 'Nom du produit'}
                    </h3>
                    
                    {/* Catégorie */}
                    {product?.category?.name && (
                        <p className="text-base text-gray-500 uppercase tracking-wider">
                            {typeof product.category.name === 'string' ? product.category.name : String(product.category.name)}
                        </p>
                    )}

                    {/* Prix */}
                    <div className="flex items-center gap-2 pt-1">
                        {priceInfo.hasDiscount && priceInfo.compareAt ? (
                            // Produit en solde
                            <>
                                <span className="text-lg font-semibold text-black">
                                    {priceInfo.text}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(priceInfo.compareAt)}
                                </span>
                            </>
                        ) : (
                            // Prix normal ou variable
                            <span className={`text-lg font-semibold ${priceInfo.isVariable ? 'text-black' : 'text-gray-900'}`}>
                                {priceInfo.text}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ModernProductCard;