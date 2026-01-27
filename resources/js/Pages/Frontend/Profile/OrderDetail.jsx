import React, { useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    TruckIcon,
    CalendarIcon,
    MapPinIcon,
    CreditCardIcon,
    PrinterIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function OrderDetail({ order }) {
    const [showTrackingDetails, setShowTrackingDetails] = useState(false);

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
            'pending': 'En attente de traitement',
            'processing': 'En cours de préparation',
            'shipped': 'Expédiée',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="w-5 h-5" />;
            case 'processing':
                return <ClockIcon className="w-5 h-5" />;
            case 'shipped':
                return <TruckIcon className="w-5 h-5" />;
            case 'delivered':
                return <CheckCircleIcon className="w-5 h-5" />;
            case 'cancelled':
                return <XCircleIcon className="w-5 h-5" />;
            default:
                return <ClockIcon className="w-5 h-5" />;
        }
    };

    // Simulation des étapes de suivi
    const trackingSteps = [
        {
            title: 'Commande confirmée',
            date: order.created_at,
            completed: true,
            description: 'Votre commande a été confirmée et enregistrée'
        },
        {
            title: 'Paiement validé',
            date: order.created_at,
            completed: true,
            description: 'Le paiement a été traité avec succès'
        },
        {
            title: 'En préparation',
            date: order.updated_at,
            completed: ['processing', 'shipped', 'delivered'].includes(order.status),
            description: 'Vos articles sont en cours de préparation'
        },
        {
            title: 'Expédiée',
            date: order.shipped_at,
            completed: ['shipped', 'delivered'].includes(order.status),
            description: 'Votre colis a été remis au transporteur'
        },
        {
            title: 'Livrée',
            date: order.delivered_at,
            completed: order.status === 'delivered',
            description: 'Votre commande a été livrée'
        }
    ];

    return (
        <FrontendLayout title={`Commande #${order.order_number} - ENMA SPA`}>
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            href={route('frontend.profile.index')}
                            className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium mb-4 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                            <span>Retour au profil</span>
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Commande #{order.order_number}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Passée le {formatDate(order.created_at)}
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            <span>Imprimer</span>
                        </button>

                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors">
                                <XCircleIcon className="w-5 h-5" />
                                <span>Annuler</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Statut et suivi */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Statut de la commande</h2>
                                <div className={`
                                    inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border
                                    ${getStatusColor(order.status)}
                                `}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-2">{getStatusLabel(order.status)}</span>
                                </div>
                            </div>

                            {/* Numéro de suivi */}
                            {order.tracking_number && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Numéro de suivi</p>
                                            <p className="text-lg font-mono text-blue-700">{order.tracking_number}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowTrackingDetails(!showTrackingDetails)}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {showTrackingDetails ? 'Masquer' : 'Suivre le colis'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Étapes de suivi */}
                            <div className="space-y-4">
                                {trackingSteps.map((step, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                            ${step.completed
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-400'
                                            }
                                        `}>
                                            {step.completed ? (
                                                <CheckCircleIcon className="w-5 h-5" />
                                            ) : (
                                                <ClockIcon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`
                                                    font-medium
                                                    ${step.completed ? 'text-gray-900' : 'text-gray-500'}
                                                `}>
                                                    {step.title}
                                                </h3>
                                                {step.date && step.completed && (
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(step.date)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Articles commandés */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Articles commandés</h2>

                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                                        <img
                                            src={item.product_image || '/images/placeholder.jpg'}
                                            alt={item.product_name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 mb-2">
                                                <Link
                                                    href={route('frontend.shop.show', item.product_id)}
                                                    className="hover:text-amber-600 transition-colors"
                                                >
                                                    {item.product_name}
                                                </Link>
                                            </h3>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                {item.color_name && (
                                                    <span>Couleur: {item.color_name}</span>
                                                )}
                                                {item.size_name && (
                                                    <span>Taille: {item.size_name}</span>
                                                )}
                                                <span>Quantité: {item.quantity}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-medium text-gray-900">
                                                    {(item.price * item.quantity).toFixed(2)}€
                                                </span>

                                                {order.status === 'delivered' && (
                                                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                                                        Laisser un avis
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes de commande */}
                        {order.notes && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes de commande</h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700">{order.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Récapitulatif */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sous-total</span>
                                    <span className="font-medium">{order.subtotal}€</span>
                                </div>

                                {order.shipping_cost > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Livraison</span>
                                        <span className="font-medium">{order.shipping_cost}€</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">TVA</span>
                                    <span className="font-medium">{order.tax}€</span>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-lg text-gray-900">{order.total}€</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Adresse de livraison */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2 text-amber-600" />
                                Adresse de livraison
                            </h3>

                            <div className="text-sm text-gray-700 space-y-1">
                                <p className="font-medium">
                                    {order.shipping_first_name} {order.shipping_last_name}
                                </p>
                                <p>{order.shipping_address}</p>
                                {order.shipping_address_2 && (
                                    <p>{order.shipping_address_2}</p>
                                )}
                                <p>{order.shipping_postal_code} {order.shipping_city}</p>
                                <p>{order.shipping_country}</p>
                                {order.shipping_phone && (
                                    <p className="mt-2">📞 {order.shipping_phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Méthode de livraison */}
                        {order.shipping_method && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <TruckIcon className="w-5 h-5 mr-2 text-amber-600" />
                                    Livraison
                                </h3>

                                <div>
                                    <p className="font-medium text-gray-900">{order.shipping_method.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">{order.shipping_method.description}</p>
                                    <p className="text-sm font-medium text-gray-900 mt-2">
                                        {parseFloat(order.shipping_method.price) === 0 ? 'Gratuit' : `${order.shipping_method.price}€`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Paiement */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <CreditCardIcon className="w-5 h-5 mr-2 text-amber-600" />
                                Paiement
                            </h3>

                            <div>
                                <p className="font-medium text-gray-900">
                                    {order.payment_method?.name || 'Carte bancaire'}
                                </p>
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Commande confirmé
                                </div>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-amber-600" />
                                Besoin d'aide ?
                            </h3>

                            <p className="text-sm text-gray-700 mb-4">
                                Notre équipe est là pour vous accompagner
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href={route('contact')}
                                    className="block text-center bg-white text-amber-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Nous contacter
                                </Link>

                                <div className="text-xs text-gray-600 text-center space-y-1">
                                    <p>📧 support@enma-spa.com</p>
                                    <p>📞 +33 1 23 45 67 89</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
