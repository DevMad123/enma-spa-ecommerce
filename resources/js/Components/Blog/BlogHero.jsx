import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRightIcon, ClockIcon } from '@heroicons/react/24/outline';

/**
 * BlogHero - Hero section pour article mis en avant
 * Style 43einhalb avec image pleine largeur
 */
export default function BlogHero({ post }) {
    if (!post) return null;

    return (
        <section className="relative w-full h-[70vh] md:h-[80vh] bg-black overflow-hidden">
            {/* Image de fond */}
            <div className="absolute inset-0">
                <img 
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-70"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            {/* Contenu */}
            <div className="relative h-full EecDefaultWidth px-4 sm:px-6 lg:px-8 flex items-end pb-16">
                <div className="max-w-3xl">
                    {/* Badge catégorie */}
                    {post.category && (
                        <div className="inline-block bg-white text-black px-4 py-2 mb-6 text-xs font-barlow font-bold uppercase tracking-wider">
                            {post.category.name}
                        </div>
                    )}

                    {/* Titre */}
                    <h1 className="font-barlow text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Excerpt */}
                    <p className="text-xl md:text-2xl text-gray-200 font-barlow mb-8 line-clamp-3">
                        {post.excerpt}
                    </p>

                    {/* Meta + CTA */}
                    <div className="flex flex-wrap items-center gap-6 text-white/80">
                        {/* Date */}
                        <span className="font-barlow text-sm">{post.published_at}</span>
                        
                        {/* Temps de lecture */}
                        <div className="flex items-center gap-2">
                            <ClockIcon className="h-5 w-5" />
                            <span className="font-barlow text-sm">{post.read_time} min</span>
                        </div>

                        {/* CTA */}
                        <Link 
                            href={route('blog.show', post.slug)}
                            className="flex items-center gap-2 bg-white text-black px-6 py-3 font-barlow font-bold uppercase text-sm hover:bg-gray-200 transition-colors ml-auto"
                        >
                            Lire l'article
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
