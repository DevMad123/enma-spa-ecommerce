import React, { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatCurrency, formatDate, getCurrentCurrency, getCurrentCurrencySymbol, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    PlusIcon, 
    XMarkIcon, 
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    UserIcon,
    CurrencyEuroIcon
} from '@heroicons/react/24/outline';

export default function CreateOrder() {
    
    const { customers, products, localeConfig } = usePage().props;
    
    // État pour gérer l'initialisation de la locale
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        shipping_cost: 0,
        shipping_method: '',
        total_discount: 0,
        payment_type: 1,
        payment_status: 0,
        order_status: 0,
        notes: '',
        total_paid: 0,
        items: []
    });

    // Initialiser la configuration de locale
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
            setIsLocaleInitialized(true);
        }
    }, [localeConfig]);

    // Recherche de produits
    const searchProducts = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(route('admin.orders.searchProducts'), {
                params: { q: query }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Erreur lors de la recherche de produits:', error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (productSearch) {
                searchProducts(productSearch);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [productSearch]);

    // Ajouter un produit au panier
    const addToCart = (product, variant = null) => {
        const existingItemIndex = cartItems.findIndex(item => 
            item.product_id === product.id && 
            item.product_variant_id === (variant ? variant.id : null)
        );

        if (existingItemIndex >= 0) {
            // Augmenter la quantité si l'article existe déjà
            const updatedCart = [...cartItems];
            updatedCart[existingItemIndex].quantity += 1;
            setCartItems(updatedCart);
        } else {
            // Ajouter un nouvel article
            const newItem = {
                product_id: product.id,
                product_variant_id: variant ? variant.id : null,
                product_name: variant ? `${product.name} - ${variant.sku}` : product.name,
                quantity: 1,
                unit_price: variant ? variant.sale_price : product.current_sale_price,
                unit_cost: variant ? variant.purchase_cost : product.current_purchase_cost,
                stock_available: variant ? variant.available_quantity : product.available_quantity,
                discount: 0,
                vat_percentage: 0
            };
            setCartItems([...cartItems, newItem]);
        }
        
        setProductSearch('');
        setSearchResults([]);
        setShowProductSearch(false);
    };

    // Supprimer un article du panier
    const removeFromCart = (index) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);
    };

    // Mettre à jour la quantité d'un article
    const updateCartItemQuantity = (index, quantity) => {
        if (quantity <= 0) {
            removeFromCart(index);
            return;
        }

        const updatedCart = [...cartItems];
        updatedCart[index].quantity = quantity;
        setCartItems(updatedCart);
    };

    // Mettre à jour la remise d'un article
    const updateCartItemDiscount = (index, discount) => {
        const updatedCart = [...cartItems];
        updatedCart[index].discount = discount || 0;
        setCartItems(updatedCart);
    };

    // Calculer les totaux
    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price - (item.discount || 0));
        }, 0);

        const vatTotal = cartItems.reduce((sum, item) => {
            const itemSubtotal = item.quantity * item.unit_price - (item.discount || 0);
            return sum + (itemSubtotal * (item.vat_percentage || 0) / 100);
        }, 0);

        const shippingCost = parseFloat(data.shipping_cost) || 0;
        const totalDiscount = parseFloat(data.total_discount) || 0;
        const total = subtotal + vatTotal + shippingCost - totalDiscount;

        return {
            subtotal,
            vatTotal,
            total,
            shippingCost,
            totalDiscount
        };
    };

    // Soumettre la commande
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCustomer) {
            alert('Veuillez sélectionner un client');
            return;
        }

        if (cartItems.length === 0) {
            alert('Veuillez ajouter au moins un article à la commande');
            return;
        }

        // Vérifier les stocks
        const stockErrors = [];
        cartItems.forEach(item => {
            if (item.quantity > item.stock_available) {
                stockErrors.push(`Stock insuffisant pour ${item.product_name}: ${item.stock_available} disponible(s)`);
            }
        });

        if (stockErrors.length > 0) {
            alert('Erreurs de stock:\n' + stockErrors.join('\n'));
            return;
        }

        // Préparer les données pour l'envoi
        const formDataToSend = {
            customer_id: selectedCustomer.id,
            shipping_cost: data.shipping_cost,
            shipping_method: data.shipping_method,
            total_discount: data.total_discount,
            payment_type: data.payment_type,
            payment_status: data.payment_status,
            order_status: data.order_status,
            notes: data.notes,
            total_paid: data.total_paid,
            items: cartItems.map(item => ({
                product_id: item.product_id,
                product_variant_id: item.product_variant_id,
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                discount: item.discount || 0,
                vat_percentage: item.vat_percentage || 0
            }))
        };

        // Utiliser la méthode post du hook useForm
        router.post(route('admin.orders.store'), formDataToSend, {
            onStart: () => {
                if (import.meta.env.DEV) console.log('🚀 Début de la requête POST');
            },
            onSuccess: (data) => {
                if (import.meta.env.DEV) console.log('✅ Succès:', data);
                // Redirection gérée par le contrôleur
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                if (import.meta.env.DEV) console.log('🏁 Fin de la requête');
            }
        });
    };

    const totals = calculateTotals();

    // Afficher un écran de chargement si la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle Commande" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle commande</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Sélectionnez un client et ajoutez des produits pour créer une commande.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Colonne principale - Sélection client et produits */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Sélection du client */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <UserIcon className="h-5 w-5 mr-2" />
                                    Client
                                </h2>
                                {selectedCustomer && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCustomer(null)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Changer
                                    </button>
                                )}
                            </div>

                            {!selectedCustomer ? (
                                <div>
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={customerSearch}
                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                            placeholder="Rechercher un client..."
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    {customerSearch.length >= 2 && (
                                        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                                            {customers
                                                .filter(customer => 
                                                    customer.first_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                    customer.last_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
                                                )
                                                .map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setCustomerSearch('');
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-0"
                                                    >
                                                        <div className="font-medium text-gray-900">
                                                            {customer.first_name} {customer.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {customer.email}
                                                        </div>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-medium text-gray-900">
                                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedCustomer.email}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ajout de produits */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                    Produits ({cartItems.length})
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowProductSearch(!showProductSearch)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Ajouter
                                </button>
                            </div>

                            {/* Recherche de produits */}
                            {showProductSearch && (
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Rechercher un produit..."
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            autoFocus
                                        />
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white">
                                            {searchResults.map(product => (
                                                <div key={product.id} className="border-b border-gray-200 last:border-0">
                                                    <div className="px-4 py-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Stock: {product.available_quantity} | Prix: {formatCurrency(product.current_sale_price)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => addToCart(product)}
                                                                className="ml-3 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                                                            >
                                                                Ajouter
                                                            </button>
                                                        </div>

                                                        {/* Variantes si disponibles */}
                                                        {product.variants && product.variants.length > 0 && (
                                                            <div className="mt-2 ml-4">
                                                                <div className="text-xs text-gray-500 mb-1">Variantes:</div>
                                                                {product.variants.map(variant => (
                                                                    <div key={variant.id} className="flex items-center justify-between py-1">
                                                                        <div className="text-sm">
                                                                            {variant.sku} - Stock: {variant.available_quantity} | {formatCurrency(variant.sale_price)}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => addToCart(product, variant)}
                                                                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                                        >
                                                                            Ajouter
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Liste des articles dans le panier */}
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>Aucun produit ajouté</p>
                                    <p className="text-sm">Utilisez le bouton "Ajouter" pour rechercher des produits</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cartItems.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {item.product_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Prix unitaire: {formatCurrency(item.unit_price)} | Stock: {item.stock_available}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500">Quantité</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.stock_available}
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartItemQuantity(index, parseInt(e.target.value))}
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-500">Remise ({getCurrentCurrencySymbol()})</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.discount || 0}
                                                        onChange={(e) => updateCartItemDiscount(index, parseFloat(e.target.value))}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-500">Sous-total</label>
                                                    <div className="text-sm font-medium">
                                                        {formatCurrency((item.quantity * item.unit_price) - (item.discount || 0))}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(index)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne droite - Résumé et paramètres */}
                    <div className="space-y-6">
                        
                        {/* Résumé de la commande */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <CurrencyEuroIcon className="h-5 w-5 mr-2" />
                                Résumé
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Sous-total:</span>
                                    <span>{formatCurrency(totals.subtotal)}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span>TVA:</span>
                                    <span>{formatCurrency(totals.vatTotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Livraison:</span>
                                    <span>{formatCurrency(totals.shippingCost)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Remise totale:</span>
                                    <span>-{formatCurrency(totals.totalDiscount)}</span>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span>{formatCurrency(totals.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Paramètres de livraison et paiement */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Frais de livraison ({getCurrentCurrencySymbol()})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.shipping_cost}
                                        onChange={(e) => setData('shipping_cost', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Méthode de livraison
                                    </label>
                                    <input
                                        type="text"
                                        value={data.shipping_method}
                                        onChange={(e) => setData('shipping_method', e.target.value)}
                                        placeholder="Ex: Colissimo, Chronopost..."
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Remise totale ({getCurrentCurrencySymbol()})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.total_discount}
                                        onChange={(e) => setData('total_discount', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Montant déjà payé ({getCurrentCurrencySymbol()})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.total_paid}
                                        onChange={(e) => setData('total_paid', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Statut de paiement
                                    </label>
                                    <select
                                        value={data.payment_status}
                                        onChange={(e) => setData('payment_status', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value={0}>Non payé</option>
                                        <option value={1}>Payé</option>
                                        <option value={2}>Partiellement payé</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Notes internes sur la commande..."
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing || !selectedCustomer || cartItems.length === 0}
                                    onClick={() => if (import.meta.env.DEV) console.log('🔘 Bouton de soumission cliqué!')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Création...' : 'Créer la commande'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.visit(route('admin.orders.index'))}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
