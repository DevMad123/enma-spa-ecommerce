import React, { useState, useEffect, useRef } from 'react';
import { 
    XMarkIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

/**
 * MobileSearchOverlay - Overlay de recherche plein écran pour mobile
 * 
 * Fonctionnalités :
 * - Overlay plein écran
 * - Auto-focus sur l'input
 * - Historique des recherches (localStorage)
 * - Suggestions populaires
 * - Animation fluide
 * - Body scroll lock
 */

const MobileSearchOverlay = ({ 
    isOpen, 
    onClose 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const searchInputRef = useRef(null);

    // Suggestions populaires (à personnaliser selon votre catalogue)
    const popularSearches = [
        'Sneakers',
        'T-shirts',
        'Accessoires',
        'Nouveautés',
        'Promotions'
    ];

    // Charger l'historique depuis localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            try {
                setSearchHistory(JSON.parse(savedHistory));
            } catch (e) {
                setSearchHistory([]);
            }
        }
    }, []);

    // Gestion du body scroll lock et auto-focus
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // Auto-focus avec délai pour l'animation
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 150);
        } else {
            document.body.style.overflow = '';
            setSearchQuery('');
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Sauvegarder une recherche dans l'historique
    const saveToHistory = (query) => {
        if (!query.trim()) return;

        const newHistory = [
            query,
            ...searchHistory.filter(item => item !== query)
        ].slice(0, 5); // Garder seulement les 5 dernières

        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    // Supprimer un élément de l'historique
    const removeFromHistory = (query) => {
        const newHistory = searchHistory.filter(item => item !== query);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    // Effacer tout l'historique
    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    // Soumettre la recherche
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            saveToHistory(searchQuery.trim());
            window.location.href = route('frontend.shop.index', { search: searchQuery.trim() });
        }
    };

    // Rechercher un terme depuis l'historique ou les suggestions
    const searchTerm = (term) => {
        saveToHistory(term);
        window.location.href = route('frontend.shop.index', { search: term });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] md:hidden">
            {/* Overlay avec animation */}
            <div 
                className={`absolute inset-0 bg-white transform transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                }`}
            >
                {/* Header avec barre de recherche */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Bouton retour */}
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2"
                            aria-label="Fermer la recherche"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-900" />
                        </button>

                        {/* Barre de recherche */}
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un produit..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        aria-label="Effacer"
                                    >
                                        <XCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Contenu scrollable */}
                <div className="overflow-y-auto h-[calc(100vh-68px)] px-4 py-6">
                    {/* Historique des recherches */}
                    {searchHistory.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                    Recherches récentes
                                </h3>
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    Effacer tout
                                </button>
                            </div>
                            <div className="space-y-2">
                                {searchHistory.map((term, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <button
                                            onClick={() => searchTerm(term)}
                                            className="flex items-center gap-3 flex-1 text-left"
                                        >
                                            <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-900">{term}</span>
                                        </button>
                                        <button
                                            onClick={() => removeFromHistory(term)}
                                            className="p-1"
                                            aria-label="Supprimer"
                                        >
                                            <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recherches populaires */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                            Recherches populaires
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {popularSearches.map((term, index) => (
                                <button
                                    key={index}
                                    onClick={() => searchTerm(term)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-amber-500 hover:text-amber-600 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message d'aide */}
                    <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                        <p className="text-xs text-gray-600 leading-relaxed">
                            💡 <strong>Astuce :</strong> Utilisez des mots-clés précis pour trouver rapidement ce que vous cherchez. 
                            Vous pouvez rechercher par nom de produit, marque, catégorie ou référence.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileSearchOverlay;
