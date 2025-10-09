import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    CurrencyDollarIcon,
    CreditCardIcon,
    BanknotesIcon,
    DevicePhoneMobileIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowUturnLeftIcon,
    CalendarIcon,
    UserIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

export default function PaymentShow({ payment, paymentMethods, paymentStatuses }) {
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
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: CalendarIcon },
            success: { color: 'bg-green-100 text-green-800', text: 'Réussi', icon: CheckCircleIcon },
            failed: { color: 'bg-red-100 text-red-800', text: 'Échoué', icon: XCircleIcon },
            cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Annulé', icon: XCircleIcon },
            refunded: { color: 'bg-purple-100 text-purple-800', text: 'Remboursé', icon: ArrowUturnLeftIcon },
        };
        
        const badge = badges[status] || badges.pending;
        const IconComponent = badge.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}>
                <IconComponent className="w-4 h-4 mr-1" />
                {badge.text}
            </span>
        );
    };

    const handleAction = (action) => {
        const messages = {
            validate: 'valider',
            reject: 'rejeter',
            refund: 'rembourser'
        };
        
        if (!confirm(`Êtes-vous sûr de vouloir ${messages[action]} ce paiement ?`)) {
            return;
        }

        router.patch(route(`admin.payments.${action}`, payment.id), {}, {
            onSuccess: () => {
                // Actualiser la page après l'action
                router.reload();
            }
        });
    };

    const canValidate = payment.status === 'pending';
    const canReject = payment.status === 'pending';
    const canRefund = payment.status === 'success';
    const canEdit = ['pending', 'failed'].includes(payment.status);
    const canDelete = ['pending', 'failed', 'cancelled'].includes(payment.status);

    return (
        <AdminLayout>
            <Head title={`Paiement #${payment.id}`} />

            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.payments.index')}
                            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Retour aux paiements
                        </Link>
                        
                        <div className="border-l border-gray-300 h-6"></div>
                        
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Paiement #{payment.id}</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Détails et actions sur le paiement
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {getStatusBadge(payment.status)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contenu principal */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Informations du paiement */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Informations du paiement
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Méthode de paiement</dt>
                                    <dd className="mt-1 flex items-center text-sm text-gray-900">
                                        <div className="flex-shrink-0 w-6 h-6 mr-2">
                                            {getMethodIcon(payment.method)}
                                        </div>
                                        {paymentMethods[payment.method] || payment.method}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Montant</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                                        {new Intl.NumberFormat('fr-FR').format(payment.amount)} {payment.currency}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Date de paiement</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                                    <dd className="mt-1">
                                        {getStatusBadge(payment.status)}
                                    </dd>
                                </div>
                                
                                {payment.transaction_reference && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Référence de transaction</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                                            {payment.transaction_reference}
                                        </dd>
                                    </div>
                                )}
                                
                                {payment.notes && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                        <dd className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                            {payment.notes}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Commande associée */}
                    {payment.sell && (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Commande associée
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <ShoppingCartIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={route('admin.orders.show', payment.sell.id)}
                                                className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                {payment.sell.order_reference}
                                            </Link>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                payment.sell.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                payment.sell.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {payment.sell.payment_status === 'paid' ? 'Payé' :
                                                 payment.sell.payment_status === 'partial' ? 'Partiellement payé' :
                                                 'Non payé'}
                                            </span>
                                        </div>
                                        
                                        <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <dt className="font-medium text-gray-500">Montant total:</dt>
                                                <dd className="text-gray-900">{new Intl.NumberFormat('fr-FR').format(payment.sell.total_payable_amount)} XOF</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">Total payé:</dt>
                                                <dd className="text-gray-900">{new Intl.NumberFormat('fr-FR').format(payment.sell.total_paid || 0)} XOF</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">Date commande:</dt>
                                                <dd className="text-gray-900">{new Date(payment.sell.created_at).toLocaleDateString('fr-FR')}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">Restant:</dt>
                                                <dd className="text-gray-900 font-medium">
                                                    {new Intl.NumberFormat('fr-FR').format(payment.sell.total_payable_amount - (payment.sell.total_paid || 0))} XOF
                                                </dd>
                                            </div>
                                        </dl>
                                        
                                        {payment.sell.customer && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="flex items-center space-x-2">
                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {payment.sell.customer.first_name} {payment.sell.customer.last_name}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        ({payment.sell.customer.email})
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Barre latérale */}
                <div className="space-y-6">
                    
                    {/* Actions */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Actions
                            </h3>
                        </div>
                        <div className="px-6 py-4 space-y-3">
                            {canValidate && (
                                <button
                                    onClick={() => handleAction('validate')}
                                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    Valider le paiement
                                </button>
                            )}
                            
                            {canReject && (
                                <button
                                    onClick={() => handleAction('reject')}
                                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <XCircleIcon className="w-4 h-4 mr-2" />
                                    Rejeter le paiement
                                </button>
                            )}
                            
                            {canRefund && (
                                <button
                                    onClick={() => handleAction('refund')}
                                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                                    Rembourser
                                </button>
                            )}
                            
                            {canDelete && (
                                <button
                                    onClick={() => {
                                        if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action ne peut pas être annulée.')) {
                                            router.delete(route('admin.payments.destroy', payment.id), {
                                                onSuccess: () => {
                                                    router.visit(route('admin.payments.index'));
                                                }
                                            });
                                        }
                                    }}
                                    className="w-full flex items-center justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Supprimer
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Informations système */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Informations système
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="font-medium text-gray-500">ID du paiement:</dt>
                                    <dd className="text-gray-900">#{payment.id}</dd>
                                </div>
                                
                                <div>
                                    <dt className="font-medium text-gray-500">Créé le:</dt>
                                    <dd className="text-gray-900">
                                        {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="font-medium text-gray-500">Modifié le:</dt>
                                    <dd className="text-gray-900">
                                        {new Date(payment.updated_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </dd>
                                </div>
                                
                                {payment.created_by && (
                                    <div>
                                        <dt className="font-medium text-gray-500">Créé par:</dt>
                                        <dd className="text-gray-900">{payment.created_by.name || 'N/A'}</dd>
                                    </div>
                                )}
                                
                                {payment.updated_by && payment.updated_by.id !== payment.created_by?.id && (
                                    <div>
                                        <dt className="font-medium text-gray-500">Modifié par:</dt>
                                        <dd className="text-gray-900">{payment.updated_by.name || 'N/A'}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}