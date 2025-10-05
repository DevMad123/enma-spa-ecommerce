import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { HiOutlineArrowLeft, HiOutlineColorSwatch, HiOutlineEye } from 'react-icons/hi';
import clsx from 'clsx';

export default function EditColor({ color, title }) {
    const [colorPreview, setColorPreview] = useState(color.color_code || '#000000');

    const { data, setData, put, processing, errors } = useForm({
        name: color.name || '',
        color_code: color.color_code || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.colors.update', color.id));
    };

    const handleColorCodeChange = (value) => {
        setData('color_code', value);
        setColorPreview(value || '#000000');
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
                                        Modifier la couleur
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Modifier les informations de la couleur "{color.name}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center">
                                <HiOutlineColorSwatch className="h-5 w-5 text-amber-600 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Informations de la couleur
                                </h3>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Informations de base */}
                                <div className="space-y-6">
                                    {/* Nom de la couleur */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom de la couleur <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={clsx(
                                                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors",
                                                errors.name ? "border-red-500" : "border-gray-300"
                                            )}
                                            placeholder="Ex: Rouge, Bleu marine, Vert émeraude..."
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Code couleur */}
                                    <div>
                                        <label htmlFor="color_code" className="block text-sm font-medium text-gray-700 mb-2">
                                            Code couleur (Hex)
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="color"
                                                value={colorPreview}
                                                onChange={(e) => handleColorCodeChange(e.target.value)}
                                                className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
                                                title="Sélectionner une couleur"
                                            />
                                            <input
                                                type="text"
                                                id="color_code"
                                                value={data.color_code}
                                                onChange={(e) => handleColorCodeChange(e.target.value)}
                                                className={clsx(
                                                    "flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors",
                                                    errors.color_code ? "border-red-500" : "border-gray-300"
                                                )}
                                                placeholder="#FF0000"
                                                pattern="^#[0-9A-Fa-f]{6}$"
                                            />
                                        </div>
                                        {errors.color_code && (
                                            <p className="mt-1 text-sm text-red-600">{errors.color_code}</p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Entrez un code couleur hexadécimal valide (ex: #FF0000 pour rouge)
                                        </p>
                                    </div>

                                    {/* Informations supplémentaires */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                                            Informations système
                                        </h4>
                                        <div className="space-y-1 text-sm text-blue-700">
                                            <p><strong>ID:</strong> #{color.id}</p>
                                            <p><strong>Créé le:</strong> {new Date(color.created_at).toLocaleDateString('fr-FR')}</p>
                                            {color.updated_at && (
                                                <p><strong>Modifié le:</strong> {new Date(color.updated_at).toLocaleDateString('fr-FR')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Aperçu */}
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <HiOutlineEye className="h-5 w-5 text-gray-400 mr-2" />
                                            <h4 className="text-lg font-medium text-gray-900">Aperçu</h4>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                            <div className="flex items-center space-x-4">
                                                {/* Aperçu couleur grande */}
                                                <div
                                                    className="w-24 h-24 border-2 border-gray-300 rounded-lg shadow-inner"
                                                    style={{ backgroundColor: colorPreview }}
                                                    title={`Aperçu: ${data.color_code || '#000000'}`}
                                                ></div>

                                                {/* Informations */}
                                                <div className="flex-1">
                                                    <h5 className="text-lg font-medium text-gray-900">
                                                        {data.name || 'Nom de la couleur'}
                                                    </h5>
                                                    <p className="text-sm text-gray-500 font-mono">
                                                        {data.color_code || '#000000'}
                                                    </p>

                                                    {/* Échantillons de taille */}
                                                    <div className="flex items-center space-x-2 mt-3">
                                                        <span className="text-xs text-gray-500">Tailles:</span>
                                                        <div
                                                            className="w-4 h-4 border border-gray-300 rounded-full"
                                                            style={{ backgroundColor: colorPreview }}
                                                        ></div>
                                                        <div
                                                            className="w-6 h-6 border border-gray-300 rounded-full"
                                                            style={{ backgroundColor: colorPreview }}
                                                        ></div>
                                                        <div
                                                            className="w-8 h-8 border border-gray-300 rounded-full"
                                                            style={{ backgroundColor: colorPreview }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comparaison avant/après */}
                                    {color.color_code && color.color_code !== data.color_code && (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                                Comparaison
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Avant</p>
                                                    <div
                                                        className="w-16 h-16 mx-auto border-2 border-gray-300 rounded-lg"
                                                        style={{ backgroundColor: color.color_code }}
                                                    ></div>
                                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                                        {color.color_code}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Après</p>
                                                    <div
                                                        className="w-16 h-16 mx-auto border-2 border-gray-300 rounded-lg"
                                                        style={{ backgroundColor: colorPreview }}
                                                    ></div>
                                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                                        {data.color_code || '#000000'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors font-medium"
                                    disabled={processing}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={clsx(
                                        "px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500",
                                        processing
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
                                    )}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Modification...
                                        </div>
                                    ) : (
                                        'Modifier la couleur'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
