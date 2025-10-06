import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon, 
    BuildingOfficeIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    PhotoIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function CreateSupplier({ title }) {
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        supplier_name: '',
        company_name: '',
        supplier_email: '',
        company_email: '',
        supplier_phone_one: '',
        supplier_phone_two: '',
        company_phone: '',
        supplier_address: '',
        company_address: '',
        previous_due: '',
        status: 1,
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Préparer FormData pour l'upload de fichiers (comme les produits)
        const formData = new FormData();
        
        // Ajouter tous les champs du formulaire
        Object.keys(data).forEach(key => {
            if (key === 'image' && data[key]) {
                formData.append(key, data[key]);
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        // Envoyer via router.post avec FormData (comme les produits)
        router.post(route('admin.suppliers.store'), formData, {
            onStart: () => {
                console.log('🚀 Début de la création du fournisseur');
            },
            onSuccess: (data) => {
                console.log('✅ Fournisseur créé avec succès');
            },
            onError: (errors) => {
                console.error('❌ Erreurs lors de la création:', errors);
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    return (
        <AdminLayout>
            <Head title={title} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.suppliers.index')}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Créer un fournisseur</h1>
                            <p className="text-sm text-gray-500">Ajouter un nouveau fournisseur au système</p>
                        </div>
                    </div>
                </div>

                {/* Formulaire */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Image du fournisseur */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                                <PhotoIcon className="w-4 h-4 mr-2" />
                                Logo du fournisseur
                            </label>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Aperçu"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <PhotoIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        PNG, JPG, GIF jusqu'à 2MB
                                    </p>
                                    {errors.image && (
                                        <p className="text-sm text-red-600 mt-1">{errors.image}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informations personnelles */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <h3 className="flex items-center text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                    <UserIcon className="w-5 h-5 mr-2" />
                                    Informations du contact
                                </h3>

                                <div>
                                    <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom du contact *
                                    </label>
                                    <input
                                        type="text"
                                        id="supplier_name"
                                        value={data.supplier_name}
                                        onChange={(e) => setData('supplier_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nom de la personne de contact"
                                    />
                                    {errors.supplier_name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.supplier_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="supplier_email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email du contact
                                    </label>
                                    <input
                                        type="email"
                                        id="supplier_email"
                                        value={data.supplier_email}
                                        onChange={(e) => setData('supplier_email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="contact@example.com"
                                    />
                                    {errors.supplier_email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.supplier_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="supplier_phone_one" className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone principal *
                                    </label>
                                    <input
                                        type="text"
                                        id="supplier_phone_one"
                                        value={data.supplier_phone_one}
                                        onChange={(e) => setData('supplier_phone_one', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+33 1 23 45 67 89"
                                    />
                                    {errors.supplier_phone_one && (
                                        <p className="text-sm text-red-600 mt-1">{errors.supplier_phone_one}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="supplier_phone_two" className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone secondaire
                                    </label>
                                    <input
                                        type="text"
                                        id="supplier_phone_two"
                                        value={data.supplier_phone_two}
                                        onChange={(e) => setData('supplier_phone_two', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+33 6 12 34 56 78"
                                    />
                                    {errors.supplier_phone_two && (
                                        <p className="text-sm text-red-600 mt-1">{errors.supplier_phone_two}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="supplier_address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse personnelle
                                    </label>
                                    <textarea
                                        id="supplier_address"
                                        value={data.supplier_address}
                                        onChange={(e) => setData('supplier_address', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Adresse personnelle du contact"
                                    />
                                    {errors.supplier_address && (
                                        <p className="text-sm text-red-600 mt-1">{errors.supplier_address}</p>
                                    )}
                                </div>
                            </div>

                            {/* Informations de l'entreprise */}
                            <div className="space-y-6">
                                <h3 className="flex items-center text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                                    Informations de l'entreprise
                                </h3>

                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nom de l'entreprise"
                                    />
                                    {errors.company_name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.company_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email de l'entreprise
                                    </label>
                                    <input
                                        type="email"
                                        id="company_email"
                                        value={data.company_email}
                                        onChange={(e) => setData('company_email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="info@entreprise.com"
                                    />
                                    {errors.company_email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.company_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone de l'entreprise
                                    </label>
                                    <input
                                        type="text"
                                        id="company_phone"
                                        value={data.company_phone}
                                        onChange={(e) => setData('company_phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+33 1 23 45 67 89"
                                    />
                                    {errors.company_phone && (
                                        <p className="text-sm text-red-600 mt-1">{errors.company_phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse de l'entreprise
                                    </label>
                                    <textarea
                                        id="company_address"
                                        value={data.company_address}
                                        onChange={(e) => setData('company_address', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Adresse complète de l'entreprise"
                                    />
                                    {errors.company_address && (
                                        <p className="text-sm text-red-600 mt-1">{errors.company_address}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="previous_due" className="block text-sm font-medium text-gray-700 mb-2">
                                        <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                                        Solde précédent
                                    </label>
                                    <input
                                        type="number"
                                        id="previous_due"
                                        step="0.01"
                                        min="0"
                                        value={data.previous_due}
                                        onChange={(e) => setData('previous_due', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                    {errors.previous_due && (
                                        <p className="text-sm text-red-600 mt-1">{errors.previous_due}</p>
                                    )}
                                </div>

                                {/* Statut */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={1}>Actif</option>
                                        <option value={0}>Inactif</option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href={route('admin.suppliers.index')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Création...' : 'Créer le fournisseur'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}