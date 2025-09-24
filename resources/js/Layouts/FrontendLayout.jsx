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
        // Charger le panier depuis localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    const addToCart = (product, quantity = 1, colorId = null, sizeId = null) => {
        const existingItem = cartItems.find(item => 
            item.product_id === product.id && 
            item.color_id === colorId && 
            item.size_id === sizeId
        );

        let newCartItems;
        if (existingItem) {
            newCartItems = cartItems.map(item =>
                item.product_id === product.id && 
                item.color_id === colorId && 
                item.size_id === sizeId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            newCartItems = [...cartItems, {
                product_id: product.id,
                product: product,
                quantity: quantity,
                color_id: colorId,
                size_id: sizeId,
                price: product.current_sale_price
            }];
        }

        setCartItems(newCartItems);
        localStorage.setItem('cart', JSON.stringify(newCartItems));
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
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { getTotalItems } = useCart();

    const navigation = [
        { name: 'Accueil', href: route('home') },
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
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
                {/* Header */}
                <header className="bg-white shadow-lg sticky top-0 z-50">
                    {/* Top Bar */}
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                    <span>📞 +33 1 23 45 67 89</span>
                                    <span>✉️ contact@enma-spa.com</span>
                                </div>
                                <div className="hidden md:flex items-center space-x-4">
                                    <span>🚚 Livraison gratuite dès 50€</span>
                                    <span>🎁 Retours gratuits</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Header */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link href={route('home')} className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                        E
                                    </div>
                                    <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        ENMA SPA
                                    </span>
                                </Link>
                            </div>

                            {/* Navigation Desktop */}
                            <nav className="hidden md:flex space-x-8">
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
                                            placeholder="Rechercher des produits..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </form>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-4">
                                {/* Wishlist */}
                                <button className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 relative">
                                    <HeartIcon className="h-6 w-6" />
                                </button>

                                {/* Cart */}
                                <Link
                                    href={route('frontend.cart.index')}
                                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 relative"
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
                                    <div className="relative group">
                                        <button className="flex items-center space-x-1 p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200">
                                            <UserIcon className="h-6 w-6" />
                                            <span className="hidden md:block text-sm font-medium">{auth.user.name}</span>
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </button>
                                        
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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
                                                    href={route('logout')}
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
                                    <div className="flex items-center space-x-2">
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
                                    className="md:hidden p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200"
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

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 bg-white">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                
                                {/* Mobile Search */}
                                <div className="px-3 py-2">
                                    <form onSubmit={handleSearch}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Rechercher..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            />
                                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </form>
                                </div>
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
                                        E
                                    </div>
                                    <span className="ml-2 text-2xl font-bold">ENMA SPA</span>
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
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Aide & FAQ</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Retours</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Livraison</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Conditions générales</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                            <p className="text-gray-400">
                                © {new Date().getFullYear()} ENMA SPA. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default FrontendLayout;
