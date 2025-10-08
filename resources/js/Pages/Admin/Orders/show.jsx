import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatCurrency, formatDate, getCurrentCurrency, getCurrentCurrencySymbol, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    ArrowLeftIcon,
    PencilIcon,
    DocumentArrowDownIcon,
    UserIcon,
    ShoppingBagIcon,
    BanknotesIcon,
    TruckIcon,
    CalendarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function ShowOrder() {
    const { order, orderStatuses, paymentStatuses, flash, localeConfig } = usePage().props;
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);

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

    // Mettre à jour le statut via AJAX
    const updateStatus = async (statusType, newStatus) => {
        setIsUpdatingStatus(true);
        
        try {
            const response = await axios.patch(
                route('admin.orders.updateStatus', order.id),
                { [statusType]: newStatus }
            );

            if (response.data.success) {
                // Recharger la page pour voir les modifications
                router.reload({ only: ['order'] });
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            alert('Erreur lors de la mise à jour du statut');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Obtenir le badge de statut de commande
    const getOrderStatusBadge = (status) => {
        const statusConfig = {
            0: { class: 'bg-yellow-100 text-yellow-800', text: orderStatuses[0] },
            1: { class: 'bg-blue-100 text-blue-800', text: orderStatuses[1] },
            2: { class: 'bg-purple-100 text-purple-800', text: orderStatuses[2] },
            3: { class: 'bg-orange-100 text-orange-800', text: orderStatuses[3] },
            4: { class: 'bg-red-100 text-red-800', text: orderStatuses[4] },
            5: { class: 'bg-red-100 text-red-800', text: orderStatuses[5] },
            6: { class: 'bg-green-100 text-green-800', text: orderStatuses[6] },
        };
        
        const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: 'Inconnu' };
        
        return (
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.class}`}>
                {config.text}
            </span>
        );
    };

    // Obtenir le badge de statut de paiement
    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            0: { class: 'bg-red-100 text-red-800', text: paymentStatuses[0] },
            1: { class: 'bg-green-100 text-green-800', text: paymentStatuses[1] },
            2: { class: 'bg-yellow-100 text-yellow-800', text: paymentStatuses[2] },
            3: { class: 'bg-purple-100 text-purple-800', text: paymentStatuses[3] },
        };
        
        const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: 'Inconnu' };
        
        return (
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.class}`}>
                {config.text}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title={`Commande ${order.order_reference || `#${order.id}`}`} />

            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.orders.index')}
                            className="flex items-center text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-1" />
                            Retour aux commandes
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Commande {order.order_reference || `#${order.id}`}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Créée le {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {order.order_status < 6 && (
                            <Link
                                href={route('admin.orders.edit', order.id)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Modifier
                            </Link>
                        )}
                        
                        <a
                            href={route('admin.orders.downloadInvoice', order.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Télécharger
                        </a>
                    </div>
                </div>
            </div>

            {/* Messages Flash */}
            {flash.success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Informations client */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            Informations Client
                        </h2>
                        
                        {order.customer ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Nom complet</div>
                                    <div className="text-base text-gray-900">
                                        {order.customer.first_name} {order.customer.last_name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Email</div>
                                    <div className="text-base text-gray-900">{order.customer.email}</div>
                                </div>
                                {order.customer.phone_one && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Téléphone principal</div>
                                        <div className="text-base text-gray-900">{order.customer.phone_one}</div>
                                    </div>
                                )}
                                {order.customer.phone_two && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Téléphone secondaire</div>
                                        <div className="text-base text-gray-900">{order.customer.phone_two}</div>
                                    </div>
                                )}
                                {order.customer.present_address && (
                                    <div className="md:col-span-2">
                                        <div className="text-sm font-medium text-gray-500">Adresse de livraison</div>
                                        <div className="text-base text-gray-900">{order.customer.present_address}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-500">Client non trouvé</div>
                        )}
                    </div>

                    {/* Articles de la commande */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <ShoppingBagIcon className="h-5 w-5 mr-2" />
                            Articles Commandés ({order.sell_details?.length || 0})
                        </h2>

                        {order.sell_details && order.sell_details.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Produit
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Prix unitaire
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantité
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Remise
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.sell_details.map((detail, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {detail.product?.name || 'Produit supprimé'}
                                                    </div>
                                                    {detail.product_variant && (
                                                        <div className="text-sm text-gray-500">
                                                            Variante: {detail.product_variant.variant_name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(parseFloat(detail.unit_sell_price))}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {parseFloat(detail.sale_quantity)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(parseFloat(detail.total_discount || 0))}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {formatCurrency(parseFloat(detail.total_payable_amount))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-gray-500 py-4">Aucun article dans cette commande</div>
                        )}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2" />
                                Notes
                            </h2>
                            <div className="text-gray-900 whitespace-pre-wrap">{order.notes}</div>
                        </div>
                    )}
                </div>

                {/* Colonne droite - Résumé et statuts */}
                <div className="space-y-6">
                    
                    {/* Résumé financier */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <BanknotesIcon className="h-5 w-5 mr-2" />
                            Résumé Financier
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Sous-total articles:</span>
                                <span className="text-gray-900">
                                    {formatCurrency(parseFloat(order.total_payable_amount) - parseFloat(order.shipping_cost) - parseFloat(order.total_vat_amount) + parseFloat(order.total_discount))}
                                </span>
                            </div>

                            {parseFloat(order.total_vat_amount) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">TVA:</span>
                                    <span className="text-gray-900">{formatCurrency(parseFloat(order.total_vat_amount))}</span>
                                </div>
                            )}

                            {parseFloat(order.shipping_cost) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Frais de livraison:</span>
                                    <span className="text-gray-900">{formatCurrency(parseFloat(order.shipping_cost))}</span>
                                </div>
                            )}

                            {parseFloat(order.total_discount) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Remise totale:</span>
                                    <span className="text-red-600">-{formatCurrency(parseFloat(order.total_discount))}</span>
                                </div>
                            )}

                            <div className="border-t pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total à payer:</span>
                                    <span>{formatCurrency(parseFloat(order.total_payable_amount))}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Montant payé:</span>
                                <span className="text-green-600">{formatCurrency(parseFloat(order.total_paid))}</span>
                            </div>

                            {parseFloat(order.total_due) > 0 && (
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500">Montant dû:</span>
                                    <span className="text-red-600">{formatCurrency(parseFloat(order.total_due))}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statuts */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Statuts</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                    Statut de la commande
                                </label>
                                <div className="flex items-center space-x-3">
                                    {getOrderStatusBadge(order.order_status)}
                                    {order.order_status < 6 && (
                                        <select
                                            value={order.order_status}
                                            onChange={(e) => updateStatus('order_status', parseInt(e.target.value))}
                                            disabled={isUpdatingStatus}
                                            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            {Object.entries(orderStatuses).map(([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                    Statut du paiement
                                </label>
                                <div className="flex items-center space-x-3">
                                    {getPaymentStatusBadge(order.payment_status)}
                                    <select
                                        value={order.payment_status}
                                        onChange={(e) => updateStatus('payment_status', parseInt(e.target.value))}
                                        disabled={isUpdatingStatus}
                                        className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {Object.entries(paymentStatuses).map(([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations de livraison */}
                    {(order.shipping_method || parseFloat(order.shipping_cost) > 0) && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <TruckIcon className="h-5 w-5 mr-2" />
                                Livraison
                            </h2>

                            <div className="space-y-3">
                                {order.shipping_method && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Méthode</div>
                                        <div className="text-base text-gray-900">{order.shipping_method}</div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm font-medium text-gray-500">Coût</div>
                                    <div className="text-base text-gray-900">{formatCurrency(parseFloat(order.shipping_cost))}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Informations système */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <CalendarIcon className="h-5 w-5 mr-2" />
                            Informations Système
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-gray-500">ID Commande</div>
                                <div className="text-gray-900">#{order.id}</div>
                            </div>

                            <div>
                                <div className="text-gray-500">Date de création</div>
                                <div className="text-gray-900">
                                    {formatDate(order.created_at)}
                                </div>
                            </div>

                            {order.updated_at !== order.created_at && (
                                <div>
                                    <div className="text-gray-500">Dernière modification</div>
                                    <div className="text-gray-900">
                                        {formatDate(order.updated_at)}
                                    </div>
                                </div>
                            )}

                            {order.created_by && (
                                <div>
                                    <div className="text-gray-500">Créée par</div>
                                    <div className="text-gray-900">{order.created_by.name}</div>
                                </div>
                            )}

                            {order.updated_by && order.updated_by.id !== order.created_by?.id && (
                                <div>
                                    <div className="text-gray-500">Modifiée par</div>
                                    <div className="text-gray-900">{order.updated_by.name}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}