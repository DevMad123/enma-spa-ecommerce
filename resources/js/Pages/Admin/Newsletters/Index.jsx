import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    MagnifyingGlassIcon, 
    EnvelopeIcon,
    UsersIcon,
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const periodOptions = [
    { value: '', label: 'Toutes les périodes' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'recent', label: '30 derniers jours' },
];

export default function Index({ auth, newsletters, stats, evolution, filters }) {
    const [selectedNewsletters, setSelectedNewsletters] = useState([]);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [periodFilter, setPeriodFilter] = useState(filters.period || '');

    const handleSelectAll = () => {
        if (isSelectAll) {
            setSelectedNewsletters([]);
        } else {
            setSelectedNewsletters(newsletters.data.map(newsletter => newsletter.id));
        }
        setIsSelectAll(!isSelectAll);
    };

    const handleSelectNewsletter = (newsletterId) => {
        setSelectedNewsletters(prev => {
            if (prev.includes(newsletterId)) {
                return prev.filter(id => id !== newsletterId);
            } else {
                return [...prev, newsletterId];
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedNewsletters.length === 0) {
            alert('Veuillez sélectionner au moins un abonnement.');
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedNewsletters.length} abonnement(s) ?`)) {
            router.post(route('admin.newsletters.bulk-delete'), {
                ids: selectedNewsletters
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.newsletters.index'), {
            search: searchTerm,
            period: periodFilter
        }, {
            preserveState: true
        });
    };

    const handleExport = () => {
        window.open(route('admin.newsletters.export', {
            search: searchTerm,
            period: periodFilter
        }));
    };

    const handleDelete = (newsletterId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
            router.delete(route('admin.newsletters.destroy', newsletterId));
        }
    };

    return (
        <AdminLayout>
            <Head title="Newsletter - Abonnés" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Newsletter - Abonnés</h1>
                </div>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <UsersIcon className="h-8 w-8 text-gray-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total abonnés</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                                    <p className="text-2xl font-semibold text-blue-900">{stats.today}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Cette semaine</p>
                                    <p className="text-2xl font-semibold text-green-900">{stats.this_week}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Ce mois</p>
                                    <p className="text-2xl font-semibold text-purple-900">{stats.this_month}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <EnvelopeIcon className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">30 derniers jours</p>
                                    <p className="text-2xl font-semibold text-orange-900">{stats.recent_30_days}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Graphique d'évolution */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des abonnements (7 derniers jours)</h3>
                            <div className="flex justify-between items-end h-32 space-x-2">
                                {evolution.map((item, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div 
                                            className="w-full bg-indigo-500 rounded-t transition-all duration-300"
                                            style={{ 
                                                height: `${Math.max((item.count / Math.max(...evolution.map(e => e.count)) * 100), 5)}%`,
                                                minHeight: '4px'
                                            }}
                                        ></div>
                                        <div className="text-xs text-center mt-2">
                                            <div className="font-semibold text-gray-900">{item.count}</div>
                                            <div className="text-gray-500">{new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Filtres et recherche */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <form onSubmit={handleSearch} className="flex">
                                    <div className="relative flex-1">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Rechercher par email..."
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
                                    value={periodFilter}
                                    onChange={(e) => setPeriodFilter(e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {periodOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleExport}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Exporter CSV
                                </button>

                                <button
                                    onClick={handleBulkDelete}
                                    disabled={selectedNewsletters.length === 0}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Supprimer sélection
                                </button>
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
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date d'abonnement
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {newsletters.data.map((newsletter) => (
                                            <tr key={newsletter.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedNewsletters.includes(newsletter.id)}
                                                        onChange={() => handleSelectNewsletter(newsletter.id)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{newsletter.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900">{newsletter.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(newsletter.subscribed_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <a
                                                            href={`mailto:${newsletter.email}`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Envoyer un email"
                                                        >
                                                            <EnvelopeIcon className="h-4 w-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(newsletter.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Supprimer l'abonnement"
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

                            {newsletters.data.length === 0 && (
                                <div className="text-center py-8">
                                    <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun abonnement</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Aucun abonnement à la newsletter trouvé pour les critères sélectionnés.
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {newsletters.links && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Affichage de {newsletters.from} à {newsletters.to} sur {newsletters.total} résultats
                                    </div>
                                    <div className="flex space-x-1">
                                        {newsletters.links.map((link, index) => (
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