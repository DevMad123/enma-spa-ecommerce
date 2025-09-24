import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { FaEdit, FaTrash, FaPlus, FaToggleOn, FaToggleOff, FaSort, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ShippingList = ({ shippings, filters }) => {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'sort_order');
    const [sortDir, setSortDir] = useState(filters?.sort_dir || 'asc');
    const [isLoading, setIsLoading] = useState(false);

    // Fonction de recherche avec debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters?.search) {
                handleFilter();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilter = () => {
        const params = {
            search: searchTerm,
            status: statusFilter,
            sort_by: sortBy,
            sort_dir: sortDir
        };

        // Supprimer les paramètres vides
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });

        router.get(route('admin.shippings.index'), params, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSort = (column) => {
        const newSortDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newSortDir);
        
        router.get(route('admin.shippings.index'), {
            search: searchTerm,
            status: statusFilter,
            sort_by: column,
            sort_dir: newSortDir
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const toggleStatus = async (shippingId) => {
        setIsLoading(true);
        try {
            await router.patch(route('admin.shippings.toggle', shippingId), {}, {
                onSuccess: () => {
                    toast.success('Statut mis à jour avec succès');
                },
                onError: () => {
                    toast.error('Erreur lors de la mise à jour');
                }
            });
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteShipping = (shippingId, shippingName) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la méthode de livraison "${shippingName}" ?`)) {
            router.delete(route('admin.shippings.destroy', shippingId), {
                onSuccess: () => {
                    toast.success('Méthode de livraison supprimée');
                },
                onError: () => {
                    toast.error('Erreur lors de la suppression');
                }
            });
        }
    };

    const getSortIcon = (column) => {
        if (sortBy !== column) return <FaSort className="ml-1 text-gray-400" />;
        return sortDir === 'asc' ? 
            <FaSort className="ml-1 text-blue-500 transform rotate-180" /> : 
            <FaSort className="ml-1 text-blue-500" />;
    };

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header avec filtres */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">
                        Méthodes de Livraison
                    </h2>
                    <Link
                        href={route('admin.shippings.create')}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center gap-2 font-medium"
                    >
                        <FaPlus /> Nouvelle Méthode
                    </Link>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex flex-wrap gap-4">
                    {/* Recherche */}
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filtre par statut */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setTimeout(handleFilter, 100);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                    </select>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('sort_order')}
                            >
                                <div className="flex items-center">
                                    Ordre
                                    {getSortIcon('sort_order')}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">
                                    Nom
                                    {getSortIcon('name')}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('price')}
                            >
                                <div className="flex items-center">
                                    Prix
                                    {getSortIcon('price')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Délai Estimé
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Utilisations
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {shippings?.data?.length > 0 ? (
                            shippings.data.map((shipping) => (
                                <tr key={shipping.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            #{shipping.sort_order}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{shipping.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-green-600">
                                            {shipping.formatted_price}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {shipping.estimated_days ? (
                                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                                {shipping.estimated_days_text}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Non spécifié</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="max-w-xs truncate" title={shipping.description}>
                                            {shipping.description || 'Aucune description'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleStatus(shipping.id)}
                                            disabled={isLoading}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                                                shipping.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {shipping.is_active ? (
                                                <>
                                                    <FaToggleOn className="text-green-600" />
                                                    Actif
                                                </>
                                            ) : (
                                                <>
                                                    <FaToggleOff className="text-red-600" />
                                                    Inactif
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            {shipping.sells_count || 0} commande(s)
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={route('admin.shippings.edit', shipping.id)}
                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                                title="Modifier"
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button
                                                onClick={() => deleteShipping(shipping.id, shipping.name)}
                                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                                title="Supprimer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="text-6xl mb-4">📦</div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Aucune méthode de livraison
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Commencez par créer votre première méthode de livraison.
                                        </p>
                                        <Link
                                            href={route('admin.shippings.create')}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <FaPlus /> Créer une méthode
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {shippings?.links && shippings.links.length > 3 && (
                <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Affichage de {shippings.from} à {shippings.to} sur {shippings.total} résultats
                        </div>
                        <div className="flex gap-2">
                            {shippings.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (link.url) {
                                            router.get(link.url, {}, {
                                                preserveState: true,
                                                preserveScroll: true
                                            });
                                        }
                                    }}
                                    disabled={!link.url}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
    );
};

export default ShippingList;