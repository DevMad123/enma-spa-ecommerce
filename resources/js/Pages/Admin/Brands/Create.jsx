import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PhotoIcon,
    XMarkIcon,
    EyeIcon,
    TagIcon
} from '@heroicons/react/24/outline';

export default function CreateBrand() {
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        description: '',
        image: null,
        status: true,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            
            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        document.getElementById('image').value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('status', data.status ? '1' : '0');
        
        if (data.image) {
            formData.append('image', data.image);
        }

        post(route('admin.brands.store'), {
            data: formData,
            onError: (errors) => {
                setErrors(errors);
            },
            onSuccess: () => {
                reset();
                setImagePreview(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Nouvelle marque" />
            
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
                            <h1 className="text-3xl font-bold text-gray-900">Nouvelle marque</h1>
                            <p className="mt-2 text-gray-600">
                                Ajoutez une nouvelle marque à votre catalogue
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Informations générales
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Les informations de base de la marque.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="col-span-6">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                    Nom de la marque *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.name ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Ex: Apple, Samsung, Nike..."
                                                />
                                                {errors.name && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    rows="4"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.description ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Description de la marque (optionnel)..."
                                                />
                                                {errors.description && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <div className="flex items-center">
                                                    <input
                                                        id="status"
                                                        type="checkbox"
                                                        checked={data.status}
                                                        onChange={(e) => setData('status', e.target.checked)}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                                                        Marque active
                                                    </label>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Les marques inactives ne seront pas visibles sur le site.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo de la marque */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Logo de la marque
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Ajoutez un logo pour représenter la marque.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="space-y-4">
                                            {imagePreview ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Aperçu"
                                                        className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                    <div className="space-y-1 text-center">
                                                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                        <div className="flex text-sm text-gray-600">
                                                            <label
                                                                htmlFor="image"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                            >
                                                                <span>Télécharger un logo</span>
                                                                <input
                                                                    id="image"
                                                                    type="file"
                                                                    className="sr-only"
                                                                    accept="image/*"
                                                                    onChange={handleImageChange}
                                                                />
                                                            </label>
                                                            <p className="pl-1">ou glisser-déposer</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG, WEBP jusqu'à 2MB</p>
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
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('admin.brands.index')}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Création...' : 'Créer la marque'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Aperçu */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu</h3>
                            <div className="space-y-4">
                                {imagePreview && (
                                    <div className="text-center">
                                        <img
                                            src={imagePreview}
                                            alt="Logo"
                                            className="h-20 w-20 object-cover rounded-lg mx-auto border"
                                        />
                                    </div>
                                )}
                                
                                {!imagePreview && (
                                    <div className="text-center">
                                        <div className="h-20 w-20 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                                            <TagIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    <h4 className="font-semibold text-gray-900">
                                        {data.name || 'Nom de la marque'}
                                    </h4>
                                    {data.description && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.description}
                                        </p>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
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
                </div>
            </div>
        </AdminLayout>
    );
}