import React, { useRef, useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';

const ProductMiniCard = ({ product, currencySymbol = 'F CFA', showNewBadge = false }) => {
  const initialPrice = product?.current_sale_price ?? product?.price ?? 0;
  const [minPrice, setMinPrice] = useState(initialPrice);
  const hasPromo = (product?.discount_percentage ?? 0) > 0;
  const hasColors = Array.isArray(product?.colors) && product.colors.length > 0;
  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
  const isVariable = (
    product?.type === 'variable' ||
    product?.has_variants === true ||
    (typeof product?.variants_count === 'number' && product.variants_count > 0) ||
    hasColors || hasSizes || hasVariants ||
    (Array.isArray(product?.attributes) && product.attributes.length > 0)
  );

  useEffect(() => {
    let cancelled = false;
    // For variable products, fetch minimal variant price
    if (isVariable && product?.id) {
      fetch(`/api/products/${product.id}/min-price`, { headers: { 'Accept': 'application/json' }})
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!cancelled && data && typeof data.min_price === 'number') {
            setMinPrice(data.min_price);
          }
        })
        .catch(() => {});
    } else {
      setMinPrice(initialPrice);
    }
    return () => { cancelled = true; };
  }, [isVariable, product?.id, initialPrice]);

  return (
    <Link href={route('frontend.shop.show', product.id)} className="group block min-w-[220px] sm:min-w-[240px] md:min-w-[260px] mr-4 last:mr-0">
      <div className="relative rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {showNewBadge && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-black text-white tracking-wide">Nouveau</span>
          )}
          {hasPromo && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500 text-white tracking-wide">Promo</span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton product={product} size="small" />
        </div>

        {/* Image */}
        <div className="w-full bg-white">
          <div className="w-full h-56 sm:h-60 flex items-center justify-center overflow-hidden">
            <img
              src={product?.image || '/images/placeholder.jpg'}
              alt={product?.name || 'Produit'}
              loading="lazy"
              className="max-h-full max-w-full object-contain transform transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Infos */}
        <div className="px-4 py-3">
          <div className="text-sm text-gray-500 mb-1 line-clamp-1">{product?.brand?.name || product?.category?.name || '\u00A0'}</div>
          <div className="text-[15px] font-medium text-gray-900 line-clamp-2 min-h-[42px]">{product?.name}</div>
          <div className="mt-2 text-sm text-gray-700">
            {isVariable ? (
              <>
                <span className="mr-1">À partir de</span>
                <span className="font-semibold text-gray-900">{minPrice} {currencySymbol}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-900">{minPrice} {currencySymbol}</span>
                {product?.price && product?.current_sale_price && product.price > product.current_sale_price && (
                  <span className="ml-2 text-gray-500 line-through">{product.price} {currencySymbol}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* CTA on hover */}
        <div className="absolute left-3 right-3 bottom-8 opacity-0 group-hover:opacity-100 transition-opacity">
          {isVariable ? (
            <div className="w-full px-4 py-2 rounded-xl text-center text-white text-sm shadow-lg bg-gradient-to-r from-amber-500 to-orange-600">
              Choisir options
            </div>
          ) : (
            <CartButton product={product} size="small" className="w-full" variant="gradient" />
          )}
        </div>
      </div>
    </Link>
  );
};

export default function ProductCarousel({ products = [], title = 'Nouveautés', viewMoreHref = '/nouveautes', currencySymbol = 'F CFA' }) {
  const scrollerRef = useRef(null);
  const scrollBy = (delta) => {
    if (scrollerRef.current) {
      const amount = Math.round(scrollerRef.current.clientWidth * (Math.abs(delta) > 1 ? 1 : 0.9));
      scrollerRef.current.scrollBy({ left: Math.sign(delta) * amount, behavior: 'smooth' });
    }
  };

  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="hidden sm:inline-flex h-9 w-9 rounded-full border border-gray-200 text-gray-700 bg-white hover:shadow transition-all"
              aria-label="Précédent"
            >
              <ChevronLeftIcon className="h-5 w-5 mx-auto" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="hidden sm:inline-flex h-9 w-9 rounded-full border border-gray-200 text-gray-700 bg-white hover:shadow transition-all"
              aria-label="Suivant"
            >
              <ChevronRightIcon className="h-5 w-5 mx-auto" />
            </button> */}
            {viewMoreHref && (
              <Link href={viewMoreHref} className="text-sm font-semibold text-gray-900 hover:text-gray-700 underline">
                Voir plus
              </Link>
            )}
          </div>
        </div>

        <div className="relative">
          {/* Boutons overlay desktop */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white items-center justify-center shadow-lg z-10"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary, #f59e0b), var(--theme-primary-hover, #ea580c))' }}
            aria-label="Défiler vers la gauche"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white items-center justify-center shadow-lg z-10"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary, #f59e0b), var(--theme-primary-hover, #ea580c))' }}
            aria-label="Défiler vers la droite"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          {/* Scroller */}
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-4 pr-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {products.map((p) => (
              <div key={p.id} className="snap-start">
                <ProductMiniCard product={p} currencySymbol={currencySymbol} showNewBadge={true} />
              </div>
            ))}
          </div>

          {/* Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}
