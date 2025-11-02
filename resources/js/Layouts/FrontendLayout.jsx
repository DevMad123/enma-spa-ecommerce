import React, { createContext, useContext, useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ShoppingCartIcon,
    HeartIcon,
    UserIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { NotificationProvider } from '@/Components/Notifications/NotificationProvider';
import ThemeProvider from '@/Theme/ThemeProvider';
import useMenuCategories from '@/Hooks/useMenuCategories';
import { WishlistProvider, useWishlist } from '@/Contexts/WishlistContext';
import useCustomizations from '@/Hooks/useCustomizations';

// Contexte du panier
const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        // Charger le panier depuis localStorage et normaliser les prix si besoin
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart) || [];
                const normalized = parsed.map((it) => {
                    const priceNum = parseFloat(it?.price);
                    if (Number.isFinite(priceNum) && priceNum > 0) return it;
                    const candidates = [
                        it?.product?.current_sale_price,
                        it?.product?.sale_price,
                        it?.product?.price,
                        it?.product?.selected_variant_price,
                    ];
                    const fixed = candidates
                        .map(v => (v !== null && v !== undefined ? parseFloat(v) : NaN))
                        .find(v => Number.isFinite(v)) ?? 0;
                    return { ...it, price: fixed };
                });
                setCartItems(normalized);
                localStorage.setItem('cart', JSON.stringify(normalized));
            } catch {
                setCartItems([]);
            }
        }
    }, []);

    const addToCart = (product, quantity = 1, colorId = null, sizeId = null) => {
        // Try to resolve selected variant/color/size objects from product
        const resolvedColorId = colorId ?? product?.selectedColor?.id ?? null;
        const resolvedSizeId = sizeId ?? product?.selectedSize?.id ?? null;
        const variantId = product?.selected_variant_id ?? null;

        // Color/size objects for display
        const colorObj = product?.selectedColor
            || (Array.isArray(product?.colors) ? product.colors.find(c => c.id === resolvedColorId) : null)
            || null;
        const sizeObj = product?.selectedSize
            || (Array.isArray(product?.sizes) ? product.sizes.find(s => s.id === resolvedSizeId) : null)
            || null;

        // Resolve a robust unit price (handles string or number, variant/simple)
        const candidates = [
            product?.current_sale_price,
            product?.sale_price,
            product?.price,
            product?.selected_variant_price,
        ];
        const unitPrice = candidates
            .map(v => (v !== null && v !== undefined ? parseFloat(v) : NaN))
            .find(v => Number.isFinite(v)) ?? 0;

        const existingItem = cartItems.find(item =>
            item.product_id === product.id &&
            item.color_id === resolvedColorId &&
            item.size_id === resolvedSizeId
        );

        let newCartItems;
        if (existingItem) {
            newCartItems = cartItems.map(item =>
                item.product_id === product.id &&
                item.color_id === resolvedColorId &&
                item.size_id === resolvedSizeId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            newCartItems = [
                ...cartItems,
                {
                    product_id: product.id,
                    product: product,
                    quantity: quantity,
                    color_id: resolvedColorId,
                    size_id: resolvedSizeId,
                    variant_id: variantId,
                    color: colorObj,
                    size: sizeObj,
                    price: unitPrice,
                },
            ];
        }

        setCartItems(newCartItems);
        localStorage.setItem('cart', JSON.stringify(newCartItems));

        return true;
    };

    const removeFromCart = (productId, colorId = null, sizeId = null) => {
        const newCartItems = cartItems.filter(item =>
            !(item.product_id === productId &&
              item.color_id === colorId &&
              item.size_id === sizeId)
        );
        setCartItems(newCartItems);
        localStorage.setItem('cart', JSON.stringify(newCartItems));
    };

    const updateQuantity = (productId, quantity, colorId = null, sizeId = null) => {
        if (quantity <= 0) {
            removeFromCart(productId, colorId, sizeId);
            return;
        }

        const newCartItems = cartItems.map(item =>
            item.product_id === productId &&
            item.color_id === colorId &&
            item.size_id === sizeId
                ? { ...item, quantity: quantity }
                : item
        );
        setCartItems(newCartItems);
        localStorage.setItem('cart', JSON.stringify(newCartItems));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalItems,
            getTotalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
};

const FrontendLayout = ({ children, title }) => {
    const { auth, appSettings } = usePage().props;
    const { customizations } = useCustomizations();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const { getTotalItems } = useCart();
    const { getTotalItems: getWishlistTotalItems } = useWishlist();
    const { categories } = useMenuCategories();

    // Valeurs dynamiques depuis les settings
    const appName = appSettings?.app_name || 'ENMA SPA';
    const contactEmail = appSettings?.contact_email || 'contact@enma-spa.com';
    const phone = appSettings?.phone || '+33 1 23 45 67 89';
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';
    const firstLetter = appName.charAt(0).toUpperCase();
    const themeColor = customizations?.theme_color || null;

    const navigation = [
        // { name: 'Accueil', href: route('home') },
        { name: 'Boutique', href: route('frontend.shop.index') },
        { name: 'À propos', href: route('a-propos-de-nous') },
        { name: 'Contact', href: route('contact') },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = route('frontend.shop.index', { search: searchQuery });
        }
    };

    return (
        <>
            <Head title={`${title} - ${appName}`} />
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="bg-white shadow-lg sticky top-0 z-50 overflow-x-hidden">
                    {/* Top Bar */}
                    <div className="w-full text-center text-xs md:text-sm py-2 bg-gray-900 text-white">{appSettings?.announcement_text || `10 offerts sur votre 1ère commande avec le code FIRST10`}
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                    <span>📞 {phone}</span>
                                    <span>📧 {contactEmail}</span>
                                </div>
                                <div className="hidden md:flex items-center space-x-4">
                                    <span>🚚 Livraison gratuite dès {formatCurrency(appSettings?.free_shipping_threshold || 50000)}</span>
                                    <span>🎁 Retours gratuits</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Header */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
                        <div className="flex items-center justify-between h-12 md:h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link href={route('home')} className="flex items-center">
                                    {customizations?.logo_image ? (
                                        <img src={customizations.logo_image} alt={appName} className="h-6 md:h-8 w-auto max-w-[80px] md:max-w-[160px] object-contain" />
                                    ) : (
                                        <>
                                            <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-base md:text-xl">
                                                {firstLetter}
                                            </div>
                                            <span className="ml-2 hidden md:inline text-xl font-bold" style={ themeColor ? { color: themeColor } : {} }>
                                                {appName}
                                            </span>
                                        </>
                                    )}
                                </Link>
                            </div>

                            {/* Bouton Catégories (desktop uniquement) */}
                            <div className="hidden md:flex items-center ml-4">
                                <button
                                    type="button"
                                    onClick={() => setCategoriesOpen(true)}
                                    className="inline-flex items-center px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300"
                                >
                                    <Bars3Icon className="h-5 w-5 mr-2" />
                                    Catégories
                                </button>
                            </div>

                            {/* Navigation Desktop */}
                            <nav className="ml-5 hidden md:flex space-x-3">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>

                            {/* Search Bar */}
                            <div className="hidden md:flex flex-1 max-w-md mx-8">
                                <form onSubmit={handleSearch} className="w-full">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Rechercher une marque, un modèle..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </form>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-4 ml-auto md:ml-0">
                                {/* Mobile Search */}
                                <button
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 md:hidden"
                                    aria-label="Rechercher"
                                >
                                    <MagnifyingGlassIcon className="h-6 w-6" />
                                </button>
                                {/* Wishlist */}
                                <Link
                                    href={route('frontend.wishlist.index')}
                                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 relative"
                                    title="Ma Wishlist"
                                >
                                    <HeartIcon className="h-6 w-6" />
                                    {getWishlistTotalItems() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {getWishlistTotalItems()}
                                        </span>
                                    )}
                                </Link>

                                {/* Cart */}
                                <Link
                                    href={route('frontend.cart.index')}
                                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 relative"
                                    data-cart-icon
                                >
                                    <ShoppingCartIcon className="h-6 w-6" />
                                    {getTotalItems() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {getTotalItems()}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                {auth.user ? (
                                    <div className="relative group hidden md:block">
                                        <button className="flex items-center space-x-1 p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200">
                                            <UserIcon className="h-6 w-6" />
                                            <span className="hidden md:block text-sm font-medium">{auth.user.name}</span>
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </button>

                                        <div className="fixed mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="py-1">
                                                <Link
                                                    href={route('frontend.profile.index')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Mon Profil
                                                </Link>
                                                <Link
                                                    href={route('frontend.profile.orders')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Mes Commandes
                                                </Link>
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Déconnexion
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="hidden md:flex items-center space-x-2">
                                        <Link
                                            href={route('login')}
                                            className="text-sm text-gray-600 hover:text-amber-600 transition-colors duration-200"
                                        >
                                            Connexion
                                        </Link>
                                        <span className="text-gray-400">|</span>
                                        <Link
                                            href={route('register')}
                                            className="text-sm text-gray-600 hover:text-amber-600 transition-colors duration-200"
                                        >
                                            Inscription
                                        </Link>
                                    </div>
                                )}

                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 md:hidden"
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

                    {/* Mobile Drawer Menu */}
                    {mobileMenuOpen && (
                        <div className="fixed inset-0 z-50">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                            <div className="absolute inset-y-0 right-0 w-80 max-w-[85%] bg-white shadow-xl p-4 overflow-y-auto transform transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Menu</h3>
                                    <button onClick={() => setMobileMenuOpen(false)} aria-label="Fermer">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Navigation principale (mobile) */}
                                <nav className="mt-2 mb-4">
                                    <ul className="space-y-1">
                                        {[{ name: 'Accueil', href: route('home') }, ...navigation].map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="block px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>

                                {/* Compte */}
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Compte</h4>
                                    {auth.user ? (
                                        <div className="space-y-2">
                                            <Link href={route('frontend.profile.index')} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Mon Profil</Link>
                                            <Link href={route('frontend.profile.orders')} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Mes Commandes</Link>
                                            <Link href={route('logout')} method="post" as="button" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Déconnexion</Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link href={route('login')} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg border text-center text-gray-800 hover:bg-gray-50">Connexion</Link>
                                            <Link href={route('register')} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-amber-500 text-white text-center hover:bg-amber-600">Inscription</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Drawer Catégories (desktop et tablettes uniquement) */}
                    {categoriesOpen && (
                        <div className="fixed inset-0 z-50 hidden md:block">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setCategoriesOpen(false)} />
                            <div className="absolute inset-y-0 left-0 w-[28rem] max-w-[40%] bg-white shadow-xl p-4 overflow-y-auto transform transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Catégories</h3>
                                    <button onClick={() => setCategoriesOpen(false)} aria-label="Fermer">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {categories.map(cat => (
                                        <Link
                                            key={cat.id}
                                            href={cat.id ? route('frontend.shop.category', cat.id) : route('frontend.shop.index')}
                                            onClick={() => setCategoriesOpen(false)}
                                            className="block"
                                        >
                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                                                <img src={cat.image} alt={cat.name} className="h-12 w-12 rounded object-cover border" loading="lazy" />
                                                <span className="font-medium text-gray-900">{cat.name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Mobile Search Overlay */}
                    {mobileSearchOpen && (
                        <div className="fixed inset-0 z-50">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSearchOpen(false)} />
                            <div className="absolute top-0 left-0 right-0 bg-white p-4 shadow-lg">
                                <form onSubmit={handleSearch}>
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Rechercher des produits..."
                                            autoFocus
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMobileSearchOpen(false)}
                                            className="absolute right-2 top-1.5 p-1 text-gray-500 hover:text-gray-700"
                                            aria-label="Fermer la recherche"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </header>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Logo & Description */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                        {firstLetter}
                                    </div>
                                    <span className="ml-2 text-2xl font-bold">{appName}</span>
                                </div>
                                <p className="text-gray-300 mb-4">
                                    Votre destination e-commerce pour des produits de qualité.
                                    Découvrez notre sélection unique et profitez d'une expérience d'achat exceptionnelle.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                        Facebook
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                        Instagram
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                        Twitter
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
                                <ul className="space-y-2">
                                    <li><Link href={route('home')} className="text-gray-300 hover:text-white transition-colors duration-200">Accueil</Link></li>
                                    <li><Link href={route('frontend.shop.index')} className="text-gray-300 hover:text-white transition-colors duration-200">Boutique</Link></li>
                                    <li><Link href={route('a-propos-de-nous')} className="text-gray-300 hover:text-white transition-colors duration-200">À propos</Link></li>
                                    <li><Link href={route('contact')} className="text-gray-300 hover:text-white transition-colors duration-200">Contact</Link></li>
                                </ul>
                            </div>

                            {/* Customer Service */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Service Client</h3>
                                <ul className="space-y-2">
                                    <li><Link href={route('faq')} className="text-gray-300 hover:text-white transition-colors duration-200">Aide & FAQ</Link></li>
                                    {/* <li><Link href={route('livraison')} className="text-gray-300 hover:text-white transition-colors duration-200">Livraison</Link></li> */}
                                    <li><Link href={route('conditions-generales')} className="text-gray-300 hover:text-white transition-colors duration-200">Conditions générales</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                            <p className="text-gray-400">
                                © {new Date().getFullYear()} {appName}. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

const LayoutWithProviders = ({ children, title, wishlistItems = [] }) => {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <WishlistProvider initialWishlistItems={wishlistItems}>
                    <CartProvider>
                        <FrontendLayout title={title}>
                            {children}
                        </FrontendLayout>
                    </CartProvider>
                </WishlistProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
};

export default LayoutWithProviders;









import { formatCurrency } from '@/Utils/LocaleUtils';
