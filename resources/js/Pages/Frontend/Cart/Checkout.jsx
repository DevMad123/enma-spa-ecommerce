import React, { useState } from 'react';
import FrontendLayout, { CartProvider, useCart } from '@/Layouts/FrontendLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { 
    ArrowLeftIcon,
    CreditCardIcon,
    TruckIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const CheckoutForm = ({ shippingMethods = [], paymentMethods = [] }) => {
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]?.id || '');
    const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]?.id || '');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        // Informations personnelles
        email: '',
        
        // Adresse de livraison
        shipping_first_name: '',
        shipping_last_name: '',
        shipping_address: '',
        shipping_address_2: '',
        shipping_city: '',
        shipping_postal_code: '',
        shipping_country: 'France',
        shipping_phone: '',
        
        // Adresse de facturation
        billing_same_as_shipping: true,
        billing_first_name: '',
        billing_last_name: '',
        billing_address: '',
        billing_address_2: '',
        billing_city: '',
        billing_postal_code: '',
        billing_country: 'France',
        
        // Méthodes
        shipping_method_id: selectedShipping,
        payment_method_id: selectedPayment,
        
        // Notes
        order_notes: '',
        
        // Items du panier seront ajoutés dynamiquement
    });

    const subtotal = getTotalPrice();
    const selectedShippingMethod = shippingMethods.find(method => method.id == selectedShipping);
    const shippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
    const tax = subtotal * 0.20;
    const total = subtotal + shippingCost + tax;
    console.log('Cart items at submission:', cartItems);
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!acceptTerms) {
            alert('Veuillez accepter les conditions générales');
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            alert('Votre panier est vide. Veuillez ajouter des articles avant de finaliser la commande.');
            return;
        }
        
        // Transformer les cart_items pour correspondre à la structure attendue par le serveur
        const transformedCartItems = cartItems.map(item => ({
            product_id: item.product_id || item.product?.id,
            quantity: item.quantity,
            color_id: item.color_id || item.color?.id || null,
            size_id: item.size_id || item.size?.id || null,
            price: item.price || item.product?.current_sale_price || 0
        }));
        const formData = {
            ...data,
            shipping_method_id: selectedShipping,
            payment_method_id: selectedPayment,
            cart_items: transformedCartItems,
            total: total.toFixed(2)
        };

        // Vérifier la méthode de paiement sélectionnée
        const selectedPaymentMethod = paymentMethods.find(method => method.id == selectedPayment);

        // Debug: Vérifier le contenu avant envoi
        console.log('Debug checkout:', {
            originalCartItems: cartItems,
            transformedCartItems: transformedCartItems,
            cartItemsLength: cartItems.length,
            formData: formData,
            selectedPayment: selectedPayment,
            selectedPaymentMethod: selectedPaymentMethod
        });
        
        if (selectedPaymentMethod && selectedPaymentMethod.code === 'paypal') {
            // Traitement PayPal
            handlePayPalPayment(formData);
        } else if (selectedPaymentMethod && selectedPaymentMethod.code === 'orange_money') {
            // Traitement Orange Money
            handleOrangeMoneyPayment(formData);
        } else if (selectedPaymentMethod && selectedPaymentMethod.code === 'wave') {
            // Traitement Wave
            handleWavePayment(formData);
        } else {
            // Traitement normal (autres méthodes de paiement)
            console.log('Sending POST to:', '/cart/checkout');
            console.log('Data being sent:', formData);
            
            // Utiliser fetch avec JSON pour envoyer les cart_items correctement
            fetch('/cart/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Inertia': 'true',
                    'X-Inertia-Version': window.inertiaVersion || '',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Checkout successful:', data);
                if (data.success) {
                    clearCart();
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                } else {
                    throw new Error(data.message || 'Erreur lors de la création de la commande');
                }
            })
            .catch(error => {
                console.error('Erreur checkout détaillée:', {
                    error: error,
                    formData: formData,
                    cartItems: cartItems
                });
                alert('Erreur lors de la création de la commande: ' + error.message);
            });
        }
    };

    const handlePayPalPayment = async (formData) => {
        try {
            // D'abord, créer la commande
            const response = await fetch(route('frontend.cart.process'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la commande');
            }

            const orderData = await response.json();
            
            if (orderData.success && orderData.order_id) {
                // Créer le paiement PayPal
                const paypalResponse = await fetch(route('paypal.create'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                        order_id: orderData.order_id
                    })
                });

                if (!paypalResponse.ok) {
                    throw new Error('Erreur lors de la création du paiement PayPal');
                }

                const paypalData = await paypalResponse.json();
                
                if (paypalData.success && paypalData.approval_url) {
                    // Vider le panier avant redirection
                    clearCart();
                    // Rediriger vers PayPal
                    window.location.href = paypalData.approval_url;
                } else {
                    throw new Error(paypalData.error || 'Erreur PayPal inconnue');
                }
            } else {
                throw new Error(orderData.message || 'Erreur lors de la création de la commande');
            }
        } catch (error) {
            console.error('Erreur PayPal:', error);
            alert('Erreur lors du paiement PayPal: ' + error.message);
        }
    };

    const handleOrangeMoneyPayment = async (formData) => {
        try {
            // D'abord, créer la commande
            const response = await fetch(route('frontend.cart.process'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la commande');
            }

            const orderData = await response.json();
            
            if (orderData.success && orderData.order_id) {
                // Créer le paiement Orange Money
                const orangeMoneyResponse = await fetch(route('orange-money.create'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                        order_id: orderData.order_id
                    })
                });

                if (!orangeMoneyResponse.ok) {
                    throw new Error('Erreur lors de la création du paiement Orange Money');
                }

                const orangeMoneyData = await orangeMoneyResponse.json();
                
                if (orangeMoneyData.success && orangeMoneyData.payment_url) {
                    // Vider le panier avant redirection
                    clearCart();
                    // Rediriger vers Orange Money
                    window.location.href = orangeMoneyData.payment_url;
                } else {
                    throw new Error(orangeMoneyData.error || 'Erreur Orange Money inconnue');
                }
            } else {
                throw new Error(orderData.message || 'Erreur lors de la création de la commande');
            }
        } catch (error) {
            console.error('Erreur Orange Money:', error);
            alert('Erreur lors du paiement Orange Money: ' + error.message);
        }
    };

    const handleWavePayment = async (formData) => {
        try {
            // D'abord, créer la commande
            const response = await fetch(route('frontend.cart.process'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la commande');
            }

            const orderData = await response.json();
            
            if (orderData.success && orderData.order_id) {
                // Créer le paiement Wave
                const waveResponse = await fetch(route('wave.create'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                        order_id: orderData.order_id
                    })
                });

                if (!waveResponse.ok) {
                    throw new Error('Erreur lors de la création du paiement Wave');
                }

                const waveData = await waveResponse.json();
                
                if (waveData.success && waveData.checkout_url) {
                    // Vider le panier avant redirection
                    clearCart();
                    // Rediriger vers Wave
                    window.location.href = waveData.checkout_url;
                } else {
                    throw new Error(waveData.error || 'Erreur Wave inconnue');
                }
            } else {
                throw new Error(orderData.message || 'Erreur lors de la création de la commande');
            }
        } catch (error) {
            console.error('Erreur Wave:', error);
            alert('Erreur lors du paiement Wave: ' + error.message);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-12">
                <ExclamationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
                <p className="text-gray-600 mb-6">Ajoutez des articles à votre panier avant de procéder au paiement.</p>
                <Link
                    href={route('frontend.shop.index')}
                    className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                >
                    Découvrir la boutique
                </Link>
            </div>
        );
    }
    console.log(paymentMethods);
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de contact</h2>
                
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="votre@email.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Adresse de livraison</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="shipping_first_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom *
                        </label>
                        <input
                            type="text"
                            id="shipping_first_name"
                            required
                            value={data.shipping_first_name}
                            onChange={(e) => setData('shipping_first_name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.shipping_first_name && <p className="mt-1 text-sm text-red-600">{errors.shipping_first_name}</p>}
                    </div>

                    <div>
                        <label htmlFor="shipping_last_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nom *
                        </label>
                        <input
                            type="text"
                            id="shipping_last_name"
                            required
                            value={data.shipping_last_name}
                            onChange={(e) => setData('shipping_last_name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.shipping_last_name && <p className="mt-1 text-sm text-red-600">{errors.shipping_last_name}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse *
                        </label>
                        <input
                            type="text"
                            id="shipping_address"
                            required
                            value={data.shipping_address}
                            onChange={(e) => setData('shipping_address', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Numéro et nom de rue"
                        />
                        {errors.shipping_address && <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="shipping_address_2" className="block text-sm font-medium text-gray-700 mb-2">
                            Complément d'adresse
                        </label>
                        <input
                            type="text"
                            id="shipping_address_2"
                            value={data.shipping_address_2}
                            onChange={(e) => setData('shipping_address_2', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Appartement, étage, bâtiment..."
                        />
                    </div>

                    <div>
                        <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-700 mb-2">
                            Ville *
                        </label>
                        <input
                            type="text"
                            id="shipping_city"
                            required
                            value={data.shipping_city}
                            onChange={(e) => setData('shipping_city', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.shipping_city && <p className="mt-1 text-sm text-red-600">{errors.shipping_city}</p>}
                    </div>

                    <div>
                        <label htmlFor="shipping_postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                            Code postal *
                        </label>
                        <input
                            type="text"
                            id="shipping_postal_code"
                            required
                            value={data.shipping_postal_code}
                            onChange={(e) => setData('shipping_postal_code', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.shipping_postal_code && <p className="mt-1 text-sm text-red-600">{errors.shipping_postal_code}</p>}
                    </div>

                    <div>
                        <label htmlFor="shipping_phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone *
                        </label>
                        <input
                            type="tel"
                            id="shipping_phone"
                            required
                            value={data.shipping_phone}
                            onChange={(e) => setData('shipping_phone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="+33 1 23 45 67 89"
                        />
                        {errors.shipping_phone && <p className="mt-1 text-sm text-red-600">{errors.shipping_phone}</p>}
                    </div>
                </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Adresse de facturation</h2>
                    
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={data.billing_same_as_shipping}
                            onChange={(e) => setData('billing_same_as_shipping', e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Identique à l'adresse de livraison</span>
                    </label>
                </div>

                {!data.billing_same_as_shipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Même structure que l'adresse de livraison mais avec billing_ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                            <input
                                type="text"
                                required
                                value={data.billing_first_name}
                                onChange={(e) => setData('billing_first_name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                            <input
                                type="text"
                                required
                                value={data.billing_last_name}
                                onChange={(e) => setData('billing_last_name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                            <input
                                type="text"
                                required
                                value={data.billing_address}
                                onChange={(e) => setData('billing_address', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                            <input
                                type="text"
                                required
                                value={data.billing_city}
                                onChange={(e) => setData('billing_city', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Code postal *</label>
                            <input
                                type="text"
                                required
                                value={data.billing_postal_code}
                                onChange={(e) => setData('billing_postal_code', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Shipping Method */}
            {shippingMethods.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Mode de livraison</h2>
                    
                    <div className="space-y-4">
                        {shippingMethods.map((method) => (
                            <label key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="shipping_method"
                                        value={method.id}
                                        checked={selectedShipping == method.id}
                                        onChange={(e) => setSelectedShipping(e.target.value)}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center">
                                            <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-900">{method.name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{method.description}</p>
                                    </div>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {parseFloat(method.price) === 0 ? 'Gratuit' : `${method.price}€`}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Payment Method */}
            {paymentMethods.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Mode de paiement</h2>
                    
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <label key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={method.id}
                                        checked={selectedPayment == method.id}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center">
                                            <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-900">{method.name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{method.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {method.secure && <ShieldCheckIcon className="h-5 w-5 text-green-600" />}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notes de commande (optionnel)</h2>
                
                <textarea
                    value={data.order_notes}
                    onChange={(e) => setData('order_notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Instructions spéciales pour la livraison, allergies, préférences..."
                />
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="space-y-4">
                    <label className="flex items-start">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            required
                        />
                        <span className="ml-3 text-sm text-gray-700">
                            J'accepte les{' '}
                            <Link href="#" className="text-amber-600 hover:text-amber-700 underline">
                                conditions générales de vente
                            </Link>{' '}
                            et la{' '}
                            <Link href="#" className="text-amber-600 hover:text-amber-700 underline">
                                politique de confidentialité
                            </Link>
                        </span>
                    </label>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                        <span>Vos informations sont protégées et sécurisées</span>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={processing || !acceptTerms}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                {processing ? (
                    <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        <span>Traitement en cours...</span>
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="h-6 w-6" />
                        <span>Finaliser ma commande - {total.toFixed(2)}€</span>
                    </>
                )}
            </button>
        </form>
    );
};

const OrderSummary = () => {
    const { cartItems, getTotalPrice } = useCart();
    const subtotal = getTotalPrice();
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.20;
    const total = subtotal + shipping + tax;

    return (
        <div className="bg-gray-50 rounded-2xl p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Récapitulatif de commande</h2>

            {/* Articles */}
            <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                    <div key={`${item.product_id}-${item.color_id}-${item.size_id}`} className="flex items-center space-x-3">
                        <img
                            src={item.product.image || '/images/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                {item.color && <span>{item.color.name}</span>}
                                {item.size && <span>{item.size.name}</span>}
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-600">×{item.quantity}</span>
                            <span className="ml-2 font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)}€</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totaux */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                        {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (20%)</span>
                    <span className="font-medium">{tax.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>{total.toFixed(2)}€</span>
                </div>
            </div>
        </div>
    );
};

function Checkout({ shippingMethods = [], paymentMethods = [] }) {
    console.log('Checkout props received:', { 
        shippingMethods: shippingMethods,
        paymentMethods: paymentMethods,
        shippingCount: shippingMethods.length,
        paymentCount: paymentMethods.length
    });
    
    return (
        <FrontendLayout title="Checkout">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Finaliser ma commande</h1>
                        <p className="text-gray-600 mt-2">Vous y êtes presque !</p>
                    </div>
                    <Link
                        href={route('frontend.cart.index')}
                        className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Retour au panier</span>
                    </Link>
                </div>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Formulaire */}
                    <div className="lg:col-span-2">
                        <CheckoutForm 
                            shippingMethods={shippingMethods}
                            paymentMethods={paymentMethods}
                        />
                    </div>

                    {/* Récapitulatif */}
                    <div className="mt-8 lg:mt-0 lg:col-span-1">
                        <OrderSummary />
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}

// Wrapper avec CartProvider
export default function CheckoutWithCart(props) {
    return (
        <CartProvider>
            <Checkout {...props} />
        </CartProvider>
    );
}