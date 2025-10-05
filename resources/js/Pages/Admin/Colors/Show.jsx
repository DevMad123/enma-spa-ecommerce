import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    HiOutlineArrowLeft,
    HiOutlineColorSwatch,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineCube,
    HiOutlineCalendar,
    HiOutlineHashtag
} from 'react-icons/hi';

export default function ShowColor({ color, title }) {
    const handleEdit = () => {
        router.visit(route('admin.colors.edit', color.id));
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette couleur ?')) {
            router.delete(route('admin.colors.destroy', color.id));
        }
    };

    return (
        <AdminLayout>
            <Head title={title} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('admin.colors.index')}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
                                    Retour à la liste
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Détails de la couleur
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Informations détaillées de la couleur "{color.name}"
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <HiOutlinePencil className="w-4 h-4 mr-2" />
                                    Modifier
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    disabled={color.products_count > 0}
                                    title={color.products_count > 0 ? 'Impossible de supprimer une couleur utilisée par des produits' : 'Supprimer la couleur'}
                                >
                                    <HiOutlineTrash className="w-4 h-4 mr-2" />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Informations principales */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Carte couleur principale */}
                            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center">
                                        <HiOutlineColorSwatch className="h-5 w-5 text-amber-600 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Informations de la couleur</h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Aperçu visuel */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium text-gray-900">Aperçu visuel</h4>
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="w-20 h-20 border-2 border-gray-300 rounded-lg shadow-inner"
                                                    style={{ backgroundColor: color.color_code || '#e5e7eb' }}
                                                    title={color.color_code || 'Pas de code couleur'}
                                                ></div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">{color.name}</p>
                                                    <p className="text-sm text-gray-500 font-mono">
                                                        {color.color_code || 'Aucun code couleur'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Échantillons de différentes tailles */}
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Échantillons</p>
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded-full"
                                                        style={{ backgroundColor: color.color_code || '#e5e7eb' }}
                                                    ></div>
                                                    <div
                                                        className="w-6 h-6 border border-gray-300 rounded-full"
                                                        style={{ backgroundColor: color.color_code || '#e5e7eb' }}
                                                    ></div>
                                                    <div
                                                        className="w-8 h-8 border border-gray-300 rounded-full"
                                                        style={{ backgroundColor: color.color_code || '#e5e7eb' }}
                                                    ></div>
                                                    <div
                                                        className="w-12 h-12 border border-gray-300 rounded-lg"
                                                        style={{ backgroundColor: color.color_code || '#e5e7eb' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informations techniques */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium text-gray-900">Informations techniques</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <HiOutlineHashtag className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-600">ID: #{color.id}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <HiOutlineCube className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-600">
                                                        {color.products_count || 0} produit{(color.products_count || 0) > 1 ? 's' : ''} utilise{(color.products_count || 0) > 1 ? 'nt' : ''} cette couleur
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <HiOutlineCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-600">
                                                        Créé le {new Date(color.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                                {color.updated_at && (
                                                    <div className="flex items-center">
                                                        <HiOutlineCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-600">
                                                            Modifié le {new Date(color.updated_at).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Produits utilisant cette couleur */}
                            {color.products && color.products.length > 0 && (
                                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <HiOutlineCube className="h-5 w-5 text-amber-600 mr-2" />
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    Produits utilisant cette couleur ({color.products.length})
                                                </h3>
                                            </div>
                                            {color.products_count > color.products.length && (
                                                <Link
                                                    href={route('admin.products.index', { color_filter: color.id })}
                                                    className="text-sm text-amber-600 hover:text-amber-700"
                                                >
                                                    Voir tous ({color.products_count})
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {color.products.map((product) => (
                                                <div key={product.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        {product.image ? (
                                                            <img
                                                                className="h-12 w-12 rounded-lg object-cover"
                                                                src={product.image?.startsWith('http') ? product.image : `/${product.image}`}
                                                                alt={product.name}
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <HiOutlineCube className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.category?.name} - {product.brand?.brand_name}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={route('admin.products.show', product.id)}
                                                        className="ml-4 flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                                    >
                                                        <HiOutlineEye className="w-4 h-4 mr-1" />
                                                        Voir
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar avec actions rapides */}
                        <div className="space-y-6">
                            {/* Actions rapides */}
                            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <button
                                        onClick={handleEdit}
                                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <HiOutlinePencil className="w-4 h-4 mr-2" />
                                        Modifier cette couleur
                                    </button>

                                    <Link
                                        href={route('admin.colors.create')}
                                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <HiOutlineColorSwatch className="w-4 h-4 mr-2" />
                                        Créer une nouvelle couleur
                                    </Link>

                                    <Link
                                        href={route('admin.colors.index')}
                                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
                                        Retour à la liste
                                    </Link>
                                </div>
                            </div>

                            {/* Statistiques */}
                            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-medium text-gray-900">Statistiques</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Produits associés</span>
                                            <span className="text-sm font-semibold text-gray-900">{color.products_count || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Statut</span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                color.products_count > 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {color.products_count > 0 ? 'Utilisée' : 'Non utilisée'}
                                            </span>
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
