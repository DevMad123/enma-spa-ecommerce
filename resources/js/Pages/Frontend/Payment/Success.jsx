import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link } from '@inertiajs/react';
import { 
    CheckCircleIcon,
    PrinterIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const PaymentSuccess = ({ order, transaction, message }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <FrontendLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* En-tête de succès */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Paiement réussi !
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                        {message}
                    </p>
                    <p className="text-sm text-gray-500">
                        Commande n° <span className="font-semibold text-gray-900">#{order.id}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Détails de la commande */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Détails de la commande
                        </h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date de commande:</span>
                                <span className="font-medium">{formatDate(order.created_at)}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Statut:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Payée
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Montant total:</span>
                                <span className="font-semibold text-lg">{formatPrice(order.total_payable_amount)} XOF</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Méthode de paiement:</span>
                                <div className="flex items-center">
                                    {transaction.paymentMethod?.code === 'paypal' && (
                                        <>
                                            <img src="/images/paypal-logo.png" alt="PayPal" className="w-6 h-6 mr-2" />
                                            <span className="font-medium">PayPal</span>
                                        </>
                                    )}
                                    {transaction.paymentMethod?.code === 'orange_money' && (
                                        <>
                                            <div className="w-6 h-6 bg-orange-500 rounded mr-2 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">OM</span>
                                            </div>
                                            <span className="font-medium">Orange Money</span>
                                        </>
                                    )}
                                    {transaction.paymentMethod?.code === 'wave' && (
                                        <>
                                            <div className="w-6 h-6 bg-blue-500 rounded mr-2 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">W</span>
                                            </div>
                                            <span className="font-medium">Wave</span>
                                        </>
                                    )}
                                    {!['paypal', 'orange_money', 'wave'].includes(transaction.paymentMethod?.code) && (
                                        <span className="font-medium">{transaction.paymentMethod?.name || 'Autre'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Détails du paiement */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Détails du paiement
                        </h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">ID Transaction:</span>
                                <span className="font-mono text-sm">{transaction.transaction_id}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    {transaction.paymentMethod?.code === 'paypal' ? 'ID Paiement PayPal:' : 
                                     transaction.paymentMethod?.code === 'orange_money' ? 'Token Orange Money:' : 
                                     transaction.paymentMethod?.code === 'wave' ? 'Session Wave:' :
                                     'ID Paiement:'}
                                </span>
                                <span className="font-mono text-sm">{transaction.payment_id}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Statut:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {transaction.status_badge?.text || 'Complété'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date de traitement:</span>
                                <span className="font-medium">{formatDate(transaction.processed_at || transaction.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Articles commandés */}
                {order.sell_details && order.sell_details.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Articles commandés
                        </h2>
                        
                        <div className="space-y-4">
                            {order.sell_details.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center">
                                        {item.product?.featured_image && (
                                            <img 
                                                src={item.product.featured_image} 
                                                alt={item.product?.name}
                                                className="w-12 h-12 object-cover rounded-md mr-4"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {item.product?.name || 'Produit supprimé'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Quantité: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {formatPrice(item.price_per_unit)} XOF
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Total: {formatPrice(item.total_price)} XOF
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link
                        href={route('frontend.shop.index')}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                    >
                        Continuer mes achats
                    </Link>
                    
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                        <PrinterIcon className="w-5 h-5 mr-2" />
                        Imprimer
                    </button>
                </div>

                {/* Informations supplémentaires */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">
                        Que se passe-t-il maintenant ?
                    </h3>
                    <ul className="text-blue-800 space-y-1">
                        <li>• Vous recevrez un email de confirmation dans quelques minutes</li>
                        <li>• Votre commande sera préparée et expédiée sous 24-48h</li>
                        <li>• Vous recevrez un numéro de suivi par email</li>
                        <li>• En cas de questions, contactez notre service client</li>
                    </ul>
                </div>
            </div>
        </FrontendLayout>
    );
};

export default PaymentSuccess;