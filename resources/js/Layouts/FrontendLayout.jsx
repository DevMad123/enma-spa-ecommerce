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
import PremiumHeader from '@/Components/Frontend/PremiumHeader';
import Footer from '@/Components/Footer';
import MobileMenuOverlay from '@/Components/Frontend/MobileMenuOverlay';
import MobileBottomMenu from '@/Components/Frontend/MobileBottomMenu';
import MobileSearchOverlay from '@/Components/Frontend/MobileSearchOverlay';

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
            <Head title={title ? `${title} - ${appName}` : appName} />
            <div className="min-h-screen bg-white">
                {/* Nouveau Header Premium */}
                <PremiumHeader 
                    auth={auth}
                    appName={appName}
                    appSettings={appSettings}
                    customizations={customizations}
                    categories={categories}
                    cartItemsCount={getTotalItems()}
                    wishlistItemsCount={getWishlistTotalItems()}
                    onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                    navigation={navigation}
                />

                {/* Menu Mobile Premium Overlay */}
                <MobileMenuOverlay
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    categories={categories}
                    appName={appName}
                    appSettings={appSettings}
                />

                {/* Mobile Search Overlay */}
                <MobileSearchOverlay
                    isOpen={mobileSearchOpen}
                    onClose={() => setMobileSearchOpen(false)}
                />

                {/* Bottom Menu Mobile */}
                <MobileBottomMenu
                    onMenuClick={() => setMobileMenuOpen(true)}
                    onSearchClick={() => setMobileSearchOpen(true)}
                    cartItemsCount={getTotalItems()}
                    wishlistItemsCount={getWishlistTotalItems()}
                    auth={auth}
                />

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

                {/* Main Content avec padding bottom pour mobile menu et padding top pour header mobile */}
                <main className="flex-1 pb-20 md:pb-0">
                    {children}
                </main>

                {/* Footer */}
                <Footer appName={appName} firstLetter={firstLetter} />
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
