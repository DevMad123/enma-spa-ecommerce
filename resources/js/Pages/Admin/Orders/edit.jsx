import React, { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatDate, formatCurrency } from '@/Utils/LocaleUtils';
import {
    ArrowLeftIcon,
    UserIcon,
    TruckIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function EditOrder() {
    const { order, customers, orderStatuses, paymentStatuses, localeConfig } = usePage().props;
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        order_status: order?.order_status || 0,
        notes: order?.notes || '',
    });

    // Initialiser la configuration de locale
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
            setIsLocaleInitialized(true);
        }
    }, [localeConfig]);

    // Afficher un écran de chargement si la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }

    // Calculer les totaux
    const calculateTotals = () => {
        // Essayer les deux conventions de nommage
        const details = order?.sellDetails || order?.sell_details || [];
        
        const subtotal = details.reduce((sum, item) => {
            return sum + (parseFloat(item.unit_sell_price) * parseInt(item.sale_quantity));
        }, 0) || 0;
        
        const shipping = parseFloat(order?.shipping_cost) || 0;
        const discount = parseFloat(order?.total_discount) || 0;
        const total = subtotal + shipping - discount;
        const totalPaid = parseFloat(order?.total_paid) || 0;
        const totalDue = total - totalPaid;

        return {
            subtotal,
            shipping,
            discount,
            total,
            totalPaid,
            totalDue: Math.max(0, totalDue)
        };
    };

    // Soumettre les modifications
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.orders.update', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                // La redirection est gérée par le contrôleur
            }
        });
    };

    // Vérifier si la commande peut être modifiée
    const canEdit = order?.order_status < 6;
    const isInCancellationProcess = order?.order_status >= 3 && order?.order_status <= 5;

    const totals = calculateTotals();

    // Obtenir le badge de statut
    const getOrderStatusBadge = (status) => {
        const colors = {
            0: 'bg-yellow-100 text-yellow-800',
            1: 'bg-blue-100 text-blue-800', 
            2: 'bg-purple-100 text-purple-800',
            3: 'bg-orange-100 text-orange-800',
            4: 'bg-red-100 text-red-800',
            5: 'bg-red-100 text-red-800',
            6: 'bg-green-100 text-green-800'
        };
        
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {orderStatuses[status] || 'Inconnu'}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const colors = {
            0: 'bg-red-100 text-red-800',
            1: 'bg-green-100 text-green-800',
            2: 'bg-yellow-100 text-yellow-800',
            3: 'bg-blue-100 text-blue-800'
        };
        
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {paymentStatuses[status] || 'Inconnu'}
            </span>
        );
    };

    if (!canEdit) {
        return (
            <AdminLayout>
                <Head title={`Modification Commande #${order?.id}`} />
                
                <div className="max-w-4xl mx-auto">
                    {/* En-tête avec alerte */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.visit(route('admin.orders.show', order.id))}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                    Retour
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Modification Commande #{order?.id}
                                </h1>
                            </div>
                        </div>

                        {/* Alerte commande non modifiable */}
                        <div className="rounded-md bg-red-50 border border-red-200 p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Commande non modifiable
                                    </h3>
                                    <p className="mt-1 text-sm text-red-700">
                                        Cette commande est terminée et ne peut plus être modifiée. 
                                        Statut actuel : {getOrderStatusBadge(order?.order_status)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title={`Modification Commande #${order?.id}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* En-tête */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.visit(route('admin.orders.show', order.id))}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Retour
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Modification Commande #{order?.id}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            {getOrderStatusBadge(order?.order_status)}
                            {getPaymentStatusBadge(order?.payment_status)}
                        </div>
                    </div>

                    {/* Alerte si processus d'annulation */}
                    {isInCancellationProcess && (
                        <div className="rounded-md bg-orange-50 border border-orange-200 p-4 mb-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-orange-800">
                                        Commande en processus d'annulation
                                    </h3>
                                    <p className="mt-1 text-sm text-orange-700">
                                        Cette commande est en cours d'annulation. Seuls certains champs peuvent être modifiés.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info sur les limitations */}
                    <div className="rounded-md bg-blue-50 border border-blue-200 p-4 mb-4">
                        <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Modification limitée pour la sécurité
                                </h3>
                                <p className="mt-1 text-sm text-blue-700">
                                    Pour des raisons de sécurité et d'intégrité financière, seuls le statut de la commande et les notes peuvent être modifiés. 
                                    Le statut de paiement sera automatiquement mis à jour lors de l'enregistrement des paiements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations client (lecture seule) */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                                Informations Client
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom complet
                                    </label>
                                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                                        {order?.customer?.first_name} {order?.customer?.last_name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                                        {order?.customer?.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Articles commandés (lecture seule) */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Articles commandés ({(order?.sellDetails || order?.sell_details || []).length})
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            {(() => {
                                const details = order?.sellDetails || order?.sell_details || [];
                                
                                if (details.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Aucun article trouvé pour cette commande.</p>
                                            <p className="text-sm mt-2 text-red-600">
                                                Vérifiez que la commande contient des articles dans la table sell_details 
                                                avec sell_id = {order?.id}
                                            </p>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div className="space-y-4">
                                        {details.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {item.product?.name || `Produit supprimé (ID: ${item.product_id})`}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Prix unitaire: {formatCurrency(item.unit_sell_price)}
                                                    </p>
                                                    {item.product_variant_id && (
                                                        <p className="text-xs text-gray-500">
                                                            Variante ID: {item.product_variant_id}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">
                                                        Qté: {parseInt(item.sale_quantity)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Total: {formatCurrency(item.unit_sell_price * parseInt(item.sale_quantity))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Informations de commande (lecture seule) */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <TruckIcon className="w-5 h-5 mr-2 text-gray-400" />
                                Informations de livraison et facturation
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Frais de livraison
                                    </label>
                                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                                        {formatCurrency(order?.shipping_cost || 0)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Méthode de livraison
                                    </label>
                                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                                        {order?.shipping?.name || order?.shipping_method || 'Non spécifiée'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remise totale
                                    </label>
                                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                                        {formatCurrency(order?.total_discount || 0)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Montant payé
                                    </label>
                                    <div className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                                        {formatCurrency(order?.total_paid || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statuts */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-gray-400" />
                                Statut de la commande
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut de la commande
                                    </label>
                                    <select
                                        value={data.order_status}
                                        onChange={(e) => setData('order_status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {Object.entries(orderStatuses).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                    {errors.order_status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.order_status}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut du paiement (lecture seule)
                                    </label>
                                    <div className="text-sm py-2 px-3 bg-gray-50 rounded-md flex items-center">
                                        {getPaymentStatusBadge(order?.payment_status)}
                                        <span className="ml-2 text-xs text-gray-500">
                                            (Modifié automatiquement lors des paiements)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" />
                                Notes
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Notes sur la commande..."
                            />
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                            )}
                        </div>
                    </div>

                    {/* Résumé financier */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-400" />
                                Résumé financier
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sous-total articles:</span>
                                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Frais de livraison:</span>
                                    <span className="font-medium">{formatCurrency(totals.shipping)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Remise:</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(totals.discount)}</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total à payer:</span>
                                        <span>{formatCurrency(totals.total)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Montant payé:</span>
                                    <span className="font-medium text-green-600">{formatCurrency(totals.totalPaid)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Montant dû:</span>
                                    <span className={`font-medium ${totals.totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(totals.totalDue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.visit(route('admin.orders.show', order.id))}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}