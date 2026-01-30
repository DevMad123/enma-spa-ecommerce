import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ClockIcon,
    CalendarIcon,
    TagIcon,
    StarIcon,
    UserIcon
} from '@heroicons/react/24/outline';

export default function ShowBlogPost() {
    const { blogPost } = usePage().props;

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            router.delete(route('admin.blog.destroy', blogPost.id));
        }
    };

    const getPublicationStatus = () => {
        if (!blogPost.published_at) {
            return { text: 'Brouillon', color: 'gray' };
        }
        
        const publishedDate = new Date(blogPost.published_at);
        const now = new Date();
        
        if (publishedDate > now) {
            return { text: 'Programmé', color: 'blue' };
        }
        
        return { text: 'Publié', color: 'green' };
    };

    const status = getPublicationStatus();

    return (
        <AdminLayout>
            <Head title="Détails de l'Article" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* En-tête */}
                <div className="mb-8">
                    <Link
                        href={route('admin.blog.index')}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Retour à la liste
                    </Link>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{blogPost.title}</h1>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-800`}>
                                    {status.text}
                                </span>
                                {blogPost.is_featured && (
                                    <span className="inline-flex items-center text-yellow-600">
                                        <StarIcon className="h-5 w-5 mr-1 fill-yellow-500" />
                                        À la une
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <a
                                href={route('blog.show', blogPost.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <EyeIcon className="h-5 w-5 mr-2" />
                                Voir en ligne
                            </a>
                            <Link
                                href={route('admin.blog.edit', blogPost.id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <PencilIcon className="h-5 w-5 mr-2" />
                                Modifier
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                <TrashIcon className="h-5 w-5 mr-2" />
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contenu principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image de couverture */}
                        {blogPost.cover_image_url && (
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                                <img
                                    src={blogPost.cover_image_url}
                                    alt={blogPost.title}
                                    className="w-full h-96 object-cover"
                                />
                            </div>
                        )}

                        {/* Extrait */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Extrait</h2>
                            <p className="text-gray-700">{blogPost.excerpt}</p>
                        </div>

                        {/* Contenu */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenu</h2>
                            <div 
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: blogPost.content }}
                            />
                        </div>

                        {/* SEO */}
                        {blogPost.seo_meta && Object.keys(blogPost.seo_meta).length > 0 && (
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées SEO</h2>
                                <div className="space-y-3">
                                    {blogPost.seo_meta.title && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Titre SEO:</span>
                                            <p className="text-gray-600">{blogPost.seo_meta.title}</p>
                                        </div>
                                    )}
                                    {blogPost.seo_meta.description && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Description SEO:</span>
                                            <p className="text-gray-600">{blogPost.seo_meta.description}</p>
                                        </div>
                                    )}
                                    {blogPost.seo_meta.keywords && Array.isArray(blogPost.seo_meta.keywords) && blogPost.seo_meta.keywords.length > 0 && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Mots-clés SEO:</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {blogPost.seo_meta.keywords.map((keyword, index) => (
                                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statistiques */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <EyeIcon className="h-5 w-5 mr-2" />
                                        Vues
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{blogPost.views || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <ClockIcon className="h-5 w-5 mr-2" />
                                        Temps de lecture
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{blogPost.read_time} min</span>
                                </div>
                            </div>
                        </div>

                        {/* Informations */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Catégorie:</span>
                                    <p className="text-gray-600">{blogPost.category?.name || 'N/A'}</p>
                                </div>
                                {blogPost.author && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Auteur:</span>
                                        <div className="flex items-center mt-1">
                                            <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            <p className="text-gray-600">{blogPost.author.name}</p>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Slug:</span>
                                    <p className="text-gray-600 text-sm font-mono">{blogPost.slug}</p>
                                </div>
                                {blogPost.published_at && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Date de publication:</span>
                                        <div className="flex items-center mt-1">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            <p className="text-gray-600">{new Date(blogPost.published_at).toLocaleDateString('fr-FR', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Créé le:</span>
                                    <p className="text-gray-600 text-sm">{new Date(blogPost.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Modifié le:</span>
                                    <p className="text-gray-600 text-sm">{new Date(blogPost.updated_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {blogPost.tags && blogPost.tags.length > 0 && (
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {blogPost.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                                            <TagIcon className="h-3 w-3 mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
