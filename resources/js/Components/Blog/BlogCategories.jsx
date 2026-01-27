import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * BlogCategories - Navigation horizontale des catégories
 * Style 43einhalb avec scroll horizontal
 */
export default function BlogCategories({ categories = [], activeCategory = null }) {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="bg-white border-y border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Scroll horizontal sur mobile */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-4">
                    {/* Lien "Tous" */}
                    <Link
                        href={route('blog.index')}
                        className={`whitespace-nowrap px-6 py-2.5 font-barlow font-semibold uppercase text-sm tracking-wide transition-all ${
                            !activeCategory
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Tous
                        <span className="ml-2 text-xs opacity-70">
                            ({categories.reduce((sum, cat) => sum + (cat.posts_count || 0), 0)})
                        </span>
                    </Link>

                    {/* Catégories */}
                    {categories.map((category) => {
                        const isActive = activeCategory?.slug === category.slug;
                        
                        return (
                            <Link
                                key={category.id}
                                href={route('blog.category', category.slug)}
                                className={`whitespace-nowrap px-6 py-2.5 font-barlow font-semibold uppercase text-sm tracking-wide transition-all ${
                                    isActive
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category.name}
                                {category.posts_count > 0 && (
                                    <span className="ml-2 text-xs opacity-70">
                                        ({category.posts_count})
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
