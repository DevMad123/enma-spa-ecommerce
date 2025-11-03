import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PhotoIcon,
    XMarkIcon,
    EyeIcon,
    UserIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function EditCustomer({ customer }) {
    // Normaliser l'URL de l'image existante
    const normalizeImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    };

    const [imagePreview, setImagePreview] = useState(normalizeImageUrl(customer.image));
    const [imageDeleted, setImageDeleted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, processing, errors } = useForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone_one: customer.phone_one || '',
        phone_two: customer.phone_two || '',
        present_address: customer.present_address || '',
        permanent_address: customer.permanent_address || '',
        password: '',
        password_confirmation: '',
        image: null,
        status: customer.status === 1 || customer.status === true || customer.status === '1',
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

        if (import.meta.env.DEV) console.log('📦 Données envoyées:', Object.fromEntries(formData));

        // Envoyer via router.post pour supporter l'upload de fichiers
        router.post(route('admin.customers.update', customer.id), formData, {
            onStart: () => {
                if (import.meta.env.DEV) console.log('🚀 Début de la requête PUT');
            },
            onSuccess: (data) => {
                if (import.meta.env.DEV) console.log('✅ Succès:', data);
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                if (import.meta.env.DEV) console.log('🏁 Requête terminée');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Modifier ${customer.first_name} ${customer.last_name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.customers.index')}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Modifier {customer.first_name} {customer.last_name}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Modifiez les informations du client
                            </p>
                        </div>
                    </div>
                    {customer?.id && (
                        <Link
                            href={route('admin.customers.show', customer.id)}
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
                            {/* Informations personnelles */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Informations personnelles
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Les informations de base du client.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                                    Prénom *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="first_name"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.first_name ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Jean"
                                                />
                                                {errors.first_name && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                                    Nom *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="last_name"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.last_name ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Dupont"
                                                />
                                                {errors.last_name && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.email ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="jean.dupont@example.com"
                                                />
                                                {errors.email && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="phone_one" className="block text-sm font-medium text-gray-700">
                                                    Téléphone principal *
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone_one"
                                                    value={data.phone_one}
                                                    onChange={(e) => setData('phone_one', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.phone_one ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="06 12 34 56 78"
                                                />
                                                {errors.phone_one && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.phone_one}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="phone_two" className="block text-sm font-medium text-gray-700">
                                                    Téléphone secondaire
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone_two"
                                                    value={data.phone_two}
                                                    onChange={(e) => setData('phone_two', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.phone_two ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="01 23 45 67 89"
                                                />
                                                {errors.phone_two && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.phone_two}</p>
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
                                                        Client actif
                                                    </label>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Les clients inactifs ne peuvent pas se connecter.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Adresses */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Adresses
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Les adresses de livraison et facturation.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="col-span-6">
                                                <label htmlFor="present_address" className="block text-sm font-medium text-gray-700">
                                                    Adresse actuelle *
                                                </label>
                                                <textarea
                                                    id="present_address"
                                                    rows="3"
                                                    value={data.present_address}
                                                    onChange={(e) => setData('present_address', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.present_address ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="123 Rue de la Paix, 75001 Paris"
                                                />
                                                {errors.present_address && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.present_address}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6">
                                                <label htmlFor="permanent_address" className="block text-sm font-medium text-gray-700">
                                                    Adresse permanente
                                                </label>
                                                <textarea
                                                    id="permanent_address"
                                                    rows="3"
                                                    value={data.permanent_address}
                                                    onChange={(e) => setData('permanent_address', e.target.value)}
                                                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                        errors.permanent_address ? 'border-red-300' : ''
                                                    }`}
                                                    placeholder="Si différente de l'adresse actuelle"
                                                />
                                                {errors.permanent_address && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.permanent_address}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mot de passe */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Mot de passe
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Laissez vide pour conserver le mot de passe actuel.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                    Nouveau mot de passe
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        id="password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                            errors.password ? 'border-red-300' : ''
                                                        }`}
                                                        placeholder="Minimum 8 caractères"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                                )}
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                                    Confirmer le nouveau mot de passe
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type={showPasswordConfirm ? "text" : "password"}
                                                        id="password_confirmation"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                                            errors.password_confirmation ? 'border-red-300' : ''
                                                        }`}
                                                        placeholder="Répéter le nouveau mot de passe"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                    >
                                                        {showPasswordConfirm ? (
                                                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.password_confirmation && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Photo du client */}
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Photo de profil
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Changez la photo du client.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="space-y-4">
                                            {imagePreview ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Aperçu"
                                                        className="h-32 w-32 object-cover rounded-full border-2 border-gray-300"
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
                                                                <span>Télécharger une photo</span>
                                                            </label>
                                                            <p className="pl-1">ou glisser-déposer</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP, AVIF — 2 Mo max </p>
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
                                    href={route('admin.customers.index')}
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
                                            alt="Photo"
                                            className="h-20 w-20 object-cover rounded-full mx-auto border"
                                        />
                                    </div>
                                )}
                                
                                {!imagePreview && (
                                    <div className="text-center">
                                        <div className="h-20 w-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                                            <UserIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    <h4 className="font-semibold text-gray-900">
                                        {data.first_name || data.last_name ? 
                                            `${data.first_name} ${data.last_name}`.trim() : 
                                            'Nom du client'
                                        }
                                    </h4>
                                    {data.email && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.email}
                                        </p>
                                    )}
                                    {data.phone_one && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.phone_one}
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
                                        <p>Client depuis</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(customer.created_at).toLocaleDateString('fr-FR')}
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


