import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import ShippingSelector from '@/Components/Shipping/ShippingSelector';
import { FaShoppingCart, FaUser, FaTruck, FaCreditCard, FaCheck } from 'react-icons/fa';

const CheckoutExample = ({ products = [], customer, shippingMethods = [] }) => {
    const { errors } = usePage().props;
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);

    const { data, setData, post, processing } = useForm({
        customer_id: customer?.id || '',
        shipping_id: '',
        payment_type: 'card',
        notes: '',
        products: products || []
    });

    // Calculer le sous-total
    useEffect(() => {
        const calculatedSubtotal = products.reduce((sum, product) => {
            return sum + (product.price * product.quantity);
        }, 0);
        setSubtotal(calculatedSubtotal);
    }, [products]);

    // Calculer le total avec la livraison
    useEffect(() => {
        const shippingCost = selectedShipping ? parseFloat(selectedShipping.price) : 0;
        setTotal(subtotal + shippingCost);
    }, [subtotal, selectedShipping]);

    // Mettre à jour les données du formulaire quand la livraison change
    useEffect(() => {
        if (selectedShipping) {
            setData('shipping_id', selectedShipping.id);
        }
    }, [selectedShipping]);

    const handleShippingChange = (shipping) => {
        setSelectedShipping(shipping);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!selectedShipping) {
            alert('Veuillez sélectionner une méthode de livraison');
            return;
        }

        post(route('orders.store'), {
            onSuccess: () => {
                // Redirection ou message de succès
            },
            onError: () => {
                // Gestion des erreurs
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Finaliser ma commande</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaShoppingCart className="text-blue-500" />
                    <span>{products.length} article{products.length > 1 ? 's' : ''} dans votre panier</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Section principale */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Informations client */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser className="text-blue-500" />
                                Informations de livraison
                            </h2>
                            {customer ? (
                                <div className="space-y-2">
                                    <div><strong>Nom :</strong> {customer.name}</div>
                                    <div><strong>Email :</strong> {customer.email}</div>
                                    <div><strong>Adresse :</strong> {customer.address || 'Non renseignée'}</div>
                                    <div><strong>Téléphone :</strong> {customer.phone || 'Non renseigné'}</div>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    Veuillez vous connecter pour continuer
                                </div>
                            )}
                        </div>

                        {/* Sélecteur de livraison */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <ShippingSelector
                                shippingMethods={shippingMethods}
                                selectedShipping={selectedShipping}
                                onShippingChange={handleShippingChange}
                                showPrice={true}
                                showDescription={true}
                            />
                            {errors.shipping_id && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {errors.shipping_id}
                                </p>
                            )}
                        </div>

                        {/* Méthode de paiement */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaCreditCard className="text-green-500" />
                                Méthode de paiement
                            </h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 bg-white rounded border cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment_type"
                                        value="card"
                                        checked={data.payment_type === 'card'}
                                        onChange={(e) => setData('payment_type', e.target.value)}
                                        className="text-blue-600"
                                    />
                                    <FaCreditCard className="text-blue-500" />
                                    <span>Carte bancaire</span>
                                </label>
                                
                                <label className="flex items-center gap-3 p-3 bg-white rounded border cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment_type"
                                        value="paypal"
                                        checked={data.payment_type === 'paypal'}
                                        onChange={(e) => setData('payment_type', e.target.value)}
                                        className="text-blue-600"
                                    />
                                    <div className="text-blue-500 font-bold">PP</div>
                                    <span>PayPal</span>
                                </label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Notes de commande (optionnel)
                            </h2>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Ajoutez des instructions spéciales pour votre commande..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Récapitulatif */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Récapitulatif
                            </h2>

                            {/* Produits */}
                            <div className="space-y-3 mb-6">
                                {products.map((product, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-gray-500">Qté: {product.quantity}</div>
                                        </div>
                                        <div className="font-medium">
                                            {(product.price * product.quantity).toFixed(2)} €
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                {/* Sous-total */}
                                <div className="flex justify-between text-sm">
                                    <span>Sous-total</span>
                                    <span>{subtotal.toFixed(2)} €</span>
                                </div>

                                {/* Livraison */}
                                <div className="flex justify-between text-sm">
                                    <span>Livraison</span>
                                    <span>
                                        {selectedShipping ? (
                                            selectedShipping.price == 0 ? 'Gratuit' : `${parseFloat(selectedShipping.price).toFixed(2)} €`
                                        ) : (
                                            'À sélectionner'
                                        )}
                                    </span>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span>{total.toFixed(2)} €</span>
                                </div>
                            </div>

                            {/* Informations de livraison sélectionnée */}
                            {selectedShipping && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                    <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                                        <FaTruck />
                                        {selectedShipping.name}
                                    </div>
                                    {selectedShipping.estimated_days && (
                                        <div className="text-blue-700">
                                            Délai estimé : {selectedShipping.estimated_days} jour{selectedShipping.estimated_days > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bouton de validation */}
                            <button
                                type="submit"
                                disabled={processing || !selectedShipping || !customer}
                                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck />
                                        Valider la commande
                                    </>
                                )}
                            </button>

                            {(!customer || !selectedShipping) && (
                                <div className="mt-3 text-xs text-gray-500 text-center">
                                    {!customer && '• Connexion requise'}
                                    {!customer && !selectedShipping && <br />}
                                    {!selectedShipping && '• Sélectionnez une livraison'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutExample;