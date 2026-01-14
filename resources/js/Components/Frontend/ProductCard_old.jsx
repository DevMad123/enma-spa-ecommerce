import React, { memo, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import { formatVariablePrice } from '@/Utils/productPrice';
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

const isVariableProduct = (p) => {
  if (!p) return false;
  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
  const hasColors = Array.isArray(p.colors) && p.colors.length > 0;
  const hasSizes = Array.isArray(p.sizes) && p.sizes.length > 0;
  return p.type === 'variable' || hasVariants || hasColors || hasSizes;
};

const ProductCard = memo(function ProductCard({ product, variant = 'default', showQuickView = false }) {
  const images = useMemo(() => buildImages(product), [product]);
  const fp = useMemo(() => formatVariablePrice(product), [product]);
  const variable = isVariableProduct(product);
  const isOut = (product?.available_quantity ?? product?.stock_quantity ?? product?.stock ?? 1) <= 0;

  const compact = variant === 'carousel' || variant === 'mini' || variant === 'compact';

  return (
    <Link
      href={route('frontend.shop.show', product.id)}
      className={`group relative block bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        compact ? 'shadow-md hover:shadow-lg' : 'shadow-lg hover:shadow-2xl'
      } ${compact ? 'hover:-translate-y-1' : 'hover:-translate-y-1'}`}
    >
      {/* Badge rupture/promo */}
      {isOut && (
        <span className="absolute top-2 left-2 z-20 bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
          Rupture de stock
        </span>
      )}

      {product?.discount_percentage > 0 && !isOut && (
        <span className="absolute top-2 right-2 z-20 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          -{product.discount_percentage}%
        </span>
      )}

      {/* Bouton favoris */}
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <WishlistButton product={product} size="small" />
      </div>

      {/* Media */}
      <div className={`relative ${compact ? 'aspect-square' : 'aspect-square'} bg-gray-50`}> 
        {/* Image principale */}
        <img
          src={images[0]}
          alt={product?.name || 'Produit'}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out ${
            isOut ? 'opacity-70' : ''
          } group-hover:scale-105`}
        />
        {/* Image hover (crossfade) */}
        {images[1] && (
          <img
            src={images[1]}
            alt={(product?.name || 'Produit') + ' - 2'}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
          />
        )}
      </div>

      {/* Infos */}
      <div className={`${compact ? 'p-3' : 'p-4'}`}>
        {/* Nom */}
        <h3 className={`${compact ? 'text-sm' : 'text-base'} font-normal text-gray-800 text-center line-clamp-2 min-h-[2.5rem]`}>
          {product?.name}
        </h3>

        {/* Prix */}
        <div className="mt-2 text-center">
          <div className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-900`}>
            {fp.text}
          </div>
          {fp.compareAt && (
            <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 line-through`}>{formatCurrency(fp.compareAt)}</div>
          )}
        </div>

        {/* Couleurs (jusqu'à 3 pastilles) */}
        {Array.isArray(product?.colors) && product.colors.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1">
            {product.colors.slice(0, 3).map((c) => (
              <span
                key={c.id}
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: c.color_code || (c.name || '').toLowerCase() }}
                title={c.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[11px] text-gray-500">+{product.colors.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* CTA hover */}
      <div className={`pointer-events-none absolute left-0 right-0 bottom-3 flex justify-center transition-all duration-300 ease-out ${
        compact ? 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
      }`}>
        <span className="pointer-events-auto px-3 py-1 text-sm rounded-full bg-primary text-white hover:bg-primary/90">
          Voir le produit
        </span>
      </div>
    </Link>
  );
});

export default ProductCard;
