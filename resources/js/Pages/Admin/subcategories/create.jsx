import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    PhotoIcon,
    XMarkIcon,
    TagIcon
} from '@heroicons/react/24/outline';

export default function CreateSubcategory({ categories }) {
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        category_id: '',
        note: '',
        status: true,
        image: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        // Reset file input
        document.getElementById('image-upload').value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.subcategories.store'), {
            onSuccess: () => {
                reset();
                setImagePreview(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Créer une sous-catégorie" />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.subcategories.index')}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Retour aux sous-catégories
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold text-gray-900">Créer une nouvelle sous-catégorie</h1>
                        <p className="mt-2 text-gray-600">Ajoutez une nouvelle sous-catégorie à votre catalogue</p>
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
                                    Nom de la sous-catégorie *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Entrez le nom de la sous-catégorie"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Catégorie parente */}
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Catégorie parente *
                                </label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.category_id ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Sélectionnez une catégorie</option>
                                    {categories?.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                )}
                            </div>

                            {/* Statut */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">Statut</label>
                                <div className="flex items-center">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Sous-catégorie active</span>
                                    </label>
                                </div>
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
                                    placeholder="Description de la sous-catégorie (optionnel)"
                                />
                                {errors.note && (
                                    <p className="mt-1 text-sm text-red-600">{errors.note}</p>
                                )}
                            </div>

                            {/* Image */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image de la sous-catégorie
                                </label>
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
                                                        PNG, JPG, WEBP jusqu'à 2MB
                                                    </span>
                                                </label>
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {errors.image && (
                                        <p className="text-sm text-red-600">{errors.image}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 bg-gray-50 px-6 py-4 rounded-lg">
                        <Link
                            href={route('admin.subcategories.index')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? 'Création...' : 'Créer la sous-catégorie'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}