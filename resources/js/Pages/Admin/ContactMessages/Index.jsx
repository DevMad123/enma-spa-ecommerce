import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
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
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSelectAll = () => {
        if (isSelectAll) {
            setSelectedMessages([]);
        } else {
            setSelectedMessages(messages.data.map(message => message.id));
        }
        setIsSelectAll(!isSelectAll);
    };

    const handleSelectMessage = (messageId) => {
        setSelectedMessages(prev => {
            if (prev.includes(messageId)) {
                return prev.filter(id => id !== messageId);
            } else {
                return [...prev, messageId];
            }
        });
    };

    const handleBulkAction = (action) => {
        if (selectedMessages.length === 0) {
            alert('Veuillez sélectionner au moins un message.');
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${selectedMessages.length} message(s) ?`)) {
            router.post(route('admin.contact-messages.bulk-action'), {
                action: action,
                ids: selectedMessages
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.contact-messages.index'), {
            search: searchTerm,
            status: statusFilter
        }, {
            preserveState: true
        });
    };

    const handleStatusUpdate = (messageId, newStatus) => {
        router.put(route('admin.contact-messages.update', messageId), {
            status: newStatus
        }, {
            preserveScroll: true
        });
    };

    return (
        <AdminLayout>
            <Head title="Messages de Contact" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Messages de Contact</h1>
                </div>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <EnvelopeIcon className="h-8 w-8 text-gray-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <ExclamationCircleIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Nouveaux</p>
                                    <p className="text-2xl font-semibold text-blue-900">{stats.new}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <ClockIcon className="h-8 w-8 text-yellow-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">En cours</p>
                                    <p className="text-2xl font-semibold text-yellow-900">{stats.in_progress}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Résolus</p>
                                    <p className="text-2xl font-semibold text-green-900">{stats.resolved}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <ClockIcon className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">7 derniers jours</p>
                                    <p className="text-2xl font-semibold text-purple-900">{stats.recent}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Filtres et recherche */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <form onSubmit={handleSearch} className="flex">
                                    <div className="relative flex-1">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        Rechercher
                                    </button>
                                </form>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Tous les statuts</option>
                                    {Object.entries(statuses).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleBulkAction('mark_as_resolved')}
                                        disabled={selectedMessages.length === 0}
                                        className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Marquer résolu
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        disabled={selectedMessages.length === 0}
                                        className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>

                            {/* Tableau */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelectAll}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sujet
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {messages.data.map((message) => (
                                            <tr key={message.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMessages.includes(message.id)}
                                                        onChange={() => handleSelectMessage(message.id)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {message.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {message.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {message.subject}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={message.status}
                                                        onChange={(e) => handleStatusUpdate(message.id, e.target.value)}
                                                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${statusConfig[message.status]?.color}`}
                                                    >
                                                        {Object.entries(statuses).map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('admin.contact-messages.show', message.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
                                                                    router.delete(route('admin.contact-messages.destroy', message.id));
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {messages.links && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Affichage de {messages.from} à {messages.to} sur {messages.total} résultats
                                    </div>
                                    <div className="flex space-x-1">
                                        {messages.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm border rounded ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                preserveScroll
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}