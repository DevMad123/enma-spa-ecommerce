import React, { memo, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import { formatVariablePrice, getDiscountPercentage } from '@/Utils/productPrice';
import { formatCurrency } from '@/Utils/LocaleUtils';

const buildImages = (product) => {
  const primary = product?.image || '/images/placeholder.jpg';
  const others = Array.isArray(product?.images)
    ? product.images
        .map((img) => (typeof img === 'object' && img.image ? img.image : img))
        .filter((src) => !!src && src !== primary)
    : [];
  return [primary, ...others];
};

const ProductCardNew = memo(function ProductCardNew({ 
  product, 
  variant = 'default',
  className = ''
}) {
  const images = useMemo(() => buildImages(product), [product]);
  const fp = useMemo(() => formatVariablePrice(product), [product]);
  const discountPercent = useMemo(() => getDiscountPercentage(product), [product]);
  
  const isOut = (product?.available_quantity ?? product?.stock_quantity ?? product?.stock ?? 1) <= 0;

  if (!product || !product.id) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
      <Link href={route('frontend.shop.show', product.id)} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50">
          {/* Badge Sale */}
          {discountPercent > 0 && !isOut && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Badge Variable Price */}
          {fp.isVariable && !isOut && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
                VARIABLE
              </span>
            </div>
          )}

          {/* Badge rupture de stock */}
          {isOut && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
                ÉPUISÉ
              </span>
            </div>
          )}

          {/* Bouton Wishlist - SANS animation */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} size="small" />
          </div>

          {/* Image principale */}
          <img
            src={images[0]}
            alt={product?.name || 'Produit'}
            loading="lazy"
            className={`w-full h-full object-cover ${isOut ? 'opacity-70' : ''}`}
          />
        </div>

        {/* Informations produit */}
        <div className="p-4">
          {/* Nom du produit */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
            {product?.name}
          </h3>

          {/* Prix */}
          <div className="space-y-1">
            {fp.compareAt ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {fp.text}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(fp.compareAt)}
                </span>
              </div>
            ) : (
              <div className={`text-lg font-bold ${fp.isVariable ? 'text-blue-600' : 'text-gray-900'}`}>
                {fp.text}
              </div>
            )}
          </div>

          {/* Couleurs disponibles (si applicable) */}
          {Array.isArray(product?.colors) && product.colors.length > 0 && (
            <div className="mt-3 flex items-center space-x-1">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color.id}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.color_code || color.name.toLowerCase() }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

// Version compacte pour carousels
const ProductCardCompact = memo(function ProductCardCompact({ 
  product, 
  className = '' 
}) {
  const images = useMemo(() => buildImages(product), [product]);
  const fp = useMemo(() => formatVariablePrice(product), [product]);
  const discountPercent = useMemo(() => getDiscountPercentage(product), [product]);
  
  const isOut = (product?.available_quantity ?? product?.stock_quantity ?? product?.stock ?? 1) <= 0;

  if (!product || !product.id) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
      <Link href={route('frontend.shop.show', product.id)} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50">
          {/* Badge Sale */}
          {discountPercent > 0 && !isOut && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Image principale */}
          <img
            src={images[0]}
            alt={product?.name || 'Produit'}
            loading="lazy"
            className={`w-full h-full object-cover ${isOut ? 'opacity-70' : ''}`}
          />
        </div>

        {/* Informations produit */}
        <div className="p-3">
          {/* Nom du produit */}
          <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-1">
            {product?.name}
          </h3>

          {/* Prix */}
          <div className="text-sm font-bold text-gray-900">
            {fp.text}
          </div>
        </div>
      </Link>
    </div>
  );
});

// Composant principal avec variantes
const ProductCardNewUnified = ({ product, variant = 'default', ...props }) => {
  if (variant === 'compact' || variant === 'carousel' || variant === 'mini') {
    return <ProductCardCompact product={product} {...props} />;
  }
  
  return <ProductCardNew product={product} variant={variant} {...props} />;
};

export default ProductCardNewUnified;