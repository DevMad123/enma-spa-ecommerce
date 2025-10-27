import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/Components/Frontend/ProductCard';

const ProductMiniCard = ({ product }) => (
  <div className="min-w-[220px] sm:min-w-[240px] md:min-w-[260px] mr-4 last:mr-0">
    <ProductCard product={product} variant="carousel" />
  </div>
);

export default function ProductCarousel({ products = [], title = 'Nouveautes', viewMoreHref = '/nouveautes', currencySymbol = 'F CFA' }) {
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
            {viewMoreHref && (
              <Link href={viewMoreHref} className="text-sm font-semibold text-gray-900 hover:text-gray-700 underline">
                Voir tout
              </Link>
            )}
          </div>
        </div>

        <div className="relative">
          {/* Navigation buttons */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="hidden sm:inline-flex absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-gray-200 text-gray-700 bg-white/90 hover:bg-white shadow transition-all z-10"
            aria-label="Précédent"
          >
            <ChevronLeftIcon className="h-5 w-5 mt-2 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-gray-200 text-gray-700 bg-white/90 hover:bg-white shadow transition-all z-10"
            aria-label="Suivant"
          >
            <ChevronRightIcon className="h-5 w-5 mt-2 mx-auto" />
          </button>

          <div ref={scrollerRef} className="flex overflow-x-auto no-scrollbar scroll-smooth gap-4 px-2">
            {products.map((p) => (
              <ProductMiniCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
