import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    PlusIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    TruckIcon,
    CheckIcon,
    XMarkIcon,
    ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

export default function ShippingList({ 
    shippings, 
    stats, 
    filters,
    flash 
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [shippingToDelete, setShippingToDelete] = useState(null);

    const handleFilterChange = (filterName, value) => {
        const updatedFilters = { ...filters, [filterName]: value };
        
        // Reset to first page when filters change
        delete updatedFilters.page;
        
        router.get(route('admin.shippings.index'), updatedFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const search = e.target.search.value;
        handleFilterChange('search', search);
    };

    const clearFilters = () => {
        router.get(route('admin.shippings.index'));
    };

    const confirmDelete = (shipping) => {
        setShippingToDelete(shipping);
    };

    const deleteShipping = () => {
        if (shippingToDelete) {
            router.delete(route('admin.shippings.destroy', shippingToDelete.id), {
                onSuccess: () => {
                    setShippingToDelete(null);
                }
            });
        }
    };

    const toggleStatus = (shipping) => {
        router.patch(route('admin.shippings.toggle', shipping.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (isActive) => {
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {isActive ? 'Actif' : 'Inactif'}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title="Modes de livraison" />

            <div className="mb-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Modes de livraison</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez les différents modes de livraison disponibles
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex-none">
                        <Link
                            href={route('admin.shippings.create')}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau mode de livraison
                        </Link>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-700">{flash.success}</div>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{flash.error}</div>
                    </div>
                )}
            </div>

            {/* Statistiques */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TruckIcon className="h-8 w-8 text-indigo-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total modes</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats?.total || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckIcon className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Actifs</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats?.active || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XMarkIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Inactifs</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats?.inactive || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={filters?.search}
                                    placeholder="Rechercher par nom..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <FunnelIcon className="h-4 w-4 mr-2" />
                            Filtres
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Rechercher
                        </button>
                    </form>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        value={filters?.status ?? ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tous les statuts</option>
                                        <option value="1">Actif</option>
                                        <option value="0">Inactif</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Effacer les filtres
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tableau des modes de livraison */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center space-x-1">
                                        <span>Ordre</span>
                                        <ArrowsUpDownIcon className="h-4 w-4" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mode de livraison
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prix
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Délai
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Commandes
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shippings?.data && shippings.data.length > 0 ? (
                                shippings.data.map((shipping) => (
                                    <tr key={shipping.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{shipping.sort_order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {shipping.name}
                                                </div>
                                                {shipping.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {shipping.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {shipping.price == 0 ? (
                                                    <span className="text-green-600 font-semibold">Gratuit</span>
                                                ) : (
                                                    `${new Intl.NumberFormat('fr-FR').format(shipping.price)} XOF`
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shipping.estimated_days 
                                                ? `${shipping.estimated_days} jour${shipping.estimated_days > 1 ? 's' : ''}`
                                                : 'Non défini'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleStatus(shipping)}
                                                className="focus:outline-none"
                                            >
                                                {getStatusBadge(shipping.is_active)}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shipping.sells_count || 0} commande{(shipping.sells_count || 0) > 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={route('admin.shippings.show', shipping.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Voir les détails"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                
                                                <Link
                                                    href={route('admin.shippings.edit', shipping.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Modifier"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                
                                                {(!shipping.sells_count || shipping.sells_count === 0) && (
                                                    <button
                                                        onClick={() => confirmDelete(shipping)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Aucun mode de livraison trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {shippings?.links && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{shippings.from}</span> à{' '}
                                <span className="font-medium">{shippings.to}</span> sur{' '}
                                <span className="font-medium">{shippings.total}</span> résultats
                            </div>
                            <div className="flex space-x-2">
                                {shippings.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            {shippingToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">
                                Supprimer le mode de livraison
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Êtes-vous sûr de vouloir supprimer "{shippingToDelete.name}" ? 
                                    Cette action ne peut pas être annulée.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    onClick={() => setShippingToDelete(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={deleteShipping}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}