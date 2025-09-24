import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FaTruck, FaSave, FaArrowLeft, FaDollarSign, FaClock, FaFileAlt, FaSort, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Edit({ auth, shipping }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: shipping.name || '',
        price: shipping.price || '',
        description: shipping.description || '',
        estimated_days: shipping.estimated_days || '',
        sort_order: shipping.sort_order || '',
        is_active: shipping.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        patch(route('shipping.update', shipping.id), {
            onSuccess: () => {
                toast.success('Méthode de livraison modifiée avec succès');
            },
            onError: () => {
                toast.error('Veuillez corriger les erreurs dans le formulaire');
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('shipping.index')}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                        <FaArrowLeft size={20} />
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Modifier la Méthode de Livraison
                    </h2>
                </div>
            }
        >
            <Head title="Modifier Méthode de Livraison" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaTruck className="text-white text-2xl" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">
                                            Modifier la Méthode de Livraison
                                        </h1>
                                        <p className="text-blue-100 text-sm">
                                            {shipping.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white text-sm opacity-75">ID</div>
                                    <div className="text-white font-bold">#{shipping.id}</div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nom */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaTruck className="text-blue-500" />
                                        Nom de la méthode *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ex: Livraison Standard, Express, Gratuite..."
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <span>⚠️</span>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Prix */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaDollarSign className="text-green-500" />
                                        Prix (€) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <span>⚠️</span>
                                            {errors.price}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Saisissez 0 pour une livraison gratuite
                                    </p>
                                </div>

                                {/* Délai estimé */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaClock className="text-orange-500" />
                                        Délai estimé (jours)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.estimated_days}
                                        onChange={(e) => setData('estimated_days', e.target.value)}
                                        placeholder="Ex: 2, 5, 7..."
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.estimated_days ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.estimated_days && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <span>⚠️</span>
                                            {errors.estimated_days}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Laissez vide si non applicable
                                    </p>
                                </div>

                                {/* Ordre de tri */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaSort className="text-purple-500" />
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)}
                                        placeholder="1, 2, 3..."
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.sort_order ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.sort_order && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <span>⚠️</span>
                                            {errors.sort_order}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Plus le nombre est petit, plus la méthode sera affichée en premier
                                    </p>
                                </div>

                                {/* Statut */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                                        Statut
                                    </label>
                                    <div className="flex items-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            <span className="ml-3 text-sm text-gray-700 flex items-center gap-2">
                                                {data.is_active ? (
                                                    <>
                                                        <FaToggleOn className="text-green-500" />
                                                        Actif
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaToggleOff className="text-red-500" />
                                                        Inactif
                                                    </>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {data.is_active 
                                            ? 'Cette méthode sera proposée aux clients' 
                                            : 'Cette méthode ne sera pas visible pour les clients'
                                        }
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaFileAlt className="text-gray-500" />
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Décrivez cette méthode de livraison (optionnel)..."
                                        rows={4}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                                            errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <span>⚠️</span>
                                            {errors.description}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Maximum 1000 caractères
                                    </p>
                                </div>
                            </div>

                            {/* Statistiques d'utilisation */}
                            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                                    📊 Statistiques d'utilisation
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="bg-white p-3 rounded border">
                                        <div className="text-lg font-bold text-blue-600">{shipping.sells_count || 0}</div>
                                        <div className="text-xs text-gray-600">Commandes</div>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                        <div className="text-lg font-bold text-green-600">
                                            {shipping.formatted_price || '0.00 €'}
                                        </div>
                                        <div className="text-xs text-gray-600">Prix actuel</div>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                        <div className="text-lg font-bold text-orange-600">
                                            {shipping.estimated_days_text || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-600">Délai</div>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                        <div className={`text-lg font-bold ${shipping.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                            {shipping.is_active ? 'Actif' : 'Inactif'}
                                        </div>
                                        <div className="text-xs text-gray-600">Statut</div>
                                    </div>
                                </div>
                            </div>

                            {/* Aperçu */}
                            {data.name && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <span>👁️</span>
                                        Aperçu client :
                                    </h3>
                                    <div className="flex items-center justify-between p-4 bg-white rounded border border-gray-200 shadow-sm">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <FaTruck className="text-blue-500" />
                                                {data.name}
                                            </div>
                                            {data.description && (
                                                <div className="text-sm text-gray-500 mt-1">{data.description}</div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-green-600">
                                                {data.price ? `${parseFloat(data.price || 0).toFixed(2)} €` : 'Gratuit'}
                                            </div>
                                            {data.estimated_days && (
                                                <div className="text-xs text-orange-600 flex items-center gap-1 justify-end mt-1">
                                                    <FaClock />
                                                    {data.estimated_days} jour{data.estimated_days > 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                                <Link
                                    href={route('shipping.index')}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Modification...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Modifier la méthode
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </AuthenticatedLayout>
    );
}