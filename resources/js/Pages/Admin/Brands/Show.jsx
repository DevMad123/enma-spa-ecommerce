import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function ShowBrand({ brand, products }) {
    const handleEdit = () => {
        router.visit(route('admin.brands.edit', brand.id));
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) {
            router.delete(route('admin.brands.destroy', brand.id));
        }
    };

    const isActive = brand.status === 1 || brand.status === true || brand.status === '1';

    return (
        <AdminLayout>
            <Head title={`Marque - ${brand.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.brands.index')}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
                            <p className="mt-2 text-gray-600">
                                Détails de la marque
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Modifier
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Supprimer
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations générales */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Informations générales
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    Détails de la marque {brand.name}
                                </p>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                <dl className="sm:divide-y sm:divide-gray-200">
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Nom de la marque
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {brand.name}
                                        </dd>
                                    </div>
                                    
                                    {brand.slug && (
                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">
                                                Slug
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                    {brand.slug}
                                                </code>
                                            </dd>
                                        </div>
                                    )}
                                    
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Description
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {brand.description || (
                                                <span className="text-gray-400 italic">Aucune description</span>
                                            )}
                                        </dd>
                                    </div>
                                    
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Statut
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {isActive ? (
                                                    <>
                                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircleIcon className="h-3 w-3 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </dd>
                                    </div>
                                    
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Date de création
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(brand.created_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </dd>
                                    </div>
                                    
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Dernière modification
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(brand.updated_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Produits associés */}
                        {products && products.length > 0 && (
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Produits associés
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {products.length} produit{products.length > 1 ? 's' : ''} utilise{products.length > 1 ? 'nt' : ''} cette marque
                                    </p>
                                </div>
                                <div className="border-t border-gray-200">
                                    <ul className="divide-y divide-gray-200">
                                        {products.slice(0, 5).map((product) => (
                                            <li key={product.id} className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {product.image ? (
                                                            <img 
                                                                className="h-10 w-10 rounded-lg object-cover" 
                                                                src={product.image} 
                                                                alt={product.name}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <ArchiveBoxIcon className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {product.price ? `${product.price}€` : 'Prix non défini'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            product.status 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {product.status ? 'Actif' : 'Inactif'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    {products.length > 5 && (
                                        <div className="px-4 py-3 bg-gray-50 text-center">
                                            <span className="text-sm text-gray-500">
                                                Et {products.length - 5} autre{products.length - 5 > 1 ? 's' : ''} produit{products.length - 5 > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6 sticky top-6 space-y-6">
                            {/* Logo */}
                            <div className="text-center">
                                {brand.image ? (
                                    <img
                                        src={brand.image.startsWith('http') ? brand.image : `/${brand.image}`}
                                        alt={brand.name}
                                        className="h-24 w-24 object-cover rounded-lg mx-auto border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="h-24 w-24 bg-gray-100 rounded-lg mx-auto flex items-center justify-center border-2 border-gray-200">
                                        <TagIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">{brand.name}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                                    isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Statistiques */}
                            <div className="border-t pt-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Statistiques</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">ID de la marque</span>
                                        <span className="text-sm font-medium text-gray-900">#{brand.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Produits associés</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {products ? products.length : 0}
                                        </span>
                                    </div>
                                    {brand.products_count !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Total produits</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {brand.products_count}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions rapides */}
                            <div className="border-t pt-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Actions rapides</h4>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleEdit}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}