import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';
import BlogCategories from '@/Components/Blog/BlogCategories';
import BlogCard from '@/Components/Blog/BlogCard';
import Pagination from '@/Components/Pagination';

/**
 * Blog Category - Page d'une catégorie spécifique
 */
export default function BlogCategory({ posts, category, categories = [] }) {
    return (
        <FrontendLayout title={`${category.name} - Blog`}>
            <Head>
                <title>{category.name} - Blog Sneakers | ENMA SPA</title>
                <meta name="description" content={category.description || `Tous les articles de la catégorie ${category.name}`} />
            </Head>

            {/* Hero catégorie */}
            <section className="relative bg-black text-white py-20">
                {category.image && (
                    <div className="absolute inset-0 opacity-30">
                        <img 
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-barlow text-5xl md:text-6xl font-bold uppercase mb-4">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-xl text-gray-300 font-barlow max-w-3xl">
                            {category.description}
                        </p>
                    )}
                </div>
            </section>

            {/* Navigation catégories */}
            <BlogCategories categories={categories} activeCategory={category} />

            {/* Articles de la catégorie */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {posts.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {posts.data.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {posts.links && posts.links.length > 3 && (
                                <div className="flex justify-center">
                                    <Pagination links={posts.links} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-600 font-barlow">
                                Aucun article dans cette catégorie pour le moment.
                            </p>
                            <Link
                                href={route('blog.index')}
                                className="inline-block mt-6 px-6 py-3 bg-black text-white font-barlow font-semibold uppercase text-sm hover:bg-gray-800 transition-all"
                            >
                                Voir tous les articles
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </FrontendLayout>
    );
}
