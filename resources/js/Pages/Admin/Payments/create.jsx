import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    XMarkIcon,
    CurrencyDollarIcon,
    CreditCardIcon,
    BanknotesIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

export default function PaymentCreate({ sell, sells, paymentMethods, paymentStatuses }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        sell_id: sell ? sell.id : '',
        method: 'cash',
        amount: '',
        currency: 'XOF',
        status: 'pending',
        transaction_reference: '',
        payment_date: new Date().toISOString().slice(0, 16),
        notes: '',
    });

    const [selectedSell, setSelectedSell] = useState(sell);
    const [remainingAmount, setRemainingAmount] = useState(0);

    useEffect(() => {
        if (selectedSell) {
            const totalPaid = selectedSell.payments 
                ? selectedSell.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
                : selectedSell.total_paid || 0;
            const remaining = selectedSell.total_payable_amount - totalPaid;
            setRemainingAmount(remaining);
            
            if (remaining > 0 && !data.amount) {
                setData('amount', remaining.toString());
            }
        }
    }, [selectedSell]);

    const handleSellChange = (sellId) => {
        const selected = sells.find(s => s.id == sellId);
        setSelectedSell(selected);
        setData('sell_id', sellId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.payments.store'), {
            onSuccess: () => reset(),
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

    return (
        <AdminLayout>
            <Head title="Nouveau paiement" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau paiement</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Enregistrer un paiement pour une commande existante.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Sélection de commande */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Commande
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Commande à payer *
                                    </label>
                                    <select
                                        value={data.sell_id}
                                        onChange={(e) => handleSellChange(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Sélectionnez une commande</option>
                                        {sells.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.order_reference} - {s.customer ? `${s.customer.first_name} ${s.customer.last_name}` : 'Client supprimé'} 
                                                ({new Intl.NumberFormat('fr-FR').format(s.total_payable_amount)} XOF)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sell_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.sell_id}</p>
                                    )}
                                </div>

                                {selectedSell && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Montant total :</span>
                                                <span className="ml-2">{new Intl.NumberFormat('fr-FR').format(selectedSell.total_payable_amount)} XOF</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Déjà payé :</span>
                                                <span className="ml-2">{new Intl.NumberFormat('fr-FR').format(selectedSell.total_paid || 0)} XOF</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Restant à payer :</span>
                                                <span className="ml-2 font-semibold text-orange-600">
                                                    {new Intl.NumberFormat('fr-FR').format(remainingAmount)} XOF
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Client :</span>
                                                <span className="ml-2">{selectedSell.customer ? `${selectedSell.customer.first_name} ${selectedSell.customer.last_name}` : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Détails du paiement */}
                        <div className="bg-white shadow rounded-lg p-6">
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
                                        >
                                            {Object.entries(paymentMethods).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {getMethodIcon(data.method)}
                                        </div>
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
                                            max={remainingAmount || undefined}
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="0.00"
                                            required
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
                        </div>
                    </div>

                    {/* Résumé */}
                    <div className="space-y-6">
                        {/* Informations de la méthode */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Méthode sélectionnée
                            </h3>
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    {getMethodIcon(data.method)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {paymentMethods[data.method]}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {data.method === 'cash' && 'Paiement en espèces'}
                                        {data.method === 'card' && 'Paiement par carte bancaire'}
                                        {data.method === 'paypal' && 'Paiement via PayPal'}
                                        {data.method === 'stripe' && 'Paiement via Stripe'}
                                        {data.method === 'orange_money' && 'Paiement mobile Orange Money'}
                                        {data.method === 'wave' && 'Paiement mobile Wave'}
                                        {data.method === 'bank_transfer' && 'Virement bancaire'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing || !data.sell_id || !data.amount}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer le paiement'}
                                </button>

                                <a
                                    href={route('admin.payments.index')}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Annuler
                                </a>
                            </div>
                        </div>

                        {/* Aide */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Conseils</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Vérifiez que le montant correspond au paiement reçu</li>
                                <li>• Indiquez la référence de transaction si disponible</li>
                                <li>• Le statut sera automatiquement défini selon la validation</li>
                                <li>• Le statut de paiement de la commande sera mis à jour automatiquement</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}