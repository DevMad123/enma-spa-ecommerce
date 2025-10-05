import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    HiOutlineArrowLeft,
    HiOutlineTag,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineCube
} from 'react-icons/hi';
import clsx from 'clsx';

export default function ShowSize({ title, size }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette taille ?')) {
            router.delete(route('admin.sizes.destroy', size.id));
        }
        setShowDeleteModal(false);
    };

    return (
        <AdminLayout>
            <Head title={title} />

            <div className="py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('admin.sizes.index')}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
                                    Retour à la liste
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Détails de la taille
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Informations détaillées sur la taille "{size.size}"
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={route('admin.sizes.edit', size.id)}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <HiOutlinePencil className="w-4 h-4 mr-2" />
                                    Modifier
                                </Link>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <HiOutlineTrash className="w-4 h-4 mr-2" />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Informations principales */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Carte d'informations de la taille */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <HiOutlineTag className="w-5 h-5 mr-2 text-amber-500" />
                                        Informations de la taille
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nom de la taille
                                            </label>
                                            <div className="flex items-center">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {size.size}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Aperçu
                                            </label>
                                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-center h-16">
                                                    <span className="text-xl font-bold text-gray-700">
                                                        {size.size}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Produits utilisant cette taille */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <HiOutlineCube className="w-5 h-5 mr-2 text-blue-500" />
                                        Produits utilisant cette taille
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {size.products_count || 0}
                                        </span>
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {size.products && size.products.length > 0 ? (
                                        <div className="space-y-4">
                                            {size.products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-12 h-12 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                                                                <HiOutlineCube className="w-6 h-6 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">
                                                                {product.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                {product.category?.name} {product.brand?.name && `• ${product.brand.name}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={route('admin.products.show', product.id)}
                                                        className="flex items-center px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                                                    >
                                                        <HiOutlineEye className="w-3 h-3 mr-1" />
                                                        Voir
                                                    </Link>
                                                </div>
                                            ))}
                                            {size.products_count > size.products.length && (
                                                <div className="text-center py-4">
                                                    <p className="text-sm text-gray-500">
                                                        Et {size.products_count - size.products.length} autre(s) produit(s)...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <HiOutlineCube className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                Aucun produit
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Cette taille n'est utilisée par aucun produit pour le moment.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Statistiques */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Statistiques
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Produits utilisant cette taille</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {size.products_count || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Date de création</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(size.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Dernière modification</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(size.updated_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions rapides */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Actions rapides
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <Link
                                        href={route('admin.sizes.edit', size.id)}
                                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <HiOutlinePencil className="w-4 h-4 mr-2" />
                                        Modifier cette taille
                                    </Link>
                                    <Link
                                        href={route('admin.sizes.create')}
                                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <HiOutlineTag className="w-4 h-4 mr-2" />
                                        Créer une nouvelle taille
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <HiOutlineTrash className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Supprimer la taille
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Êtes-vous sûr de vouloir supprimer la taille "{size.size}" ?
                                                {size.products_count > 0 && (
                                                    <>
                                                        <br />
                                                        <strong className="text-red-600">
                                                            Attention : Cette taille est utilisée par {size.products_count} produit(s).
                                                        </strong>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={size.products_count > 0}
                                    className={clsx(
                                        "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                                        size.products_count > 0
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                    )}
                                >
                                    Supprimer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
