import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { BoltIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/Utils/LocaleUtils';
import WishlistButton from '@/Components/Frontend/WishlistButton';

// Modern Product Card - Composant réutilisable
const ModernProductCard = ({ product }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const productUrl = product?.slug ? `/shop/products/${product.slug}` : `/shop/products/${product?.id || '#'}`;

    // Calcul des prix avec gestion des soldes
    const calculatePrices = () => {
        let currentPrice = parseFloat(product?.current_sale_price || 0);
        let originalPrice = parseFloat(product?.previous_sale_price || 0);
        let isOnSale = false;
        let discountAmount = 0;

        // Si on a un prix précédent et qu'il est supérieur au prix actuel
        if (originalPrice > 0 && currentPrice > 0 && originalPrice > currentPrice) {
            isOnSale = true;
        }
        
        // Gestion des remises additionnelles
        if (product?.discount && parseFloat(product.discount) > 0) {
            discountAmount = parseFloat(product.discount);
            
            if (product?.discount_type === 1) {
                // Remise en pourcentage
                const discountValue = (currentPrice * discountAmount) / 100;
                currentPrice = currentPrice - discountValue;
                isOnSale = true;
                if (!originalPrice || originalPrice === 0) {
                    originalPrice = parseFloat(product?.current_sale_price || 0);
                }
            } else {
                // Remise fixe
                currentPrice = currentPrice - discountAmount;
                isOnSale = true;
                if (!originalPrice || originalPrice === 0) {
                    originalPrice = parseFloat(product?.current_sale_price || 0);
                }
            }
        }

        // Gestion des plages de prix pour les variantes
        if (product?.price_range && (product.price_range.min !== product.price_range.max)) {
            return {
                isRange: true,
                minPrice: product.price_range.min,
                maxPrice: product.price_range.max,
                isOnSale: false
            };
        }

        return {
            isRange: false,
            currentPrice: Math.max(0, currentPrice),
            originalPrice: originalPrice,
            isOnSale: isOnSale
        };
    };

    const priceData = calculatePrices();

    return (
        <div className="group cursor-pointer" style={{ fontFamily: 'Barlow, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <div className="relative aspect-square bg-gray-50 overflow-hidden mb-3">
                {/* Badges */}
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {/* Badge EN SOLDE */}
                    {priceData.isOnSale && (
                        <span className="bg-black text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide">
                            EN SOLDE
                        </span>
                    )}
                    
                    {/* Badge SUR COMMANDE */}
                    {product?.is_pre_order && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide">
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

                    {/* Badge POPULAIRE */}
                    {/*product?.is_popular && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide">
                            POPULAIRE
                        </span>
                    )*/}

                    {/* Badge TENDANCE */}
                    {/*product?.is_trending && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide">
                            TRENDING
                        </span>
                    )*/}
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
                        {priceData.isRange ? (
                            // Plage de prix pour les variantes
                            <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency(priceData.minPrice)} - {formatCurrency(priceData.maxPrice)}
                            </span>
                        ) : priceData.isOnSale ? (
                            // Produit en solde
                            <>
                                <span className="text-lg font-semibold text-black-900">
                                    {formatCurrency(priceData.currentPrice)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(priceData.originalPrice)}
                                </span>
                            </>
                        ) : (
                            // Prix normal
                            <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency(priceData.currentPrice)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ModernProductCard;