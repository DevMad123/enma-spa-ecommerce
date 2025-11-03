import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    PhotoIcon,
    XMarkIcon,
    EyeIcon,
    UserCircleIcon,
    BuildingOfficeIcon
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
        is_popular: category.is_popular === 1 || category.is_popular === true || category.is_popular === '1',
        status: category.status === 1 || category.status === true || category.status === '1',
        image: null,
        _method: 'PUT',
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

        if (import.meta.env.DEV) console.log('📦 Données envoyées:', Object.fromEntries(formData));

        // Envoyer via router.post pour supporter l'upload de fichiers
        router.post(route('admin.categories.update', category.id), formData, {
            onStart: () => {
                if (import.meta.env.DEV) console.log('🚀 Début de la requête PUT');
            },
            onSuccess: (data) => {
                if (import.meta.env.DEV) console.log('✅ Succès:', data);
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                if (import.meta.env.DEV) console.log('🏁 Requête terminée');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Modifier: ${category.name}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.categories.index')}
                                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Retour aux catégories
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('admin.categories.show', category.id)}
                                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informations de base */}
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>
                                    </div>
                                </div>
                                <div className="px-6 py-6 space-y-6">
                                    {/* Nom de la catégorie */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom de la catégorie *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Entrez le nom de la catégorie"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            id="note"
                                            rows={4}
                                            value={data.note}
                                            onChange={(e) => setData('note', e.target.value)}
                                            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                errors.note ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Description de la catégorie (optionnel)"
                                        />
                                        {errors.note && (
                                            <p className="mt-1 text-sm text-red-600">{errors.note}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Options et statut */}
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Options et statut</h3>
                                    </div>
                                </div>
                                <div className="px-6 py-6 space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_popular"
                                            checked={data.is_popular}
                                            onChange={(e) => setData('is_popular', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_popular" className="ml-2 block text-sm text-gray-900">
                                            Catégorie populaire
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                                            Catégorie active
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <PhotoIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Image de la catégorie</h3>
                                    </div>
                                </div>
                                <div className="px-6 py-6">
                                    <div className="space-y-4">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
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
                                                            JPG, PNG, WEBP, AVIF — 2 Mo max
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Input file */}
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.avif"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        
                                        {errors.image && (
                                            <p className="text-sm text-red-600">{errors.image}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-4 bg-gray-50 px-6 py-4 rounded-lg border">
                                <Link
                                    href={route('admin.categories.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {processing ? 'Modification...' : 'Modifier la catégorie'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Panneau d'aperçu */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 sticky top-8">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Aperçu</h3>
                            </div>
                            <div className="px-6 py-6 space-y-6">
                                {/* Image d'aperçu */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Image</h4>
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Aperçu de la catégorie"
                                            className="w-full h-32 object-cover rounded-lg border"
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Informations */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Nom</h4>
                                        <p className="mt-1 text-sm text-gray-900">{data.name || 'Non défini'}</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Description</h4>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {data.note || 'Aucune description'}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Options</h4>
                                        <div className="mt-1 space-y-1">
                                            <div className="flex items-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    data.is_popular 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {data.is_popular ? 'Populaire' : 'Standard'}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    data.status 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {data.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations existantes */}
                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Informations système</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">ID:</span>
                                            <span className="text-gray-900">#{category.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Slug:</span>
                                            <span className="text-gray-900 text-xs">{category.slug || 'Auto-généré'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Produits:</span>
                                            <span className="text-gray-900">{category.products_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}


