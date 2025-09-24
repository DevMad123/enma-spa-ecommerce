import React from 'react';
import { router } from '@inertiajs/react';
import { 
    CurrencyDollarIcon,
    CreditCardIcon,
    BanknotesIcon,
    DevicePhoneMobileIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon
} from '@heroicons/react/24/outline';

export default function PaymentsList({ sell, payments = [], className = '' }) {
    const getMethodIcon = (method) => {
        const icons = {
            cash: <BanknotesIcon className="h-4 w-4" />,
            card: <CreditCardIcon className="h-4 w-4" />,
            paypal: <CurrencyDollarIcon className="h-4 w-4" />,
            stripe: <CreditCardIcon className="h-4 w-4" />,
            orange_money: <DevicePhoneMobileIcon className="h-4 w-4" />,
            wave: <DevicePhoneMobileIcon className="h-4 w-4" />,
            bank_transfer: <CurrencyDollarIcon className="h-4 w-4" />,
        };
        return icons[method] || <CurrencyDollarIcon className="h-4 w-4" />;
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
            success: { color: 'bg-green-100 text-green-800', text: 'Réussi' },
            failed: { color: 'bg-red-100 text-red-800', text: 'Échoué' },
            cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Annulé' },
            refunded: { color: 'bg-purple-100 text-purple-800', text: 'Remboursé' },
        };
        
        const badge = badges[status] || badges.pending;
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    const getMethodName = (method) => {
        const methods = {
            cash: 'Espèces',
            card: 'Carte bancaire',
            paypal: 'PayPal',
            stripe: 'Stripe',
            orange_money: 'Orange Money',
            wave: 'Wave',
            bank_transfer: 'Virement bancaire',
        };
        return methods[method] || method;
    };

    const totalPaid = payments.filter(p => p.status === 'success')
                            .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const remainingAmount = sell.total_payable_amount - totalPaid;

    const handleCreatePayment = () => {
        router.visit(route('admin.payments.create', { sell_id: sell.id }));
    };

    const handleViewPayment = (paymentId) => {
        router.visit(route('admin.payments.edit', paymentId));
    };

    return (
        <div className={`bg-white shadow rounded-lg ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                        Paiements ({payments.length})
                    </h3>
                    {remainingAmount > 0 && (
                        <button
                            onClick={handleCreatePayment}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Ajouter un paiement
                        </button>
                    )}
                </div>
            </div>

            {/* Résumé des paiements */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-gray-500 font-medium">Montant total</div>
                        <div className="text-lg font-semibold text-gray-900">
                            {new Intl.NumberFormat('fr-FR').format(sell.total_payable_amount)} XOF
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-500 font-medium">Total payé</div>
                        <div className="text-lg font-semibold text-green-600">
                            {new Intl.NumberFormat('fr-FR').format(totalPaid)} XOF
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-500 font-medium">Restant à payer</div>
                        <div className={`text-lg font-semibold ${remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {new Intl.NumberFormat('fr-FR').format(remainingAmount)} XOF
                        </div>
                    </div>
                </div>
                
                {/* Barre de progression */}
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progression du paiement</span>
                        <span>{Math.round((totalPaid / sell.total_payable_amount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((totalPaid / sell.total_payable_amount) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Liste des paiements */}
            <div className="px-6 py-4">
                {payments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun paiement</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Aucun paiement n'a été enregistré pour cette commande.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={handleCreatePayment}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Créer le premier paiement
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        {getMethodIcon(payment.method)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {getMethodName(payment.method)}
                                            </h4>
                                            {getStatusBadge(payment.status)}
                                        </div>
                                        
                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="font-medium text-gray-900">
                                                {new Intl.NumberFormat('fr-FR').format(payment.amount)} XOF
                                            </span>
                                            {payment.payment_date && (
                                                <span>
                                                    {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                            {payment.transaction_reference && (
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    Ref: {payment.transaction_reference}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {payment.notes && (
                                            <div className="mt-1 text-xs text-gray-600 italic">
                                                {payment.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleViewPayment(payment.id)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Voir/Modifier le paiement"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}