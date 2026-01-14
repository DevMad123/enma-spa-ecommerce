import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    MagnifyingGlassIcon,
    HeartIcon,
    UserIcon,
    ShoppingCartIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import MegaMenu from './MegaMenu';

const PremiumHeader = ({
    auth = {},
    appName = 'ENMA SPA',
    appSettings = {},
    customizations = {},
    categories = [],
    cartItemsCount = 0,
    wishlistItemsCount = 0,
    onMobileMenuToggle = () => {},
    navigation = []
}) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [megaMenuOpen, setMegaMenuOpen] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const searchInputRef = useRef(null);

    // Fermer la recherche au clic extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };

        if (searchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Focus automatique sur l'input
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = route('frontend.shop.index', { search: searchQuery });
            setSearchOpen(false);
        }
    };

    const toggleSearch = () => {
        setSearchOpen(!searchOpen);
        if (!searchOpen) {
            setSearchQuery('');
        }
    };

    const themeColor = customizations?.primary_color || '#f59e0b';
    const firstLetter = appName.charAt(0).toUpperCase();

    return (
        <header className="bg-white shadow-lg sticky top-0 z-50">
            {/* Bloc 1 - Top Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href={route('home')} className="flex items-center">
                            {customizations?.logo_image ? (
                                <img 
                                    src={customizations.logo_image} 
                                    alt={appName} 
                                    className="h-8 w-auto max-w-[160px] object-contain" 
                                />
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                        {firstLetter}
                                    </div>
                                    <span 
                                        className="ml-3 text-2xl font-bold" 
                                        style={{ color: themeColor }}
                                    >
                                        {appName}
                                    </span>
                                </>
                            )}
                        </Link>

                        {/* Actions e-commerce */}
                        <div className="flex items-center space-x-6">
                            {/* Search */}
                            <div className="relative">
                                {searchOpen ? (
                                    <div 
                                        ref={searchInputRef}
                                        className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50 md:relative md:inset-auto md:bg-transparent md:pt-0"
                                    >
                                        <form 
                                            onSubmit={handleSearch}
                                            className="w-full max-w-md mx-4 md:mx-0 md:w-80"
                                        >
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Rechercher une marque, un modèle..."
                                                    className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-full shadow-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                                                    autoFocus
                                                />
                                                <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={toggleSearch}
                                                    className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <button
                                        onClick={toggleSearch}
                                        className="p-2 text-gray-600 hover:text-amber-600 transition-all duration-300 hover:bg-gray-50 rounded-full"
                                        aria-label="Rechercher"
                                    >
                                        <MagnifyingGlassIcon className="h-6 w-6" />
                                    </button>
                                )}
                            </div>

                            {/* Wishlist */}
                            <Link
                                href={route('frontend.wishlist.index')}
                                className="relative p-2 text-gray-600 hover:text-amber-600 transition-all duration-300 hover:bg-gray-50 rounded-full"
                                aria-label="Liste de souhaits"
                            >
                                <HeartIcon className="h-6 w-6" />
                                {wishlistItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                                    </span>
                                )}
                            </Link>

                            {/* Account */}
                            <div className="relative group">
                                {auth.user ? (
                                    <div className="relative">
                                        <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-amber-600 transition-all duration-300 hover:bg-gray-50 rounded-full">
                                            <UserIcon className="h-6 w-6" />
                                        </button>
                                        {/* Dropdown Account */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="py-2">
                                                <Link
                                                    href={route('frontend.profile.index')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Mon profil
                                                </Link>
                                                <Link
                                                    href={route('frontend.profile.orders')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Mes commandes
                                                </Link>
                                                <Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Déconnexion
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="p-2 text-gray-600 hover:text-amber-600 transition-all duration-300 hover:bg-gray-50 rounded-full"
                                        aria-label="Se connecter"
                                    >
                                        <UserIcon className="h-6 w-6" />
                                    </Link>
                                )}
                            </div>

                            {/* Cart */}
                            <Link
                                href={route('frontend.cart.index')}
                                className="relative p-2 text-gray-600 hover:text-amber-600 transition-all duration-300 hover:bg-gray-50 rounded-full"
                                aria-label="Panier"
                            >
                                <ShoppingCartIcon className="h-6 w-6" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                onClick={onMobileMenuToggle}
                                className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 md:hidden"
                                aria-label="Menu mobile"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bloc 2 - Menu principal */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-100 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center justify-center h-12">
                        <div className="flex items-center space-x-8">
                            {/* Sneakers avec MegaMenu */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setMegaMenuOpen('sneakers')}
                                onMouseLeave={() => setMegaMenuOpen(null)}
                            >
                                <button className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200">
                                    Sneakers
                                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                                </button>
                                <MegaMenu 
                                    isOpen={megaMenuOpen === 'sneakers'}
                                    type="sneakers"
                                    categories={categories.filter(cat => 
                                        cat.name.toLowerCase().includes('sneaker') || 
                                        cat.name.toLowerCase().includes('basket') ||
                                        cat.name.toLowerCase().includes('chaussure')
                                    )}
                                />
                            </div>

                            {/* Streetwears avec MegaMenu */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setMegaMenuOpen('streetwear')}
                                onMouseLeave={() => setMegaMenuOpen(null)}
                            >
                                <button className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200">
                                    Streetwears
                                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                                </button>
                                <MegaMenu 
                                    isOpen={megaMenuOpen === 'streetwear'}
                                    type="streetwear"
                                    categories={categories.filter(cat => 
                                        cat.name.toLowerCase().includes('streetwear') || 
                                        cat.name.toLowerCase().includes('vêtement') ||
                                        cat.name.toLowerCase().includes('mode')
                                    )}
                                />
                            </div>

                            {/* Livraison en 24h */}
                            <Link
                                href={route('livraison')}
                                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
                            >
                                Livraison en 24h
                            </Link>

                            {/* Le Outline */}
                            <Link
                                href={route('a-propos-de-nous')}
                                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
                            >
                                Le Outline
                            </Link>

                            {/* Autres liens de navigation */}
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default PremiumHeader;