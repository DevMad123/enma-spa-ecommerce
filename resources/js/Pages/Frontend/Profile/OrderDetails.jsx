import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link, usePage } from '@inertiajs/react';
import { usePriceSettings } from '@/Utils/priceFormatter';
import {
    ArrowLeftIcon,
    CalendarIcon,
    TruckIcon,
    CreditCardIcon,
    ShoppingBagIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

export default function OrderDetails({ order }) {
    const { appSettings } = usePage().props;
    const { formatPriceWithCurrency } = usePriceSettings(appSettings);

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
        <FrontendLayout title={`Commande #${order.order_reference} - Mon Profil`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('frontend.profile.index', { tab: 'orders' })}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Retour aux commandes
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Commande #{order.order_reference}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-1" />
                                    Passée le {formatDate(order.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`
                                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border
                                ${getStatusColor(order.shipping_status)}
                            `}>
                                {getStatusLabel(order.shipping_status)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="space-y-8">
                    {/* Informations de livraison et paiement */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Adresse de livraison */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
                                Adresse de livraison
                            </h2>
                            <div className="text-gray-700">
                                <p className="font-medium">{order.customer?.name}</p>
                                <p>{order.shipping_address}</p>
                                {order.shipping_city && (
                                    <p>{order.shipping_city}</p>
                                )}
                                {order.shipping_phone && (
                                    <p className="mt-2">📞 {order.shipping_phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Informations de paiement */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <CreditCardIcon className="w-5 h-5 mr-2 text-green-600" />
                                Paiement
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <p>
                                    <span className="font-medium">Méthode:</span>{' '}
                                    {order.payment_method?.name || 'À la livraison'}
                                </p>
                                <p>
                                    <span className="font-medium">Montant total:</span>{' '}
                                    <span className="text-lg font-bold text-gray-900">
                                        {formatPriceWithCurrency(order.total_payable_amount)}
                                    </span>
                                </p>
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Paiement confirmé
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Méthode de livraison */}
                    {order.shipping && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <TruckIcon className="w-5 h-5 mr-2 text-purple-600" />
                                Livraison
                            </h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{order.shipping.name}</p>
                                    <p className="text-sm text-gray-600">{order.shipping.description}</p>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {parseFloat(order.shipping.price) === 0 ? 'Gratuit' : formatPriceWithCurrency(order.shipping.price)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Articles commandés */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <ShoppingBagIcon className="w-5 h-5 mr-2 text-amber-600" />
                            Articles commandés ({order.sell_details?.length || 0})
                        </h2>

                        <div className="space-y-4">
                            {order.sell_details?.map((detail, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    <img
                                        src={detail.product?.image || '/images/placeholder.jpg'}
                                        alt={detail.product?.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            {detail.product?.name || 'Produit supprimé'}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                            {detail.color && (
                                                <div className="flex items-center space-x-1">
                                                    <span>Couleur:</span>
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: detail.color.color_code || '#ccc' }}
                                                    />
                                                    <span>{detail.color.name}</span>
                                                </div>
                                            )}
                                            {detail.size && (
                                                <span>• Taille: {detail.size.size}</span>
                                            )}
                                            {detail.product?.brand && (
                                                <span>• {detail.product.brand.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {formatPriceWithCurrency(detail.sale_quantity * detail.unit_sell_price)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatPriceWithCurrency(detail.unit_sell_price)} × {detail.sale_quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Récapitulatif des totaux */}
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sous-total</span>
                                    <span className="font-medium">
                                        {formatPriceWithCurrency(
                                            order.sell_details?.reduce((sum, detail) =>
                                                sum + (detail.sale_quantity * detail.unit_sell_price), 0
                                            ) || 0
                                        )}
                                    </span>
                                </div>
                                {order.shipping_cost > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Frais de livraison</span>
                                        <span className="font-medium">{formatPriceWithCurrency(order.shipping_cost)}</span>
                                    </div>
                                )}
                                {order.total_vat_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">TVA</span>
                                        <span className="font-medium">{formatPriceWithCurrency(order.total_vat_amount)}</span>
                                    </div>
                                )}
                                {order.total_discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Remise</span>
                                        <span className="font-medium">-{formatPriceWithCurrency(order.total_discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                                    <span>Total</span>
                                    <span className="text-amber-600">{formatPriceWithCurrency(order.total_payable_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes de commande */}
                    {order.notes && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes de commande</h2>
                            <p className="text-gray-700">{order.notes}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            <span>Imprimer la commande</span>
                        </button>

                        <Link
                            href={route('frontend.shop.index')}
                            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                        >
                            <span>Continuer mes achats</span>
                        </Link>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
