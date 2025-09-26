import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    EnvelopeIcon,
    UserIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    TrashIcon,
    CalendarIcon
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

export default function Show({ auth, message, statuses }) {
    const handleStatusUpdate = (newStatus) => {
        router.put(route('admin.contact-messages.update', message.id), {
            status: newStatus
        });
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.')) {
            router.delete(route('admin.contact-messages.destroy', message.id));
        }
    };

    const StatusIcon = statusConfig[message.status]?.icon || ExclamationCircleIcon;

    return (
        <AdminLayout>
            <Head title={`Message de Contact - ${message.name}`} />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={route('admin.contact-messages.index')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-6 w-6" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Message de Contact #{message.id}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            {/* En-tête avec informations principales */}
                            <div className="border-b border-gray-200 pb-6 mb-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-5 w-5 text-gray-600" />
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {message.name}
                                                </span>
                                            </div>
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[message.status]?.color}`}>
                                                <StatusIcon className="h-4 w-4 mr-2" />
                                                {statusConfig[message.status]?.label}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <EnvelopeIcon className="h-4 w-4" />
                                                <span>{message.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>
                                                    {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {message.subject}
                                        </h3>
                                    </div>

                                    <div className="flex flex-col space-y-2 ml-6">
                                        <select
                                            value={message.status}
                                            onChange={(e) => handleStatusUpdate(e.target.value)}
                                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        >
                                            {Object.entries(statuses).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={handleDelete}
                                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <TrashIcon className="h-4 w-4 mr-2" />
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu du message */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Message :</h4>
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                                            {message.message}
                                        </div>
                                    </div>
                                </div>

                                {/* Informations techniques */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Informations techniques :</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">ID du message :</span> #{message.id}
                                        </div>
                                        <div>
                                            <span className="font-medium">Date de réception :</span> {
                                                new Date(message.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })
                                            }
                                        </div>
                                        <div>
                                            <span className="font-medium">Dernière modification :</span> {
                                                new Date(message.updated_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })
                                            }
                                        </div>
                                        <div>
                                            <span className="font-medium">Statut actuel :</span> {statusConfig[message.status]?.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions rapides */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <a
                                        href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                                        Répondre par email
                                    </a>

                                    {message.status !== 'resolved' && (
                                        <button
                                            onClick={() => handleStatusUpdate('resolved')}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                            Marquer comme résolu
                                        </button>
                                    )}

                                    {message.status === 'new' && (
                                        <button
                                            onClick={() => handleStatusUpdate('in_progress')}
                                            className="inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 active:bg-yellow-900 focus:outline-none focus:border-yellow-900 focus:ring ring-yellow-300 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            <ClockIcon className="h-4 w-4 mr-2" />
                                            Prendre en charge
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 flex justify-center">
                        <Link 
                            href={route('admin.contact-messages.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour à la liste
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}