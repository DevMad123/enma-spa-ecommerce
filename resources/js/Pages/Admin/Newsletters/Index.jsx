import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import {
    EnvelopeIcon,
    UsersIcon,
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Index({ newsletters, stats }) {
    
    const handleDelete = (newsletterId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) {
            router.delete(route('admin.newsletters.destroy', newsletterId));
        }
    };

    const handleExport = () => {
        window.location.href = route('admin.newsletters.export');
    };

    // Fonction pour gérer les actions groupées
    const handleBulkAction = (action, selectedIds) => {
        if (action === 'export') {
            const exportParams = new URLSearchParams({ids: selectedIds.join(',')});
            window.location.href = route('admin.newsletters.export') + '?' + exportParams.toString();
        } else if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} abonné(s) ?`)) {
                router.delete(route('admin.newsletters.bulk-delete'), {
                    data: { ids: selectedIds }
                });
            }
        }
    };

    // Configuration DataTable
    const columns = [
        {
            key: 'email',
            label: 'Email',
            render: (newsletter) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {newsletter.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (newsletter) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    newsletter.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {newsletter.is_active ? 'Actif' : 'Inactif'}
                </span>
            )
        },
        {
            key: 'subscribed_at',
            label: 'Date d\'inscription',
            render: (newsletter) => (
                <span className="text-sm text-gray-500">
                    {new Date(newsletter.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            )
        },
        {
            key: 'source',
            label: 'Source',
            render: (newsletter) => (
                <span className="text-sm text-gray-900">
                    {newsletter.source || 'Site web'}
                </span>
            )
        }
    ];

    const actions = [
        {
            type: 'button',
            onClick: (newsletter) => handleDelete(newsletter.id),
            icon: TrashIcon,
            label: 'Supprimer',
            className: 'text-red-600 hover:text-red-900'
        }
    ];

    const bulkActions = [
        {
            label: 'Exporter CSV',
            value: 'export',
            icon: ArrowDownTrayIcon,
            className: 'bg-green-600 text-white hover:bg-green-700'
        },
        {
            label: 'Supprimer',
            value: 'delete',
            icon: TrashIcon,
            className: 'bg-red-600 text-white hover:bg-red-700'
        }
    ];

    const searchableFields = ['email'];

    return (
        <AdminLayout>
            <Head title="Newsletter - Abonnés" />

            <div className="mb-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez les abonnés à votre newsletter
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex-none">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Exporter CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UsersIcon className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total abonnés
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.total || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Abonnés actifs
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.active || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CalendarDaysIcon className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Ce mois
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.this_month || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Taux d'engagement
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.engagement_rate || '0'}%
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DataTable */}
            <DataTable
                data={newsletters.data || []}
                columns={columns}
                actions={actions}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par email..."
                pagination={newsletters.links ? {
                    from: newsletters.from,
                    to: newsletters.to,
                    total: newsletters.total,
                    links: newsletters.links
                } : null}
            />
        </AdminLayout>
    );
}