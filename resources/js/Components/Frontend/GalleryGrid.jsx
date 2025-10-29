import React from 'react';
import { Link } from '@inertiajs/react';

export default function GalleryGrid({ items = [], title = 'Lifestyle' }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => {
            const img = it.image || '/images/placeholder.jpg';
            const content = (
              <div className="group relative overflow-hidden rounded-xl border bg-gray-50">
                <img src={img} alt={it.title || 'Lifestyle'} loading="lazy" className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {(it.title) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white p-3">
                    <div className="text-sm font-medium">{it.title}</div>
                  </div>
                )}
              </div>
            );
            return (
              <div key={it.id}>
                {it.url ? (
                  <Link href={it.url} target={it.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {content}
                  </Link>
                ) : content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

