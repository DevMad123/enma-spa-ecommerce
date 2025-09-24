import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    XMarkIcon,
    CurrencyDollarIcon,
    CreditCardIcon,
    BanknotesIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';

export default function PaymentEdit({ payment, paymentMethods, paymentStatuses }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        sell_id: payment.sell_id,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transaction_reference: payment.transaction_reference || '',
        payment_date: payment.payment_date ? new Date(payment.payment_date).toISOString().slice(0, 16) : '',
        notes: payment.notes || '',
    });

    const [actionProcessing, setActionProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.payments.update', payment.id));
    };

    const handleAction = (action) => {
        if (!confirm(`Êtes-vous sûr de vouloir ${action === 'validate' ? 'valider' : action === 'reject' ? 'rejeter' : 'rembourser'} ce paiement ?`)) {
            return;
        }

        setActionProcessing(true);
        router.post(route(`admin.payments.${action}`, payment.id), {}, {
            onFinish: () => setActionProcessing(false),
        });
    };

    const getMethodIcon = (method) => {
        const icons = {
            cash: <BanknotesIcon className="h-5 w-5" />,
            card: <CreditCardIcon className="h-5 w-5" />,
            paypal: <CurrencyDollarIcon className="h-5 w-5" />,
            stripe: <CreditCardIcon className="h-5 w-5" />,
            orange_money: <DevicePhoneMobileIcon className="h-5 w-5" />,
            wave: <DevicePhoneMobileIcon className="h-5 w-5" />,
            bank_transfer: <CurrencyDollarIcon className="h-5 w-5" />,
        };
        return icons[method] || <CurrencyDollarIcon className="h-5 w-5" />;
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
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    const canValidate = payment.status === 'pending';
    const canReject = payment.status === 'pending';
    const canRefund = payment.status === 'success';

    return (
        <AdminLayout>
            <Head title={`Paiement #${payment.id}`} />

            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Paiement #{payment.id}</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Modifier les détails du paiement
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {getStatusBadge(payment.status)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire principal */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Informations de la commande */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Commande associée
                        </h2>
                        
                        {payment.sell && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Référence :</span>
                                        <span className="ml-2">{payment.sell.order_reference}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Client :</span>
                                        <span className="ml-2">
                                            {payment.sell.customer ? 
                                                `${payment.sell.customer.first_name} ${payment.sell.customer.last_name}` : 
                                                'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Montant total :</span>
                                        <span className="ml-2">{new Intl.NumberFormat('fr-FR').format(payment.sell.total_payable_amount)} XOF</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Total payé :</span>
                                        <span className="ml-2">{new Intl.NumberFormat('fr-FR').format(payment.sell.total_paid || 0)} XOF</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Statut paiement :</span>
                                        <span className="ml-2 font-medium">
                                            {payment.sell.payment_status === 'paid' ? 'Payé' :
                                             payment.sell.payment_status === 'partial' ? 'Partiellement payé' :
                                             payment.sell.payment_status === 'unpaid' ? 'Non payé' : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Date commande :</span>
                                        <span className="ml-2">{new Date(payment.sell.created_at).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <a
                                        href={route('admin.sells.show', payment.sell.id)}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        Voir les détails de la commande →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Formulaire d'édition */}
                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Détails du paiement
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Méthode de paiement *
                                </label>
                                <div className="mt-1 relative">
                                    <select
                                        value={data.method}
                                        onChange={(e) => setData('method', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                        disabled={payment.status === 'success' || payment.status === 'refunded'}
                                    >
                                        {Object.entries(paymentMethods).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.method && (
                                    <p className="mt-1 text-sm text-red-600">{errors.method}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Montant *
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        required
                                        disabled={payment.status === 'success' || payment.status === 'refunded'}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">XOF</span>
                                    </div>
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Statut
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={payment.status === 'success' || payment.status === 'refunded'}
                                >
                                    {Object.entries(paymentStatuses).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Date de paiement
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.payment_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Référence de transaction
                                </label>
                                <input
                                    type="text"
                                    value={data.transaction_reference}
                                    onChange={(e) => setData('transaction_reference', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Référence fournie par le prestataire de paiement"
                                />
                                {errors.transaction_reference && (
                                    <p className="mt-1 text-sm text-red-600">{errors.transaction_reference}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Notes internes sur ce paiement..."
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <a
                                href={route('admin.payments.index')}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Annuler
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {processing ? 'Enregistrement...' : 'Mettre à jour'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Barre latérale */}
                <div className="space-y-6">
                    
                    {/* Actions rapides */}
                    {(canValidate || canReject || canRefund) && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Actions
                            </h3>
                            <div className="space-y-3">
                                {canValidate && (
                                    <button
                                        onClick={() => handleAction('validate')}
                                        disabled={actionProcessing}
                                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                    >
                                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                                        Valider le paiement
                                    </button>
                                )}
                                
                                {canReject && (
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={actionProcessing}
                                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        <XCircleIcon className="w-4 h-4 mr-2" />
                                        Rejeter le paiement
                                    </button>
                                )}
                                
                                {canRefund && (
                                    <button
                                        onClick={() => handleAction('refund')}
                                        disabled={actionProcessing}
                                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                    >
                                        <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                                        Rembourser
                                    </button>
                                )}
                            </div>
                            
                            {actionProcessing && (
                                <div className="mt-3 text-center text-sm text-gray-500">
                                    Action en cours...
                                </div>
                            )}
                        </div>
                    )}

                    {/* Informations du paiement */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Informations
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">ID:</span>
                                <span className="font-medium">#{payment.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Créé le:</span>
                                <span>{new Date(payment.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Modifié le:</span>
                                <span>{new Date(payment.updated_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            {payment.processed_by && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Traité par:</span>
                                    <span>{payment.processed_by.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Méthode de paiement */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Méthode
                        </h3>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                {getMethodIcon(payment.method)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {paymentMethods[payment.method]}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Intl.NumberFormat('fr-FR').format(payment.amount)} {payment.currency}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
