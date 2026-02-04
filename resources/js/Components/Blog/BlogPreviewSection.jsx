import React from 'react';
import { Link } from '@inertiajs/react';
import { NewspaperIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import BlogCard from './BlogCard';

/**
 * BlogPreviewSection - Section blog sur la homepage
 * Affiche les 3 derniers articles
 * Style 43einhalb
 */
export default function BlogPreviewSection({ posts = [] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                {/* Header avec titre et lien "Voir tout" */}
                <div className="flex items-end justify-between mb-12 border-b border-gray-900 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <NewspaperIcon className="h-8 w-8 text-black" />
                            <h2 className="font-barlow text-4xl md:text-5xl font-bold text-black uppercase">
                                Sneaker Culture
                            </h2>
                        </div>
                        <p className="text-gray-600 font-barlow text-lg">
                            Actualités, guides et tendances sneakers
                        </p>
                    </div>

                    {/* CTA Desktop */}
                    <Link 
                        href={route('blog.index')}
                        className="hidden md:flex items-center gap-2 px-8 py-4 bg-black text-white font-barlow font-bold uppercase text-sm tracking-wide hover:bg-gray-800 transition-all group"
                    >
                        Voir tous les articles
                        <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Grid des articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {posts.slice(0, 3).map((post) => (
                        <BlogCard key={post.id} post={post} />
                    ))}
                </div>

                {/* CTA Mobile */}
                <div className="md:hidden text-center">
                    <Link 
                        href={route('blog.index')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-barlow font-bold uppercase text-sm tracking-wide hover:bg-gray-800 transition-all group"
                    >
                        Voir tous les articles
                        <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
