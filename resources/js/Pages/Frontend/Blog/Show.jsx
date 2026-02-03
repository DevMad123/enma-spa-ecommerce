import React, { useEffect } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link } from '@inertiajs/react';
import { ClockIcon, EyeIcon, CalendarIcon, UserIcon, TagIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import RelatedArticles from '@/Components/Blog/RelatedArticles';

/**
 * Blog Show - Page article unique
 * Style 43einhalb avec design premium
 */
export default function BlogShow({ post, relatedPosts = [] }) {
    // Vérification de sécurité pour éviter les erreurs
    if (!post) {
        return (
            <FrontendLayout title="Article">
                <Head>
                    <title>Article | ENMA SPA</title>
                </Head>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-500">Article non trouvé</p>
                </div>
            </FrontendLayout>
        );
    }

    // Préparer les valeurs sûres
    const safePost = {
        title: post.title || 'Article',
        excerpt: post.excerpt || '',
        content: post.content || '',
        cover_image: post.cover_image || '',
        seo_title: post.seo_title || post.title || 'Article',
        seo_description: post.seo_description || post.excerpt || '',
        slug: post.slug || '',
        published_at: post.published_at || '',
        read_time: post.read_time || 5,
        views: post.views || 0,
        category: post.category || null,
        author: post.author || null,
        tags: Array.isArray(post.tags) ? post.tags : []
    };

    // Scroll to top au montage
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [safePost.slug]);

    // Fonction de partage (Web Share API)
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: safePost.title,
                    text: safePost.excerpt,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Erreur de partage:', err);
            }
        } else {
            // Fallback : copier l'URL
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papier !');
        }
    };

    return (
        <FrontendLayout title={safePost.title}>
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-sm font-barlow text-gray-600">
                        <Link href={route('home')} className="hover:text-black transition-colors">
                            Accueil
                        </Link>
                        <span>/</span>
                        <Link href={route('blog.index')} className="hover:text-black transition-colors">
                            Blog
                        </Link>
                        {safePost.category && (
                            <>
                                <span>/</span>
                                <Link 
                                    href={route('blog.category', safePost.category.slug)} 
                                    className="hover:text-black transition-colors"
                                >
                                    {safePost.category.name}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero image pleine largeur */}
            <div className="relative w-full h-[60vh] md:h-[70vh] bg-gray-900">
                <img 
                    src={safePost.cover_image}
                    alt={safePost.title}
                    className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Contenu de l'article */}
            <article className="EecDefaultWidth px-4 sm:px-6 lg:px-8 py-12">
                {/* Bouton retour */}
                <Link
                    href={route('blog.index')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-barlow font-semibold mb-8 transition-colors group"
                >
                    <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Retour aux articles
                </Link>

                {/* Meta informations */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                    {/* Catégorie */}
                    {safePost.category && (
                        <Link
                            href={route('blog.category', safePost.category.slug)}
                            className="inline-block bg-black text-white px-4 py-1.5 font-barlow font-bold uppercase text-xs tracking-wider hover:bg-gray-800 transition-colors"
                        >
                            {safePost.category.name}
                        </Link>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="font-barlow">{safePost.published_at}</span>
                    </div>

                    {/* Temps de lecture */}
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        <span className="font-barlow">{safePost.read_time} min</span>
                    </div>

                    {/* Vues */}
                    <div className="flex items-center gap-2">
                        <EyeIcon className="h-4 w-4" />
                        <span className="font-barlow">{safePost.views}</span>
                    </div>

                    {/* Auteur */}
                    {safePost.author && (
                        <div className="flex items-center gap-2 ml-auto">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-barlow font-semibold text-black">{safePost.author.name}</span>
                        </div>
                    )}
                </div>

                {/* Titre principal */}
                <h1 className="font-barlow text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-8 leading-tight">
                    {safePost.title}
                </h1>

                {/* Excerpt (chapô) */}
                <p className="text-xl md:text-2xl text-gray-700 font-barlow mb-12 leading-relaxed border-l-4 border-black pl-6">
                    {safePost.excerpt}
                </p>

                {/* Bouton partage */}
                <div className="flex justify-end mb-8">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-barlow font-semibold text-sm transition-colors"
                    >
                        <ShareIcon className="h-4 w-4" />
                        Partager
                    </button>
                </div>

                {/* Contenu de l'article */}
                <div 
                    className="prose prose-lg max-w-none font-barlow
                        prose-headings:font-barlow prose-headings:font-bold prose-headings:text-black
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:uppercase
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-black prose-a:font-semibold prose-a:underline hover:prose-a:no-underline
                        prose-strong:text-black prose-strong:font-bold
                        prose-ul:my-6 prose-li:my-2
                        prose-img:rounded-none prose-img:w-full prose-img:my-8"
                    dangerouslySetInnerHTML={{ __html: safePost.content }}
                />

                {/* Tags */}
                {safePost.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-3">
                            <TagIcon className="h-5 w-5 text-gray-500" />
                            {safePost.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={route('blog.index', { tag })}
                                    className="px-4 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-sm font-barlow font-semibold text-gray-700 transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            {/* Articles liés */}
            {relatedPosts && relatedPosts.length > 0 && (
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8 pb-20">
                    <RelatedArticles posts={relatedPosts} />
                </div>
            )}
        </FrontendLayout>
    );
}
