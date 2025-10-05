import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { HiOutlineArrowLeft, HiOutlineTag } from 'react-icons/hi';
import clsx from 'clsx';

export default function EditSize({ title, size }) {
    const { data, setData, put, processing, errors } = useForm({
        size: size.size || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.sizes.update', size.id));
    };

    return (
        <AdminLayout>
            <Head title={title} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Modifier la taille
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Modifiez les informations de la taille "{size.size}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire principal */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <HiOutlineTag className="w-5 h-5 mr-2 text-amber-500" />
                                Informations de la taille
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Champ Taille */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-1">
                                    <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom de la taille *
                                    </label>
                                    <input
                                        type="text"
                                        id="size"
                                        value={data.size}
                                        onChange={(e) => setData('size', e.target.value)}
                                        className={clsx(
                                            "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors",
                                            errors.size
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                        placeholder="Ex: XS, S, M, L, XL, XXL, 38, 40, 42..."
                                        required
                                    />
                                    {errors.size && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            {errors.size}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500">
                                        Entrez la taille (lettres, chiffres ou combinaison)
                                    </p>
                                </div>

                                {/* Aperçu de la taille */}
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Aperçu
                                    </label>
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-center h-20">
                                            <span className="text-2xl font-bold text-gray-700">
                                                {data.size || 'Aperçu'}
                                            </span>
                                        </div>
                                        <p className="text-center text-xs text-gray-500 mt-2">
                                            Aperçu de l'affichage de la taille
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Informations sur l'utilisation */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">
                                    📊 Utilisation de cette taille
                                </h3>
                                <p className="text-sm text-blue-800">
                                    Cette taille est actuellement utilisée par{' '}
                                    <strong>{size.products_count || 0}</strong> produit(s).
                                </p>
                                {size.products_count > 0 && (
                                    <p className="text-xs text-blue-700 mt-1">
                                        La modification affectera tous les produits utilisant cette taille.
                                    </p>
                                )}
                            </div>

                            {/* Exemples de tailles */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-yellow-900 mb-2">
                                    💡 Exemples de tailles courantes
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <strong className="text-yellow-800">Vêtements:</strong>
                                        <br />XS, S, M, L, XL, XXL
                                    </div>
                                    <div>
                                        <strong className="text-yellow-800">Chaussures (EU):</strong>
                                        <br />36, 37, 38, 39, 40, 41, 42
                                    </div>
                                    <div>
                                        <strong className="text-yellow-800">Pantalons:</strong>
                                        <br />28, 30, 32, 34, 36, 38
                                    </div>
                                    <div>
                                        <strong className="text-yellow-800">Personnalisé:</strong>
                                        <br />Unique, Standard, Grand
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={clsx(
                                        "px-6 py-3 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors",
                                        processing
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-amber-600 hover:bg-amber-700"
                                    )}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Modification...
                                        </div>
                                    ) : (
                                        'Sauvegarder les modifications'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Avertissement */}
                    {size.products_count > 0 && (
                        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-orange-800 mb-2">
                                ⚠️ Attention
                            </h3>
                            <p className="text-xs text-orange-700">
                                Cette taille est utilisée par {size.products_count} produit(s).
                                Toute modification sera appliquée à tous ces produits.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
