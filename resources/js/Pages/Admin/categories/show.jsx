import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    PencilIcon,
    TagIcon,
    CubeIcon,
    CheckCircleIcon,
    XCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';

export default function ShowCategory({ category }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title={`Catégorie: ${category.name}`} />
            
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
                                href={route('admin.categories.edit', category.id)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Modifier
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                        <p className="mt-2 text-gray-600">Détails de la catégorie</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations de base */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <TagIcon className="h-5 w-5 mr-2" />
                                Informations de base
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                                    <p className="text-lg font-medium text-gray-900">{category.name}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Slug</label>
                                    <p className="text-gray-900">{category.slug || 'Généré automatiquement'}</p>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                    <p className="text-gray-900">
                                        {category.note || 'Aucune description fournie'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Statuts et options */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statuts et options</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Statut</label>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        category.status === 1 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {category.status === 1 ? (
                                            <>
                                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                Actif
                                            </>
                                        ) : (
                                            <>
                                                <XCircleIcon className="h-4 w-4 mr-1" />
                                                Inactif
                                            </>
                                        )}
                                    </span>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Popularité</label>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        category.is_popular === 1 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {category.is_popular === 1 ? (
                                            <>
                                                <StarIcon className="h-4 w-4 mr-1" />
                                                Populaire
                                            </>
                                        ) : (
                                            'Standard'
                                        )}
                                    </span>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Produits</label>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        <CubeIcon className="h-4 w-4 mr-1" />
                                        {category.products_count || 0} produit{(category.products_count || 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Produits associés */}
                        {category.products && category.products.length > 0 && (
                            <div className="bg-white shadow-lg rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <CubeIcon className="h-5 w-5 mr-2" />
                                    Produits associés ({category.products.length})
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.products.slice(0, 6).map((product) => (
                                        <div key={product.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <CubeIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500">ID: {product.id}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {category.products.length > 6 && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-500">
                                            Et {category.products.length - 6} autre{category.products.length - 6 !== 1 ? 's' : ''} produit{category.products.length - 6 !== 1 ? 's' : ''}...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Image */}
                        {category.image && (
                            <div className="bg-white shadow-lg rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image</h3>
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                />
                            </div>
                        )}

                        {/* Métadonnées */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                                    <p className="text-gray-900">#{category.id}</p>
                                </div>
                                
                                {category.created_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Créé le</label>
                                        <p className="text-gray-900 text-sm">{formatDate(category.created_at)}</p>
                                    </div>
                                )}
                                
                                {category.updated_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Modifié le</label>
                                        <p className="text-gray-900 text-sm">{formatDate(category.updated_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}