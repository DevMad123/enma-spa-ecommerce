import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    HiOutlineSearch, 
    HiOutlineFilter,
    HiOutlineX,
    HiOutlineRefresh
} from 'react-icons/hi';

export default function TaxRulesFilter({ filters = {}, onFilterChange }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status: filters.status || '',
        delivery: filters.delivery || '',
        is_default: filters.is_default || '',
        sort_by: filters.sort_by || 'country_name',
        sort_order: filters.sort_order || 'asc'
    });

    const handleInputChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        // Débounce pour la recherche
        if (key === 'search') {
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
                applyFilters(newFilters);
            }, 500);
        } else {
            applyFilters(newFilters);
        }
    };

    const applyFilters = (filters) => {
        // Nettoyer les filtres vides
        const cleanedFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
        );
        
        router.get(route('admin.tax-rules.index'), cleanedFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const clearFilters = () => {
        const emptyFilters = {
            search: '',
            status: '',
            delivery: '',
            is_default: '',
            sort_by: 'country_name',
            sort_order: 'asc'
        };
        setLocalFilters(emptyFilters);
        applyFilters({});
    };

    const hasActiveFilters = Object.values(localFilters).some(value => 
        value !== '' && value !== 'country_name' && value !== 'asc'
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4">
                {/* Recherche principale */}
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par nom de pays ou code..."
                            value={localFilters.search}
                            onChange={(e) => handleInputChange('search', e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            showAdvanced 
                                ? 'border-green-500 text-green-700 bg-green-50' 
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                    >
                        <HiOutlineFilter className="h-4 w-4 mr-2" />
                        Filtres avancés
                    </button>
                    
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <HiOutlineX className="h-4 w-4 mr-2" />
                            Effacer
                        </button>
                    )}
                </div>

                {/* Filtres avancés */}
                {showAdvanced && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Statut */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Statut
                                </label>
                                <select
                                    value={localFilters.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="active">Actif</option>
                                    <option value="inactive">Inactif</option>
                                </select>
                            </div>

                            {/* Livraison */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Livraison
                                </label>
                                <select
                                    value={localFilters.delivery}
                                    onChange={(e) => handleInputChange('delivery', e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Toutes les options</option>
                                    <option value="allowed">Autorisée</option>
                                    <option value="not_allowed">Interdite</option>
                                </select>
                            </div>

                            {/* Pays par défaut */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    value={localFilters.is_default}
                                    onChange={(e) => handleInputChange('is_default', e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Tous les types</option>
                                    <option value="default">Pays par défaut</option>
                                    <option value="not_default">Pays standard</option>
                                </select>
                            </div>

                            {/* Tri */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trier par
                                </label>
                                <div className="flex space-x-2">
                                    <select
                                        value={localFilters.sort_by}
                                        onChange={(e) => handleInputChange('sort_by', e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="country_name">Nom du pays</option>
                                        <option value="country_code">Code pays</option>
                                        <option value="tax_rate">Taux TVA</option>
                                        <option value="min_order_amount">Montant min</option>
                                        <option value="created_at">Date création</option>
                                    </select>
                                    <button
                                        onClick={() => handleInputChange('sort_order', localFilters.sort_order === 'asc' ? 'desc' : 'asc')}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                                        title={`Tri ${localFilters.sort_order === 'asc' ? 'croissant' : 'décroissant'}`}
                                    >
                                        {localFilters.sort_order === 'asc' ? '↑' : '↓'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                                {hasActiveFilters && (
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Filtres actifs
                                    </span>
                                )}
                            </div>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                <HiOutlineRefresh className="h-4 w-4 mr-1" />
                                Actualiser
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}