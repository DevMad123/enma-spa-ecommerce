import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { normalizeImageUrl } from '@/Utils/imageUtils';
import { 
    ArrowLeftIcon,
    PencilIcon,
    PhotoIcon,
    TagIcon,
    BuildingStorefrontIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function ShowSubcategory({ subcategory }) {
    return (
        <AdminLayout>
            <Head title={`Sous-catégorie - ${subcategory.name}`} />
            
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
                        <Link
                            href={route('admin.subcategories.edit', subcategory.id)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PencilIcon className="h-5 w-5" />
                            <span>Modifier</span>
                        </Link>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold text-gray-900">{subcategory.name}</h1>
                        <p className="mt-2 text-gray-600">Détails de la sous-catégorie</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Informations générales */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <TagIcon className="h-6 w-6 mr-2 text-blue-600" />
                                Informations générales
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom de la sous-catégorie
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900">{subcategory.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie parente
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                                        <span className="text-lg text-gray-900">{subcategory.category?.name || 'Non assignée'}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        {subcategory.status ? (
                                            <>
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                                                    Active
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircleIcon className="h-5 w-5 text-red-500" />
                                                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                                                    Inactive
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de création
                                    </label>
                                    <p className="text-gray-900">
                                        {new Date(subcategory.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {subcategory.note && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{subcategory.note}</p>
                                </div>
                            )}
                        </div>

                        {/* Statistiques */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Statistiques
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {subcategory.products_count || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Produits</div>
                                </div>
                                
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {subcategory.status ? 'Actif' : 'Inactif'}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Statut</div>
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        #{subcategory.id}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">ID</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Image */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <PhotoIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Image
                            </h3>
                            {subcategory.image ? (
                                <div className="space-y-4">
                                    <img
                                        src={normalizeImageUrl(subcategory.image)}
                                        alt={subcategory.name}
                                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                    />
                                    <p className="text-sm text-gray-500 text-center">
                                        Image de la sous-catégorie
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Aucune image</p>
                                </div>
                            )}
                        </div>

                        {/* Actions rapides */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Actions rapides
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    href={route('admin.subcategories.edit', subcategory.id)}
                                    className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Modifier
                                </Link>
                                
                                <Link
                                    href={route('admin.categories.show', subcategory.category?.id)}
                                    className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                                    Voir la catégorie
                                </Link>
                            </div>
                        </div>

                        {/* Informations système */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Informations système
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID:</span>
                                    <span className="font-medium">#{subcategory.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Créé le:</span>
                                    <span className="font-medium">
                                        {new Date(subcategory.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Modifié le:</span>
                                    <span className="font-medium">
                                        {new Date(subcategory.updated_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}