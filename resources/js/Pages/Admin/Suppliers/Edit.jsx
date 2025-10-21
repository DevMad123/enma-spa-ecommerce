import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PhotoIcon,
    XMarkIcon,
    EyeIcon,
    BuildingOfficeIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

export default function EditSupplier({ supplier }) {
    // Normaliser l'URL de l'image existante
    const normalizeImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    };

    const [imagePreview, setImagePreview] = useState(normalizeImageUrl(supplier.image));
    const [imageDeleted, setImageDeleted] = useState(false);

    const { data, setData, processing, errors } = useForm({
        supplier_name: supplier.supplier_name || '',
        company_name: supplier.company_name || '',
        supplier_email: supplier.supplier_email || '',
        company_email: supplier.company_email || '',
        supplier_phone_one: supplier.supplier_phone_one || '',
        supplier_phone_two: supplier.supplier_phone_two || '',
        company_phone: supplier.company_phone || '',
        supplier_address: supplier.supplier_address || '',
        company_address: supplier.company_address || '',
        previous_due: supplier.previous_due || '',
        image: null,
        status: supplier.status === 1 || supplier.status === true || supplier.status === '1',
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
        const fileInput = document.getElementById('image');
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

        console.log('📦 Données envoyées:', Object.fromEntries(formData));

        // Envoyer via router.post pour supporter l'upload de fichiers
        router.post(route('admin.suppliers.update', supplier.id), formData, {
            onStart: () => {
                console.log('🚀 Début de la requête PUT');
            },
            onSuccess: (data) => {
                console.log('✅ Succès:', data);
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                console.log('🏁 Requête terminée');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Modifier ${supplier.supplier_name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.suppliers.index')}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Modifier {supplier.supplier_name}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Modifiez les informations du fournisseur
                            </p>
                        </div>
                    </div>
                    {supplier?.id && (
                        <Link
                            href={route('admin.suppliers.show', supplier.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Voir le profil
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informations du contact */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Informations du contact
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Les informations de la personne de contact chez le fournisseur.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="col-span-6">
                                                <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700">
                                                    Nom du contact *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="supplier_name"
                                                    value={data.supplier_name}
                                                    onChange={(e) => setData('supplier_name', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.supplier_name ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Jean Dupont"
                                                />
                                                {errors.supplier_name && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.supplier_name}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="supplier_email" className="block text-sm font-medium text-gray-700">
                                                    Email du contact *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="supplier_email"
                                                    value={data.supplier_email}
                                                    onChange={(e) => setData('supplier_email', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.supplier_email ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="jean.dupont@entreprise.com"
                                                />
                                                {errors.supplier_email && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.supplier_email}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="supplier_phone_one" className="block text-sm font-medium text-gray-700">
                                                    Téléphone principal *
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="supplier_phone_one"
                                                    value={data.supplier_phone_one}
                                                    onChange={(e) => setData('supplier_phone_one', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.supplier_phone_one ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="06 12 34 56 78"
                                                />
                                                {errors.supplier_phone_one && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.supplier_phone_one}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="supplier_phone_two" className="block text-sm font-medium text-gray-700">
                                                    Téléphone secondaire
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="supplier_phone_two"
                                                    value={data.supplier_phone_two}
                                                    onChange={(e) => setData('supplier_phone_two', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.supplier_phone_two ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="01 23 45 67 89"
                                                />
                                                {errors.supplier_phone_two && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.supplier_phone_two}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="supplier_address" className="block text-sm font-medium text-gray-700">
                                                    Adresse du contact
                                                </label>
                                                <textarea
                                                    id="supplier_address"
                                                    rows="3"
                                                    value={data.supplier_address}
                                                    onChange={(e) => setData('supplier_address', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.supplier_address ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="123 Rue de la Paix, 75001 Paris"
                                                />
                                                {errors.supplier_address && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.supplier_address}</p>
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
                                                        Fournisseur actif
                                                    </label>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Les fournisseurs inactifs ne peuvent pas être utilisés pour les commandes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informations de l'entreprise */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Informations de l'entreprise
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Les informations officielles de l'entreprise fournisseur.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="col-span-6">
                                                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                                                    Nom de l'entreprise
                                                </label>
                                                <input
                                                    type="text"
                                                    id="company_name"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.company_name ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Entreprise SARL"
                                                />
                                                {errors.company_name && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.company_name}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="company_email" className="block text-sm font-medium text-gray-700">
                                                    Email de l'entreprise
                                                </label>
                                                <input
                                                    type="email"
                                                    id="company_email"
                                                    value={data.company_email}
                                                    onChange={(e) => setData('company_email', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.company_email ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="contact@entreprise.com"
                                                />
                                                {errors.company_email && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.company_email}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700">
                                                    Téléphone de l'entreprise
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="company_phone"
                                                    value={data.company_phone}
                                                    onChange={(e) => setData('company_phone', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.company_phone ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="01 23 45 67 89"
                                                />
                                                {errors.company_phone && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.company_phone}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="company_address" className="block text-sm font-medium text-gray-700">
                                                    Adresse de l'entreprise
                                                </label>
                                                <textarea
                                                    id="company_address"
                                                    rows="3"
                                                    value={data.company_address}
                                                    onChange={(e) => setData('company_address', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.company_address ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Adresse du siège social"
                                                />
                                                {errors.company_address && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.company_address}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="previous_due" className="block text-sm font-medium text-gray-700">
                                                    Solde antérieur
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    id="previous_due"
                                                    value={data.previous_due}
                                                    onChange={(e) => setData('previous_due', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.previous_due ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="0.00"
                                                />
                                                {errors.previous_due && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.previous_due}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo du fournisseur */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Logo du fournisseur
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Changez le logo du fournisseur.
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
                                                            </label>
                                                            <p className="pl-1">ou glisser-déposer</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP, AVIF � 2 Mo max</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Input file toujours présent */}
                                            <input
                                                id="image"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.gif,.webp,.avif"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            
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
                                    href={route('admin.suppliers.index')}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Mise à jour...' : 'Mettre à jour'}
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
                                            <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    <h4 className="font-semibold text-gray-900">
                                        {data.supplier_name || 'Nom du fournisseur'}
                                    </h4>
                                    {data.company_name && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.company_name}
                                        </p>
                                    )}
                                    {data.supplier_email && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.supplier_email}
                                        </p>
                                    )}
                                    {data.supplier_phone_one && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.supplier_phone_one}
                                        </p>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                                        data.status 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {data.status ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-center text-xs text-gray-500">
                                        <p>Fournisseur depuis</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(supplier.created_at).toLocaleDateString('fr-FR')}
                                        </p>
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



