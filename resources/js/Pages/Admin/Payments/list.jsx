import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    PlusIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function PaymentList({ 
    payments, 
    stats, 
    sells, 
    filters, 
    paymentMethods, 
    paymentStatuses,
    flash 
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);

    const handleFilterChange = (filterName, value) => {
        const updatedFilters = { ...filters, [filterName]: value };
        
        // Reset to first page when filters change
        delete updatedFilters.page;
        
        router.get(route('admin.payments.index'), updatedFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const search = e.target.search.value;
        handleFilterChange('search', search);
    };

    const clearFilters = () => {
        router.get(route('admin.payments.index'));
    };

    const confirmDelete = (payment) => {
        setPaymentToDelete(payment);
    };

    const deletePayment = () => {
        if (paymentToDelete) {
            router.delete(route('admin.payments.destroy', paymentToDelete.id), {
                onSuccess: () => {
                    setPaymentToDelete(null);
                }
            });
        }
    };

    const handleExport = () => {
        const exportParams = new URLSearchParams(filters);
        window.location.href = route('admin.payments.export') + '?' + exportParams.toString();
    };

    const getStatusBadge = (status, color) => {
        const colors = {
            yellow: 'bg-yellow-100 text-yellow-800',
            green: 'bg-green-100 text-green-800',
            red: 'bg-red-100 text-red-800',
            orange: 'bg-orange-100 text-orange-800',
            gray: 'bg-gray-100 text-gray-800',
        };

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[color] || colors.gray}`}>
                {paymentStatuses[status] || status}
            </span>
        );
    };

    const quickActions = (payment) => (
        <div className="flex space-x-1">
            {payment.status === 'pending' && (
                <>
                    <button
                        onClick={() => router.patch(route('admin.payments.validate', payment.id), {})}
                        className="text-green-600 hover:text-green-900"
                        title="Valider le paiement"
                    >
                        <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => router.patch(route('admin.payments.reject', payment.id), { reason: 'Rejeté manuellement' })}
                        className="text-red-600 hover:text-red-900"
                        title="Rejeter le paiement"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </>
            )}
            {payment.status === 'success' && (
                <button
                    onClick={() => router.patch(route('admin.payments.refund', payment.id), { reason: 'Remboursement demandé' })}
                    className="text-orange-600 hover:text-orange-900"
                    title="Rembourser"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Paiements" />

            <div className="mb-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez tous les paiements et transactions
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex-none">
                        <Link
                            href={route('admin.payments.create')}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau paiement
                        </Link>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-700">{flash.success}</div>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{flash.error}</div>
                    </div>
                )}
            </div>

            {/* Statistiques */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                                    <span className="text-white font-medium">P</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total paiements</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.total_payments}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <CheckIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Réussis</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.successful_payments}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                    <span className="text-white font-medium">?</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.pending_payments}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-xs">XOF</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Montant total</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {new Intl.NumberFormat('fr-FR').format(stats.total_amount || 0)} XOF
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Rechercher par référence, commande..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <FunnelIcon className="h-4 w-4 mr-2" />
                            Filtres
                        </button>

                        <button
                            type="button"
                            onClick={handleExport}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Export
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Rechercher
                        </button>
                    </form>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Méthode
                                    </label>
                                    <select
                                        value={filters.method || ''}
                                        onChange={(e) => handleFilterChange('method', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Toutes les méthodes</option>
                                        {Object.entries(paymentMethods).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tous les statuts</option>
                                        {Object.entries(paymentStatuses).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date début
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date_from || ''}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date fin
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date_to || ''}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Effacer les filtres
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tableau des paiements */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Paiement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Commande
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Méthode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Montant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.data && payments.data.length > 0 ? (
                                payments.data.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{payment.id}
                                            </div>
                                            {payment.transaction_reference && (
                                                <div className="text-sm text-gray-500">
                                                    {payment.transaction_reference}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.sell ? (
                                                <Link
                                                    href={route('admin.orders.show', payment.sell.id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {payment.sell.order_reference}
                                                </Link>
                                            ) : (
                                                <span className="text-sm text-gray-500">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.sell && payment.sell.customer ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {payment.sell.customer.first_name} {payment.sell.customer.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {payment.sell.customer.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {paymentMethods[payment.method] || payment.method}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {new Intl.NumberFormat('fr-FR').format(payment.amount)} {payment.currency}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status, payment.status_color)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {quickActions(payment)}
                                                
                                                <Link
                                                    href={route('admin.payments.show', payment.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                
                                                {['pending', 'failed'].includes(payment.status) && (
                                                    <Link
                                                        href={route('admin.payments.edit', payment.id)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                )}
                                                
                                                {['pending', 'failed', 'cancelled'].includes(payment.status) && (
                                                    <button
                                                        onClick={() => confirmDelete(payment)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Aucun paiement trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {payments.links && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{payments.from}</span> à{' '}
                                <span className="font-medium">{payments.to}</span> sur{' '}
                                <span className="font-medium">{payments.total}</span> résultats
                            </div>
                            <div className="flex space-x-2">
                                {payments.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            {paymentToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">
                                Supprimer le paiement
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Êtes-vous sûr de vouloir supprimer ce paiement #{paymentToDelete.id} ? 
                                    Cette action ne peut pas être annulée.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    onClick={() => setPaymentToDelete(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={deletePayment}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
