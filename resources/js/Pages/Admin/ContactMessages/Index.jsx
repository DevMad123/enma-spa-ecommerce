import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { 
    MagnifyingGlassIcon, 
    EnvelopeIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const statusConfig = {
    'new': {
        label: 'Nouveau',
        color: 'bg-blue-100 text-blue-800',
        icon: ExclamationCircleIcon
    },
    'in_progress': {
        label: 'En cours',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon
    },
    'resolved': {
        label: 'Résolu',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon
    }
};

export default function Index({ auth, messages, stats, statuses, filters }) {
    
    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins un message.');
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${selectedIds.length} message(s) ?`)) {
            router.post(route('admin.contact-messages.bulk-action'), {
                action: action,
                ids: selectedIds
            });
        }
    };

    const handleStatusUpdate = (messageId, newStatus) => {
        router.put(route('admin.contact-messages.update', messageId), {
            status: newStatus
        }, {
            preserveScroll: true
        });
    };

    // Configuration des colonnes pour DataTable
    const columns = [
        {
            key: 'contact',
            label: 'Contact',
            render: (message) => (
                <Link href={route('admin.contact-messages.show', message.id)} className="block hover:text-indigo-600 transition">
                    <div className="text-sm font-medium text-gray-900">{message.name}</div>
                    <div className="text-sm text-gray-500">{message.email}</div>
                </Link>
            )
        },
        {
            key: 'subject',
            label: 'Sujet',
            render: (message) => (
                <Link href={route('admin.contact-messages.show', message.id)} className="block hover:text-indigo-600 transition">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={message.subject}>
                        {message.subject}
                    </div>
                </Link>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (message) => (
                <select
                    value={message.status}
                    onChange={(e) => handleStatusUpdate(message.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${statusConfig[message.status]?.color}`}
                >
                    {Object.entries(statuses).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            )
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (message) => (
                <span className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            )
        }
    ];

    // Configuration des actions
    const actions = [
        {
            type: 'link',
            href: (message) => route('admin.contact-messages.show', message.id),
            icon: EyeIcon,
            label: 'Voir',
            className: 'text-indigo-600 hover:text-indigo-900'
        },
        {
            type: 'button',
            onClick: (message) => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
                    router.delete(route('admin.contact-messages.destroy', message.id));
                }
            },
            icon: TrashIcon,
            label: 'Supprimer',
            className: 'text-red-600 hover:text-red-900'
        }
    ];

    // Configuration des actions groupées
    const bulkActions = [
        {
            label: 'Marquer résolu',
            value: 'mark_as_resolved',
            icon: CheckCircleIcon,
            className: 'bg-green-600 text-white hover:bg-green-700'
        },
        {
            label: 'Supprimer',
            value: 'delete',
            icon: TrashIcon,
            className: 'bg-red-600 text-white hover:bg-red-700'
        }
    ];

    // Configuration des filtres
    const tableFilters = [
        {
            key: 'status',
            label: 'Statut',
            type: 'select',
            options: [
                { value: '', label: 'Tous les statuts' },
                ...Object.entries(statuses).map(([value, label]) => ({ value, label }))
            ]
        }
    ];

    const searchableFields = ['name', 'email', 'subject'];

    return (
        <AdminLayout>
            <Head title="Messages de Contact" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Messages de Contact</h1>
                        <p className="text-gray-600">Gérez les messages reçus via le formulaire de contact</p>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-gray-100 mr-4">
                                <EnvelopeIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                                <div className="text-sm text-gray-600">Total</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-blue-100 mr-4">
                                <ExclamationCircleIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                                <div className="text-sm text-gray-600">Nouveaux</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-yellow-100 mr-4">
                                <ClockIcon className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
                                <div className="text-sm text-gray-600">En cours</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-green-100 mr-4">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                                <div className="text-sm text-gray-600">Résolus</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-purple-100 mr-4">
                                <ClockIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{stats.recent}</div>
                                <div className="text-sm text-gray-600">7 derniers jours</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    data={messages.data || []}
                    columns={columns}
                    actions={actions}  
                    bulkActions={bulkActions}
                    searchableFields={searchableFields}
                    onBulkAction={handleBulkAction}
                    searchPlaceholder="Rechercher par nom, email ou sujet..."
                    pagination={messages.links ? {
                        from: messages.from,
                        to: messages.to,
                        total: messages.total,
                        links: messages.links
                    } : null}
                />
            </div>
        </AdminLayout>
    );
}