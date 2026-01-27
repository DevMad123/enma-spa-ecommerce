import React from 'react';
import BlogCard from './BlogCard';

/**
 * RelatedArticles - Articles liés (même catégorie)
 * Section "Vous pourriez aussi aimer"
 */
export default function RelatedArticles({ posts = [] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="border-t border-gray-200 pt-16 mt-16">
            <div className="mb-12">
                <h2 className="font-barlow text-3xl md:text-4xl font-bold text-black uppercase mb-3">
                    Articles similaires
                </h2>
                <p className="text-gray-600 font-barlow">
                    Continuez votre lecture avec ces articles connexes
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>
        </section>
    );
}
