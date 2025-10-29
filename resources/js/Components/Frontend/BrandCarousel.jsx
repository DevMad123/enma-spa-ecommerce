import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const BrandCard = ({ brand }) => {
  const img = brand?.image_url || brand?.image || '/images/brand-placeholder.png';
  const name = brand?.name || 'Marque';
  const href = brand?.slug ? route('frontend.shop.index', { brands: brand.id }) : route('frontend.shop.index');

  return (
    <Link href={href} className="group block min-w-[140px] sm:min-w-[180px] md:min-w-[200px] mr-4 last:mr-0">
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-200 group-hover:shadow-md">
        <div className="w-full h-24 sm:h-28 md:h-32 flex items-center justify-center bg-white">
          <img src={img} alt={name} loading="lazy" className="max-h-full max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-3 text-center">
          <span className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">{name}</span>
        </div>
      </div>
    </Link>
  );
};

export default function BrandCarousel({ brands = [], title = 'Nos marques streetwear' }) {
  const scrollerRef = useRef(null);
  const scrollBy = (delta) => {
    if (scrollerRef.current) {
      const amount = Math.round(scrollerRef.current.clientWidth * (Math.abs(delta) > 1 ? 1 : 0.9));
      scrollerRef.current.scrollBy({ left: Math.sign(delta) * amount, behavior: 'smooth' });
    }
  };

  if (!Array.isArray(brands) || brands.length === 0) return null;

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <div className="hidden sm:flex items-center space-x-2">
            <button type="button" onClick={() => scrollBy(-1)} className="h-9 w-9 rounded-full border border-gray-200 text-gray-700 bg-white hover:shadow transition-all" aria-label="Marques précédentes">
              <ChevronLeftIcon className="h-5 w-5 mx-auto" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} className="h-9 w-9 rounded-full border border-gray-200 text-gray-700 bg-white hover:shadow transition-all" aria-label="Marques suivantes">
              <ChevronRightIcon className="h-5 w-5 mx-auto" />
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Overlay arrows */}
          <button type="button" onClick={() => scrollBy(-1)} className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white items-center justify-center shadow-lg z-10" style={{ background: 'linear-gradient(135deg, var(--theme-primary, #f59e0b), var(--theme-primary-hover, #ea580c))' }} aria-label="Défiler vers la gauche">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollBy(1)} className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white items-center justify-center shadow-lg z-10" style={{ background: 'linear-gradient(135deg, var(--theme-primary, #f59e0b), var(--theme-primary-hover, #ea580c))' }} aria-label="Défiler vers la droite">
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          {/* Scroller */}
          <div ref={scrollerRef} className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-4 pr-2" style={{ scrollbarWidth: 'none' }}>
            {brands.map((b) => (
              <div key={b.id} className="snap-start">
                <BrandCard brand={b} />
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

