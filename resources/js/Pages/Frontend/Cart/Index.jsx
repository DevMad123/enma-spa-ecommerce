import React, { useState, useEffect } from 'react';
import FrontendLayout, { CartProvider, useCart } from '@/Layouts/FrontendLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { usePriceSettings } from '@/Utils/priceFormatter';
import { 
    TrashIcon,
    PlusIcon,
    MinusIcon,
    HeartIcon,
    ArrowLeftIcon,
    ShoppingBagIcon,
    TruckIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { appSettings } = usePage().props;
    const { formatPriceWithCurrency } = usePriceSettings(appSettings);

    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity < 1) return;
        
        setIsUpdating(true);
        try {
            await onUpdateQuantity(item.product_id, newQuantity, item.color_id, item.size_id);
        } finally {
            setIsUpdating(false);
        }
    };

    const itemTotal = item.price * item.quantity;

    return (
        <div className="flex items-center space-x-4 py-6 border-b border-gray-200">
            {/* Image du produit */}
            <div className="flex-shrink-0 w-24 h-24">
                <img
                    src={item.product.image || '/images/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>

            {/* Informations du produit */}
            <div className="flex-1">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            <Link 
                                href={route('frontend.shop.show', item.product.id)}
                                className="hover:text-amber-600 transition-colors"
                            >
                                {item.product.name}
                            </Link>
                        </h3>
                        
                        <div className="mt-1 text-sm text-gray-600">
                            {item.product.category?.name && (
                                <span>{item.product.category.name}</span>
                            )}
                        </div>

                        {/* Variantes sélectionnées */}
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            {item.color && (
                                <div className="flex items-center space-x-1">
                                    <span>Couleur:</span>
                                    <div 
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: item.color.hex_code || item.color.name.toLowerCase() }}
                                    />
                                    <span>{item.color.name}</span>
                                </div>
                            )}
                            {item.size && (
                                <span>Taille: {item.size.name}</span>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                            {formatPriceWithCurrency(itemTotal)}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatPriceWithCurrency(item.price)} × {item.quantity}
                        </p>
                    </div>
                </div>

                {/* Contrôles de quantité et suppression */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Contrôle de quantité */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-2 font-medium min-w-[3rem] text-center">
                                {isUpdating ? '...' : item.quantity}
                            </span>
                            <button
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                disabled={isUpdating}
                                className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Déplacer vers les favoris */}
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            <HeartIcon className="h-4 w-4" />
                            <span>Favoris</span>
                        </button>
                    </div>

                    {/* Bouton de suppression */}
                    <button
                        onClick={() => onRemove(item.product_id, item.color_id, item.size_id)}
                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                        <TrashIcon className="h-4 w-4" />
                        <span>Supprimer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderSummary = ({ cartItems, subtotal, tax, total }) => {
    const { appSettings } = usePage().props;
    const { formatPriceWithCurrency } = usePriceSettings(appSettings);

    return (
        <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Récapitulatif</h2>

            <div className="space-y-4">
                {/* Sous-total */}
                <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})</span>
                    <span className="font-medium">{formatPriceWithCurrency(subtotal)}</span>
                </div>

                {/* TVA */}
                <div className="flex justify-between">
                    <span className="text-gray-600">TVA</span>
                    <span className="font-medium">{formatPriceWithCurrency(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Sous-total</span>
                        <span className="text-xl font-bold text-gray-900">{formatPriceWithCurrency(total)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Les frais de livraison seront calculés lors du checkout</p>
                </div>
            </div>

            {/* Bouton de commande */}
            <Link
                href={route('frontend.cart.checkout')}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                <ShoppingBagIcon className="h-6 w-6" />
                <span>Procéder au paiement</span>
            </Link>

            {/* Garanties */}
            <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center space-x-2">
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                    <span>Livraison rapide et soignée</span>
                </div>
            </div>
        </div>
    );
};

const RecommendedProducts = ({ products }) => {
    const { addToCart } = useCart();
    const { appSettings } = usePage().props;
    const { formatPriceWithCurrency } = usePriceSettings(appSettings);

    if (!products || products.length === 0) return null;

    return (
        <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Vous pourriez aussi aimer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                            <img
                                src={product.image || '/images/placeholder.jpg'}
                                alt={product.name}
                                className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                <Link href={route('frontend.shop.show', product.id)} className="hover:text-amber-600">
                                    {product.name}
                                </Link>
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-lg font-bold text-gray-900">
                                        {formatPriceWithCurrency(product.current_sale_price)}
                                    </span>
                                    {product.price > product.current_sale_price && (
                                        <span className="ml-2 text-sm text-gray-500 line-through">
                                            {formatPriceWithCurrency(product.price)}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => addToCart(product, 1)}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function Cart({ recommendedProducts = [] }) {
    const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart();
    const { appSettings } = usePage().props;
    const { formatPriceWithCurrency } = usePriceSettings(appSettings);
    const taxRate = parseFloat(appSettings?.tax_rate?.tax_rate) / 100 || 0.00;
    const subtotal = getTotalPrice();
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const handleUpdateQuantity = (productId, quantity, colorId, sizeId) => {
        updateQuantity(productId, quantity, colorId, sizeId);
    };

    const handleRemoveItem = (productId, colorId, sizeId) => {
        removeFromCart(productId, colorId, sizeId);
    };

    if (cartItems.length === 0) {
        return (
            <FrontendLayout title="Panier - ENMA SPA">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                            <ShoppingBagIcon className="w-full h-full" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Découvrez notre collection de produits exceptionnels et ajoutez vos favoris à votre panier.
                        </p>
                        <Link
                            href={route('frontend.shop.index')}
                            className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <ShoppingBagIcon className="h-6 w-6 mr-2" />
                            Découvrir la boutique
                        </Link>
                    </div>

                    {/* Produits recommandés */}
                    <RecommendedProducts products={recommendedProducts} />
                </div>
            </FrontendLayout>
        );
    }

    return (
        <FrontendLayout title={`Panier (${getTotalItems()}) - ENMA SPA`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mon panier</h1>
                        <p className="text-gray-600 mt-2">
                            {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''} dans votre panier
                        </p>
                    </div>
                    <Link
                        href={route('frontend.shop.index')}
                        className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Continuer mes achats</span>
                    </Link>
                </div>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Liste des articles */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Articles sélectionnés</h2>
                            
                            <div className="space-y-0">
                                {cartItems.map((item, index) => (
                                    <CartItem
                                        key={`${item.product_id}-${item.color_id}-${item.size_id}`}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                    />
                                ))}
                            </div>

                            {/* Actions du panier */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200 mt-6">
                                <button
                                    onClick={() => {
                                        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
                                            cartItems.forEach(item => 
                                                removeFromCart(item.product_id, item.color_id, item.size_id)
                                            );
                                        }
                                    }}
                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors mb-4 sm:mb-0"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                    <span>Vider le panier</span>
                                </button>

                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Sous-total</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatPriceWithCurrency(subtotal)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Récapitulatif de commande */}
                    <div className="mt-8 lg:mt-0 lg:col-span-1">
                        <OrderSummary
                            cartItems={cartItems}
                            subtotal={subtotal}
                            tax={tax}
                            total={total}
                        />
                    </div>
                </div>

                {/* Produits recommandés */}
                <RecommendedProducts products={recommendedProducts} />
            </div>
        </FrontendLayout>
    );
}

// Wrapper avec CartProvider
export default function CartWithProvider(props) {
    return (
        <CartProvider>
            <Cart {...props} />
        </CartProvider>
    );
}