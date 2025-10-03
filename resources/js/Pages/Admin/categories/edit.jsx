import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    PhotoIcon,
    XMarkIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function EditCategory({ category }) {
    // Normaliser l'URL de l'image existante
    const normalizeImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    };

    const [imagePreview, setImagePreview] = useState(normalizeImageUrl(category.image));
    const [imageDeleted, setImageDeleted] = useState(false);

    const { data, setData, processing, errors } = useForm({
        name: category.name || '',
        note: category.note || '',
        is_popular: category.is_popular === 1,
        status: category.status === 1,
        image: null,
        _method: 'PUT'
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImageDeleted(false);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        setImageDeleted(true);
        // Reset file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Préparer FormData pour l'upload de fichiers
        const formData = new FormData();
        
        // Ajouter tous les champs du formulaire
        Object.keys(data).forEach(key => {
            if (key === 'image' && data[key]) {
                formData.append(key, data[key]);
            } else if (key !== 'image') {
                formData.append(key, data[key]);
            }
        });

        // Ajouter le flag de suppression d'image si nécessaire
        if (imageDeleted) {
            formData.append('image_deleted', '1');
        }

        console.log('📦 Données envoyées:', Object.fromEntries(formData));

        // Envoyer via router.post pour supporter l'upload de fichiers
        router.post(route('admin.categories.update', category.id), formData, {
            onStart: () => {
                console.log('🚀 Début de la requête PUT');
            },
            onSuccess: (data) => {
                console.log('✅ Succès:', data);
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                console.log('🏁 Requête terminée');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Modifier: ${category.name}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.categories.index')}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Retour aux catégories
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('admin.categories.show', category.id)}
                                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Voir
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold text-gray-900">Modifier la catégorie</h1>
                        <p className="mt-2 text-gray-600">{category.name}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de base</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Nom */}
                            <div className="lg:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom de la catégorie *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Entrez le nom de la catégorie"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-2">
                                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="note"
                                    rows={4}
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.note ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Description de la catégorie (optionnel)"
                                />
                                {errors.note && (
                                    <p className="mt-1 text-sm text-red-600">{errors.note}</p>
                                )}
                            </div>

                            {/* Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">Options</label>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_popular}
                                            onChange={(e) => setData('is_popular', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Catégorie populaire</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Catégorie active</span>
                                    </label>
                                </div>
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image de la catégorie
                                </label>
                                <div className="space-y-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Aperçu"
                                                className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-2">
                                                <label htmlFor="image-upload" className="cursor-pointer">
                                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                                        Cliquez pour ajouter une image
                                                    </span>
                                                    <span className="mt-1 block text-xs text-gray-500">
                                                        PNG, JPG, WEBP jusqu'à 2MB
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Input file toujours présent */}
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    
                                    {errors.image && (
                                        <p className="text-sm text-red-600">{errors.image}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations existantes */}
                    <div className="bg-gray-50 shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations existantes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-600">ID:</span>
                                <span className="ml-2 text-gray-900">#{category.id}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Slug:</span>
                                <span className="ml-2 text-gray-900">{category.slug || 'Auto-généré'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Produits:</span>
                                <span className="ml-2 text-gray-900">{category.products_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 bg-gray-50 px-6 py-4 rounded-lg">
                        <Link
                            href={route('admin.categories.index')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? 'Modification...' : 'Modifier la catégorie'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}