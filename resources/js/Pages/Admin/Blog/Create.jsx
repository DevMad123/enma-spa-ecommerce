import React, { useState, useRef } from 'react';
import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PhotoIcon,
    TagIcon,
    CalendarIcon,
    StarIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function CreateBlogPost() {
    const { categories } = usePage().props;
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const coverImageRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category_id: '',
        cover_image: null,
        tags: [],
        published_at: '',
        is_featured: false,
        seo_title: '',
        seo_description: '',
        seo_keywords: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.blog.store'), {
            forceFormData: true,
        });
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
            setData('tags', [...data.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setData('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    const handleAddSeoKeyword = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !data.seo_keywords.includes(tagInput.trim())) {
            setData('seo_keywords', [...data.seo_keywords, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveSeoKeyword = (keyword) => {
        setData('seo_keywords', data.seo_keywords.filter(k => k !== keyword));
    };

    return (
        <AdminLayout>
            <Head title="Créer un Article" />

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
                    <h1 className="text-3xl font-bold text-gray-900">Créer un Nouvel Article</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Ajoutez un nouvel article de blog à votre site
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne principale */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Informations de base */}
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de Base</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Titre <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Le titre de votre article"
                                            required
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug (URL)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="mon-article-de-blog (optionnel, généré automatiquement)"
                                        />
                                        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Laissez vide pour générer automatiquement depuis le titre
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Extrait <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.excerpt}
                                            onChange={(e) => setData('excerpt', e.target.value)}
                                            rows={3}
                                            maxLength={500}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Un court résumé de votre article (max 500 caractères)"
                                            required
                                        />
                                        <div className="flex justify-between mt-1">
                                            {errors.excerpt && <p className="text-sm text-red-600">{errors.excerpt}</p>}
                                            <p className="text-xs text-gray-500 ml-auto">{data.excerpt.length}/500</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contenu <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            rows={15}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
                                            placeholder="Le contenu complet de votre article (HTML accepté)"
                                            required
                                        />
                                        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Vous pouvez utiliser du HTML pour formater votre contenu
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SEO */}
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimisation SEO</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Titre SEO
                                        </label>
                                        <input
                                            type="text"
                                            value={data.seo_title}
                                            onChange={(e) => setData('seo_title', e.target.value)}
                                            maxLength={255}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Titre optimisé pour les moteurs de recherche"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Laissez vide pour utiliser le titre principal
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description SEO
                                        </label>
                                        <textarea
                                            value={data.seo_description}
                                            onChange={(e) => setData('seo_description', e.target.value)}
                                            rows={3}
                                            maxLength={500}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Description pour les moteurs de recherche"
                                        />
                                        <div className="flex justify-between mt-1">
                                            <p className="text-xs text-gray-500">Laissez vide pour utiliser l'extrait</p>
                                            <p className="text-xs text-gray-500">{data.seo_description.length}/500</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mots-clés SEO
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (tagInput.trim() && !data.seo_keywords.includes(tagInput.trim())) {
                                                            setData('seo_keywords', [...data.seo_keywords, tagInput.trim()]);
                                                            setTagInput('');
                                                        }
                                                    }
                                                }}
                                                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                placeholder="Ajoutez un mot-clé et appuyez sur Entrée"
                                            />
                                        </div>
                                        {Array.isArray(data.seo_keywords) && data.seo_keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {data.seo_keywords.map((keyword, index) => (
                                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                                                        {keyword}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSeoKeyword(keyword)}
                                                            className="ml-2 hover:text-indigo-600"
                                                        >
                                                            <XCircleIcon className="h-4 w-4" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Publication */}
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Publication</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date de publication
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.published_at}
                                            onChange={(e) => setData('published_at', e.target.value)}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Laissez vide pour sauvegarder en brouillon
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                                            <div className="flex items-center">
                                                <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                                                Article à la une
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Catégorie */}
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégorie</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catégorie <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                                </div>
                            </div>

                            {/* Image de couverture */}
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Image de Couverture <span className="text-red-500">*</span>
                                </h2>
                                
                                <div>
                                    <div
                                        onClick={() => coverImageRef.current?.click()}
                                        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition cursor-pointer"
                                    >
                                        {coverImagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={coverImagePreview}
                                                    alt="Aperçu"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setData('cover_image', null);
                                                        setCoverImagePreview(null);
                                                    }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600">Cliquez pour ajouter une image</p>
                                                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP, AVIF (max 2MB)</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={coverImageRef}
                                        type="file"
                                        onChange={handleCoverImageChange}
                                        accept="image/jpeg,image/png,image/webp,image/avif"
                                        className="hidden"
                                    />
                                    {errors.cover_image && <p className="mt-1 text-sm text-red-600">{errors.cover_image}</p>}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                                
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddTag(e);
                                                }
                                            }}
                                            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Ajoutez un tag"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Appuyez sur Entrée pour ajouter</p>
                                    {data.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.tags.map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                                                    <TagIcon className="h-3 w-3 mr-1" />
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-2 hover:text-gray-600"
                                                    >
                                                        <XCircleIcon className="h-4 w-4" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center justify-end space-x-4 bg-white shadow-sm rounded-lg p-6">
                        <Link
                            href={route('admin.blog.index')}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    Créer l'Article
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
