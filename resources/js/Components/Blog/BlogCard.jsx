import React from 'react';
import { Link } from '@inertiajs/react';
import { ClockIcon, EyeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * BlogCard - Card article de blog style 43einhalb
 * Design premium sneakers avec hover effects
 */
export default function BlogCard({ post, featured = false }) {
    if (!post) return null;

    const cardClasses = featured
        ? "group block bg-white rounded-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
        : "group block bg-white rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500";

    const imageHeight = featured ? "h-[400px] md:h-[500px]" : "h-64";

    return (
        <Link
            href={route('blog.show', post.slug)}
            className={cardClasses}
        >
            {/* Image avec overlay subtil */}
            <div className={`relative ${imageHeight} overflow-hidden bg-gray-900`}>
                <img 
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-700"
                    loading="lazy"
                />
                
                {/* Badge catégorie - Style 43einhalb */}
                {post.category && (
                    <div className="absolute top-4 left-4 bg-black text-white px-4 py-1.5 text-xs font-barlow font-bold uppercase tracking-wider">
                        {post.category.name}
                    </div>
                )}

                {/* Overlay gradient subtil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Contenu */}
            <div className={featured ? "p-8" : "p-6"}>
                {/* Titre */}
                <h3 className={`font-barlow font-bold text-black mb-3 group-hover:text-gray-700 transition-colors line-clamp-2 ${featured ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                    {post.title}
                </h3>
                
                {/* Excerpt */}
                <p className={`text-gray-600 font-barlow mb-4 line-clamp-${featured ? '4' : '3'}`}>
                    {post.excerpt}
                </p>

                {/* Meta informations */}
                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4">
                        {/* Date */}
                        <span className="font-barlow">{post.published_at}</span>
                        
                        {/* Temps de lecture */}
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-4 w-4" />
                            <span>{post.read_time} min</span>
                        </div>

                        {/* Vues */}
                        {post.views > 0 && (
                            <div className="flex items-center gap-1.5">
                                <EyeIcon className="h-4 w-4" />
                                <span>{post.views}</span>
                            </div>
                        )}
                    </div>

                    {/* Lire plus avec flèche */}
                    <div className="flex items-center gap-2 text-black font-barlow font-semibold group-hover:gap-3 transition-all">
                        <span className="text-xs uppercase tracking-wide">Lire</span>
                        <ArrowRightIcon className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
