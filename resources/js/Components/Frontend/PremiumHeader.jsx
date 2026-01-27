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
import MegaMenuFenomenal, { MegaMenuFenomenalMobile } from './MegaMenuNew';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const searchInputRef = useRef(null);
    const megaMenuRef = useRef(null);
    const megaMenuTimeoutRef = useRef(null);

    // Fonction pour ouvrir le MegaMenu
    const openMegaMenu = (menuType) => {
        if (megaMenuTimeoutRef.current) {
            clearTimeout(megaMenuTimeoutRef.current);
        }
        setMegaMenuOpen(menuType);
    };

    // Fonction pour fermer le MegaMenu avec délai
    const closeMegaMenu = () => {
        megaMenuTimeoutRef.current = setTimeout(() => {
            setMegaMenuOpen(null);
        }, 150); // Délai de 150ms pour éviter la fermeture accidentelle
    };

    // Animation de la recherche : focus automatique et fermeture au clic extérieur
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 100);
        }

        const handleClickOutside = (event) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
            // Fermer le MegaMenu si on clique en dehors
            if (megaMenuOpen && megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
                setMegaMenuOpen(null);
            }
        };

        if (searchOpen || megaMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchOpen, megaMenuOpen]);

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

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        onMobileMenuToggle();
    };

    const firstLetter = appName.charAt(0).toUpperCase();

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm">
            {/* BLOC 1 - TOP HEADER */}
            <div className="bg-white h-[70px]">
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-full">
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
                                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                        {firstLetter}
                                    </div>
                                    <span className="ml-3 text-2xl font-bold text-black">
                                        {appName}
                                    </span>
                                </>
                            )}
                        </Link>

                        {/* Icônes e-commerce */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative flex items-center">
                                {searchOpen ? (
                                    <div 
                                        ref={searchInputRef}
                                        className="flex items-center"
                                        style={{
                                            width: searchOpen ? '260px' : '0px',
                                            transition: 'width 350ms ease-in-out'
                                        }}
                                    >
                                        <form onSubmit={handleSearch} className="w-full">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Rechercher..."
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                                                style={{
                                                    borderColor: '#e5e5e5'
                                                }}
                                            />
                                        </form>
                                        <button
                                            onClick={toggleSearch}
                                            className="ml-2 p-2 text-gray-600 hover:text-black transition-colors"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={toggleSearch}
                                        className="p-2 text-gray-600 hover:text-black transition-colors"
                                    >
                                        <MagnifyingGlassIcon className="h-6 w-6" />
                                    </button>
                                )}
                            </div>

                            {/* Wishlist */}
                            <Link
                                href={route('frontend.wishlist.index')}
                                className="relative p-2 text-gray-600 hover:text-black transition-colors"
                            >
                                <HeartIcon className="h-6 w-6" />
                                {wishlistItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                                    </span>
                                )}
                            </Link>

                            {/* Account */}
                            <div className="relative group">
                                {auth.user ? (
                                    <div className="relative">
                                        <button className="p-2 text-gray-600 hover:text-black transition-colors">
                                            <UserIcon className="h-6 w-6" />
                                        </button>
                                        {/* Dropdown */}
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
                                        className="p-2 text-gray-600 hover:text-black transition-colors"
                                    >
                                        <UserIcon className="h-6 w-6" />
                                    </Link>
                                )}
                            </div>

                            {/* Cart */}
                            <Link
                                href={route('frontend.cart.index')}
                                className="relative p-2 text-gray-600 hover:text-black transition-colors"
                            >
                                <ShoppingCartIcon className="h-6 w-6" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 text-gray-600 hover:text-black transition-colors md:hidden"
                            >
                                {mobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOC 2 - MENU PRINCIPAL */}
            <div 
                className="hidden md:block h-[55px] border-t" 
                style={{ 
                    backgroundColor: '#FAFAFA',
                    borderTopColor: '#eeeeee',
                    borderTopWidth: '1px'
                }}
            >
                <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8 h-full">
                    <nav className="flex items-center justify-center h-full">
                        <div className="flex items-center space-x-12">
                            {/* Sneakers avec MegaMenu */}
                            <div
                                ref={megaMenuRef}
                                className="relative group"
                                onMouseEnter={() => openMegaMenu('sneakers')}
                                onMouseLeave={closeMegaMenu}
                            >
                                <button 
                                    className="flex items-center text-black hover:text-gray-600 transition-colors duration-200"
                                    style={{
                                        fontFamily: 'Barlow',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        letterSpacing: '0.075em'
                                    }}
                                >
                                    Sneakers
                                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                                </button>
                                <MegaMenuFenomenal 
                                    isOpen={megaMenuOpen === 'sneakers'}
                                    type="sneakers"
                                    categories={categories.filter(cat => 
                                        cat.name.toLowerCase().includes('sneaker') || 
                                        cat.name.toLowerCase().includes('basket') ||
                                        cat.name.toLowerCase().includes('chaussure')
                                    )}
                                    translateX="-24%"
                                />
                            </div>

                            {/* Streetwears avec MegaMenu */}
                            <div
                                className="relative group"
                                onMouseEnter={() => openMegaMenu('streetwear')}
                                onMouseLeave={closeMegaMenu}
                            >
                                <button 
                                    className="flex items-center text-black hover:text-gray-600 transition-colors duration-200"
                                    style={{
                                        fontFamily: 'Barlow',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        letterSpacing: '0.075em'
                                    }}
                                >
                                    Streetwears
                                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                                </button>
                                <MegaMenuFenomenal 
                                    isOpen={megaMenuOpen === 'streetwear'}
                                    type="streetwear"
                                    categories={categories.filter(cat => 
                                        cat.name.toLowerCase().includes('streetwear') || 
                                        cat.name.toLowerCase().includes('vêtement') ||
                                        cat.name.toLowerCase().includes('mode')
                                    )}
                                    translateX="-35%"
                                />
                            </div>

                            {/* Livraison en 24h */}
                            <Link
                                href={route('livraison')}
                                className="text-black hover:text-gray-600 transition-colors duration-200"
                                style={{
                                    fontFamily: 'Barlow',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    letterSpacing: '0.025em'
                                }}
                            >
                                Livraison en 24h
                            </Link>

                            {/* Le Outline */}
                            <Link
                                href={route('a-propos-de-nous')}
                                className="text-black hover:text-gray-600 transition-colors duration-200"
                                style={{
                                    fontFamily: 'Barlow',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    letterSpacing: '0.025em'
                                }}
                            >
                                Le Outline
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-4 py-6 space-y-6">
                        {/* Navigation principale */}
                        <div className="space-y-6">
                            {/* Sneakers Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-4">Sneakers</h3>
                                <MegaMenuFenomenalMobile
                                    type="sneakers"
                                    categories={categories}
                                    isOpen={true}
                                    onClose={() => setMobileMenuOpen(false)}
                                />
                            </div>

                            {/* Streetwears Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-4">Streetwears</h3>
                                <MegaMenuFenomenalMobile
                                    type="streetwear"
                                    categories={categories}
                                    isOpen={true}
                                    onClose={() => setMobileMenuOpen(false)}
                                />
                            </div>

                            {/* Autres liens */}
                            <div className="pt-4 border-t border-gray-200 space-y-4">
                                <Link
                                    href={route('livraison')}
                                    className="block text-lg font-medium text-black hover:text-gray-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Livraison en 24h
                                </Link>
                                <Link
                                    href={route('a-propos-de-nous')}
                                    className="block text-lg font-medium text-black hover:text-gray-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Le Outline
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Search */}
                        <div className="pt-4 border-t border-gray-200">
                            <form onSubmit={handleSearch} className="w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                                />
                            </form>
                        </div>

                        {/* Mobile Auth Links */}
                        {!auth.user && (
                            <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
                                <Link
                                    href={route('login')}
                                    className="text-lg font-medium text-black hover:text-gray-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Se connecter
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-lg font-medium text-black hover:text-gray-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Créer un compte
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
export default PremiumHeader;