import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    UserIcon, 
    ArrowLeftIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    EnvelopeIcon,
    CalendarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Show({ user }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        if (status == 1 || status === '1') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Actif
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <XCircleIcon className="w-4 h-4 mr-1" />
                Inactif
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title={`Utilisateur - ${user.name}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <UserIcon className="h-6 w-6 text-gray-400 mr-3" />
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Détails de l'utilisateur
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Informations complètes sur {user.name}.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Link
                                        href={route('admin.users.edit', user.id)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Modifier
                                    </Link>
                                    <Link
                                        href={route('admin.users.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                        Retour
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                        {/* Profile Section */}
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0 h-20 w-20">
                                    <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-2xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-900">{user.name}</h4>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                                            {user.email}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="text-gray-400 mr-1">#</span>
                                            ID: {user.id}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        {getStatusBadge(user.status)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="border-t border-gray-200">
                            <dl>
                                {/* Email Verification */}
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Vérification email
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {user.email_verified_at ? (
                                            <div className="flex items-center">
                                                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                                <span className="text-green-600">
                                                    Vérifié le {formatDate(user.email_verified_at)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                                                <span className="text-red-600">Non vérifié</span>
                                            </div>
                                        )}
                                    </dd>
                                </div>

                                {/* Registration Date */}
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Date d'inscription
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </dd>
                                </div>

                                {/* Last Update */}
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Dernière modification
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            {formatDate(user.updated_at)}
                                        </div>
                                    </dd>
                                </div>

                                {/* Roles */}
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <ShieldCheckIcon className="h-4 w-4 mr-2" />
                                        Rôles assignés
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {user.roles && user.roles.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">Aucun rôle assigné</span>
                                        )}
                                    </dd>
                                </div>

                                {/* Status Details */}
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Statut du compte
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="space-y-2">
                                            <div>{getStatusBadge(user.status)}</div>
                                            <p className="text-xs text-gray-500">
                                                {(user.status == 1 || user.status === '1') 
                                                    ? 'L\'utilisateur peut se connecter et accéder à ses fonctionnalités.'
                                                    : 'L\'utilisateur ne peut pas se connecter tant que son compte n\'est pas activé.'
                                                }
                                            </p>
                                        </div>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        {/* Role Count */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Nombre de rôles
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {user.roles ? user.roles.length : 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Age */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CalendarIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Ancienneté (jours)
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {user.email_verified_at ? (
                                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <XCircleIcon className="h-6 w-6 text-red-600" />
                                        )}
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Email vérifié
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {user.email_verified_at ? 'Oui' : 'Non'}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}