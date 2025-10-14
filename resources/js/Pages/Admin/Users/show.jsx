import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    ClockIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function ShowUser({ user, currentUserId, flash }) {
    const handleDelete = (userId) => {
        // Empêcher la suppression de l'utilisateur actuel
        if (userId === currentUserId) {
            alert('Vous ne pouvez pas supprimer votre propre compte.');
            return;
        }

        // Empêcher la suppression des super administrateurs
        const hasAdminRole = user.roles && user.roles.some(role => 
            role.name === 'super_admin' || role.name === 'admin'
        );
        
        if (hasAdminRole) {
            if (!confirm(`ATTENTION: Vous tentez de supprimer un administrateur "${user.name}". Cette action est irréversible et peut affecter le fonctionnement du système. Êtes-vous absolument sûr ?`)) {
                return;
            }
        }

        if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ? Cette action est irréversible.`)) {
            router.delete(route('admin.users.destroy', userId));
        }
    };

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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Actif
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <XCircleIcon className="h-4 w-4 mr-1" />
                Inactif
            </span>
        );
    };

    const getAccountAge = () => {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <AdminLayout>
            <Head title={`Utilisateur - ${user.name}`} />

            {/* Messages Flash */}
            {flash?.success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )}

            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.users.index')}
                            className="flex items-center text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-1" />
                            Retour aux utilisateurs
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        {getStatusBadge(user.status)}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.users.edit', user.id)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Modifier
                        </Link>
                        <button
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === currentUserId}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs uppercase tracking-widest ${
                                user.id === currentUserId 
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title={user.id === currentUserId ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Supprimer cet utilisateur'}
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            {user.id === currentUserId ? 'Suppression interdite' : 'Supprimer'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Profil utilisateur */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            Profil utilisateur
                        </h2>
                        
                        <div className="flex items-center space-x-6 mb-6">
                            <div className="flex-shrink-0 h-20 w-20">
                                {user.avatar_url ? (
                                    <img 
                                        src={user.avatar_url} 
                                        alt={user.name}
                                        className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-2xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Nom complet</label>
                                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Adresse email</label>
                                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vérification et sécurité */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <ShieldCheckIcon className="h-5 w-5 mr-2" />
                            Vérification et sécurité
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Vérification email</label>
                                <div className="mt-1">
                                    {user.email_verified_at ? (
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                            <span className="text-sm text-green-600">
                                                Vérifié le {formatDate(user.email_verified_at)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                                            <span className="text-sm text-red-600">Non vérifié</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Statut du compte</label>
                                <div className="mt-1">
                                    <div>{getStatusBadge(user.status)}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {(user.status == 1 || user.status === '1') 
                                            ? 'L\'utilisateur peut se connecter et accéder à ses fonctionnalités.'
                                            : 'L\'utilisateur ne peut pas se connecter tant que son compte n\'est pas activé.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rôles et permissions */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <UserGroupIcon className="h-5 w-5 mr-2" />
                            Rôles et permissions
                        </h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-3">Rôles assignés</label>
                            {user.roles && user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role.id}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                        >
                                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>Aucun rôle assigné</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dates importantes */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            Historique du compte
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Date d'inscription</label>
                                <div className="mt-1 flex items-center">
                                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-900">{formatDate(user.created_at)}</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Dernière modification</label>
                                <div className="mt-1 flex items-center">
                                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-900">{formatDate(user.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne droite - Statistiques */}
                <div className="space-y-6">
                    
                    {/* Carte de résumé */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            Résumé
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">ID Utilisateur</span>
                                <span className="text-sm font-medium text-gray-900">#{user.id}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Statut</span>
                                {getStatusBadge(user.status)}
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Email vérifié</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {user.email_verified_at ? 'Oui' : 'Non'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Nombre de rôles</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {user.roles ? user.roles.length : 0}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Ancienneté</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {getAccountAge()} jours
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Dernière connexion</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {user.formatted_last_login || 'Jamais connecté'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques en cartes */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Nombre de rôles */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
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

                        {/* Ancienneté du compte */}
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
                                                {getAccountAge()}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statut de vérification */}
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