import React, { useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link, router } from '@inertiajs/react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import BlogHero from '@/Components/Blog/BlogHero';
import BlogCategories from '@/Components/Blog/BlogCategories';
import BlogCard from '@/Components/Blog/BlogCard';
import Pagination from '@/Components/Pagination';

/**
 * Blog Index - Page listing des articles
 * Style 43einhalb avec hero, catégories et grid
 */
export default function BlogIndex({ 
    posts, 
    featuredPost, 
    categories = [], 
    popularTags = [],
    filters = {} 
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('blog.index'), { search: searchQuery }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTagClick = (tag) => {
        router.get(route('blog.index'), { tag }, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    return (
        <FrontendLayout title="Blog Sneakers">
            <Head>
                <title>Blog Sneakers - Actualités, Guides & Tendances | ENMA SPA</title>
                <meta name="description" content="Découvrez les dernières actualités sneakers, nos guides d'entretien, les tendances mode et la culture streetwear." />
                <meta property="og:title" content="Blog Sneakers - ENMA SPA" />
                <meta property="og:type" content="website" />
            </Head>

            {/* Hero avec article mis en avant */}
            {featuredPost && <BlogHero post={featuredPost} />}

            {/* Catégories horizontales */}
            <BlogCategories categories={categories} />

            {/* Barre de recherche et filtres */}
            <section className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Recherche */}
                        <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un article..."
                                    className="w-full px-5 py-3 pl-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black font-barlow transition-all"
                                />
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </form>

                        {/* Nombre de résultats */}
                        <div className="text-sm text-gray-600 font-barlow">
                            <span className="font-semibold text-black">{posts.total}</span> article{posts.total > 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Tags populaires */}
                    {popularTags.length > 0 && (
                        <div className="mt-6">
                            <p className="text-sm font-barlow font-semibold text-gray-700 mb-3">Tags populaires :</p>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`px-4 py-1.5 text-sm font-barlow border transition-all ${
                                            filters.tag === tag
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                        }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Grid des articles */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {posts.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
                                Aucun article trouvé pour votre recherche.
                            </p>
                            {(filters.search || filters.tag) && (
                                <Link
                                    href={route('blog.index')}
                                    className="inline-block mt-6 px-6 py-3 bg-black text-white font-barlow font-semibold uppercase text-sm hover:bg-gray-800 transition-all"
                                >
                                    Réinitialiser les filtres
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </FrontendLayout>
    );
}
