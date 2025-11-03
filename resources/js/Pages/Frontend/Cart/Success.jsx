import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link, usePage } from '@inertiajs/react';
import { usePriceSettings } from '@/Utils/priceFormatter';
import { useAppSettings } from '@/Hooks/useAppSettings';
import { getDeliveryMessage, calculateDeliveryDate } from '@/Utils/deliveryDateUtils';
import {
    CheckCircleIcon,
    PrinterIcon,
    EnvelopeIcon,
    TruckIcon,
    CalendarIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';

export default function CheckoutSuccess({ order }) {
    const { appSettings } = usePage().props;
    const { formatPriceWithCurrency } = usePriceSettings(appSettings);
    const { locale } = useAppSettings();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'processing': 'text-blue-600 bg-blue-50 border-blue-200',
            'shipped': 'text-purple-600 bg-purple-50 border-purple-200',
            'delivered': 'text-green-600 bg-green-50 border-green-200',
            'cancelled': 'text-red-600 bg-red-50 border-red-200'
        };
        return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'En attente',
            'processing': 'En cours de traitement',
            'shipped': 'Expédiée',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        return labels[status] || status;
    };

    return (
        <FrontendLayout title="Commande confirmée">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Commande confirmée !
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Merci pour votre commande. Nous avons bien reçu votre demande et nous nous occupons de tout !
                    </p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6">
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-2xl font-bold">Commande #{order.order_number}</h2>
                                <p className="text-amber-100 flex items-center mt-2">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {formatDate(order.created_at)}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`
                                    inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border
                                    ${getStatusColor(order.status)}
                                `}>
                                    {getStatusLabel(order.status)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {if (import.meta.env.DEV) console.log(order)}
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Informations de livraison */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <TruckIcon className="w-5 h-5 mr-2 text-amber-600" />
                                    Adresse de livraison
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium text-gray-900">
                                        {order.shipping_first_name} {order.shipping_last_name}
                                    </p>
                                    <p className="text-gray-700 mt-1">{order.shipping_address}</p>
                                    {order.shipping_address_2 && (
                                        <p className="text-gray-700">{order.shipping_address_2}</p>
                                    )}
                                    <p className="text-gray-700">
                                        {order.shipping_postal_code} {order.shipping_city}
                                    </p>
                                    <p className="text-gray-700">{order.shipping_country}</p>
                                    {order.shipping_phone && (
                                        <p className="text-gray-700 mt-2">
                                            📞 {order.shipping_phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Informations de facturation */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <CreditCardIcon className="w-5 h-5 mr-2 text-amber-600" />
                                    Adresse de facturation
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium text-gray-900">
                                        {order.billing_first_name} {order.billing_last_name}
                                    </p>
                                    <p className="text-gray-700 mt-1">{order.billing_address}</p>
                                    <p className="text-gray-700">
                                        {order.billing_postal_code} {order.billing_city}
                                    </p>
                                    <p className="text-gray-700">{order.billing_country}</p>
                                    {order.billing_phone && (
                                        <p className="text-gray-700 mt-2">
                                            📞 {order.billing_phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informations de paiement */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <CreditCardIcon className="w-5 h-5 mr-2 text-amber-600" />
                                Paiement
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium text-gray-900">
                                    {order.payment_method?.name || 'A la livraison (COD)'}
                                </p>
                                <p className="text-gray-700 mt-1">
                                    Montant: <span className="font-semibold">{formatPriceWithCurrency(order.total)}</span>
                                </p>
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Commande confirmé
                                </div>
                            </div>
                        </div>

                        {/* Méthode de livraison */}
                        {order.shipping_method && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthode de livraison</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.shipping_method.name}</p>
                                            <p className="text-sm text-gray-600">{order.shipping_method.description}</p>
                                            {order.shipping_method.estimated_days && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium text-blue-600 flex items-center">
                                                        <TruckIcon className="w-4 h-4 mr-1" />
                                                        {getDeliveryMessage(order.shipping_method.estimated_days, locale, order.shipping_method.name)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {parseFloat(order.shipping_method.price) === 0 ? 'Gratuit' : formatPriceWithCurrency(order.shipping_method.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Articles commandés */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles commandés</h3>
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0">
                                        <img
                                            src={item.product_image || '/images/placeholder.jpg'}
                                            alt={item.product_name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                                {item.color_name && <span>Couleur: {item.color_name}</span>}
                                                {item.size_name && <span>• Taille: {item.size_name}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                {formatPriceWithCurrency(item.price * item.quantity)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {formatPriceWithCurrency(item.price)} × {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="mt-6 bg-gradient-to-r from-gray-50 to-amber-50 rounded-lg p-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Sous-total</span>
                                        <span className="font-medium">{formatPriceWithCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.shipping_cost > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Livraison</span>
                                            <span className="font-medium">{formatPriceWithCurrency(order.shipping_cost)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">TVA</span>
                                        <span className="font-medium">{formatPriceWithCurrency(order.tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-amber-200 pt-2">
                                        <span>Total</span>
                                        <span className="text-amber-600">{formatPriceWithCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes de commande */}
                        {order.notes && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes de commande</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700">{order.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Prochaines étapes</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Confirmation par email</h3>
                            <p className="text-sm text-gray-600">
                                Vous recevrez un email de confirmation avec tous les détails de votre commande.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <TruckIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Préparation</h3>
                            <p className="text-sm text-gray-600">
                                Nous préparons votre commande avec soin. Vous recevrez un email lors de l'expédition.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Livraison</h3>
                            <p className="text-sm text-gray-600">
                                {order.shipping_method?.estimated_days
                                    ? `Votre colis vous sera livré ${getDeliveryMessage(order.shipping_method.estimated_days, locale).toLowerCase()}`
                                    : 'Votre commande sera livrée à l\'adresse indiquée sous 2-5 jours ouvrés.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span>Imprimer la commande</span>
                    </button>

                    <Link
                        href={route('frontend.profile.orders')}
                        className="flex items-center justify-center space-x-2 bg-amber-100 text-amber-700 px-6 py-3 rounded-lg font-medium hover:bg-amber-200 transition-colors"
                    >
                        <span>Suivre ma commande</span>
                    </Link>

                    <Link
                        href={route('frontend.shop.index')}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                    >
                        <span>Continuer mes achats</span>
                    </Link>
                </div>

                {/* Customer Support */}
                <div className="mt-12 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Besoin d'aide ?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Notre équipe de service client est là pour vous aider.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={route('contact')}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Nous contacter
                        </Link>
                        <span className="hidden sm:block text-gray-400">•</span>
                        <a
                            href={`mailto:${appSettings?.contact_email || 'support@enma-spa.com'}`}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                            {appSettings?.contact_email || 'support@enma-spa.com'}
                        </a>
                        <span className="hidden sm:block text-gray-400">•</span>
                        <a
                            href={`tel:${appSettings?.phone || '+33123456789'}`}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                            {appSettings?.phone || '+33 1 23 45 67 89'}
                        </a>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}

