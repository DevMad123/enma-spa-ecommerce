import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link } from '@inertiajs/react';
import { 
    XCircleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const PaymentCancelled = ({ order, message }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <FrontendLayout>
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* En-tête d'annulation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <XCircleIcon className="w-8 h-8 text-gray-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Paiement annulé
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                        {message || 'Vous avez annulé le processus de paiement.'}
                    </p>
                    {order && (
                        <p className="text-sm text-gray-500">
                            Commande n° <span className="font-semibold text-gray-900">#{order.id}</span>
                        </p>
                    )}
                </div>

                {/* Informations de commande si disponibles */}
                {order && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Détails de la commande
                        </h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Numéro de commande:</span>
                                <span className="font-medium">#{order.id}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Montant:</span>
                                <span className="font-semibold">{formatPrice(order.total_payable_amount)} XOF</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Statut:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    En attente de paiement
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Que faire maintenant */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        Votre commande vous attend
                    </h3>
                    <p className="text-blue-800 mb-3">
                        Votre commande a été sauvegardée et attend votre paiement. Vous pouvez :
                    </p>
                    <ul className="text-blue-800 space-y-2">
                        <li className="flex items-start">
                            <span className="block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Reprendre le processus de paiement immédiatement
                        </li>
                        <li className="flex items-start">
                            <span className="block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Modifier votre commande si nécessaire
                        </li>
                        <li className="flex items-start">
                            <span className="block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Choisir une autre méthode de paiement
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href={route('frontend.cart.checkout')}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                    >
                        Reprendre le paiement
                    </Link>
                    
                    <Link
                        href={route('frontend.cart.index')}
                        className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Modifier le panier
                    </Link>
                </div>

                {/* Continuer les achats */}
                <div className="text-center mt-8 pt-8 border-t border-gray-200">
                    <p className="text-gray-600 mb-4">
                        Ou découvrez d'autres produits qui pourraient vous intéresser
                    </p>
                    <Link
                        href={route('frontend.shop.index')}
                        className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
                    >
                        Continuer mes achats
                    </Link>
                </div>
            </div>
        </FrontendLayout>
    );
};

export default PaymentCancelled;