import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon,
    UserIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function EditUser({ user, roles }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        status: user.status === 1 || user.status === true || user.status === '1',
        roles: user.roles ? user.roles.map(role => role.id) : [],
        _method: 'PUT',
    });

    const handleRoleChange = (roleId) => {
        const newRoles = data.roles.includes(roleId)
            ? data.roles.filter(id => id !== roleId)
            : [...data.roles, roleId];
        
        setData('roles', newRoles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Préparer FormData pour la cohérence avec les autres entités
        const formData = new FormData();
        
        // Ajouter tous les champs du formulaire
        Object.keys(data).forEach(key => {
            if (key === 'roles') {
                // Ajouter chaque rôle individuellement
                data[key].forEach(roleId => {
                    formData.append('roles[]', roleId);
                });
            } else {
                formData.append(key, data[key]);
            }
        });

        console.log('📦 Données envoyées:', Object.fromEntries(formData));

        // Envoyer via router.post pour la cohérence
        router.post(route('admin.users.update', user.id), formData, {
            onStart: () => {
                console.log('🚀 Début de la requête PUT');
            },
            onSuccess: (data) => {
                console.log('✅ Succès:', data);
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                console.log('🏁 Requête terminée');
            }
        });
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

    return (
        <AdminLayout>
            <Head title={`Modifier: ${user.name}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.users.index')}
                                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Retour aux utilisateurs
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('admin.users.show', user.id)}
                                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Voir
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold text-gray-900">Modifier l'utilisateur</h1>
                        <p className="mt-2 text-gray-600">{user.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informations de base */}
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>
                                    </div>
                                </div>
                                <div className="px-6 py-6 space-y-6">
                                    {/* Nom complet */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Ex: Jean Dupont"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Adresse email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Ex: jean.dupont@example.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mot de passe */}
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Changer le mot de passe</h3>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Laissez vide si vous ne souhaitez pas changer le mot de passe.
                                    </p>
                                </div>
                                <div className="px-6 py-6 space-y-6">
                                    {/* Nouveau mot de passe */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                    errors.password ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Confirmation mot de passe */}
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmer le nouveau mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswordConfirm ? 'text' : 'password'}
                                                id="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={`block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                    errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            >
                                                {showPasswordConfirm ? (
                                                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Statut */}
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
                                    </div>
                                </div>
                                <div className="px-6 py-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                                            Utilisateur actif
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Rôles et permissions */}
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">Rôles et Permissions</h3>
                                    </div>
                                </div>
                                <div className="px-6 py-6">
                                    <div className="space-y-3">
                                        {roles && roles.length > 0 ? (
                                            roles.map((role) => (
                                                <div key={role.id} className="flex items-start">
                                                    <input
                                                        id={`role_${role.id}`}
                                                        type="checkbox"
                                                        checked={data.roles.includes(role.id)}
                                                        onChange={() => handleRoleChange(role.id)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                                                    />
                                                    <div className="ml-3">
                                                        <label htmlFor={`role_${role.id}`} className="block text-sm font-medium text-gray-900">
                                                            {role.name}
                                                        </label>
                                                        {role.description && (
                                                            <p className="text-sm text-gray-500">
                                                                {role.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">Aucun rôle disponible.</p>
                                        )}
                                    </div>
                                    {errors.roles && (
                                        <p className="mt-2 text-sm text-red-600">{errors.roles}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-4 bg-gray-50 px-6 py-4 rounded-lg border">
                                <Link
                                    href={route('admin.users.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {processing ? 'Modification...' : 'Modifier l\'utilisateur'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Panneau d'aperçu */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 sticky top-8">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Aperçu</h3>
                            </div>
                            <div className="px-6 py-6 space-y-6">
                                {/* Avatar utilisateur */}
                                <div className="text-center">
                                    <div className="mx-auto h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                                        {data.name ? data.name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="mt-2 text-lg font-medium text-gray-900">
                                        {data.name || 'Non défini'}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {data.email || 'Non défini'}
                                    </p>
                                </div>

                                {/* Informations */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Statut</h4>
                                        <div className="mt-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                data.status 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {data.status ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Rôles assignés</h4>
                                        <div className="mt-1 space-y-1">
                                            {data.roles.length > 0 ? (
                                                data.roles.map(roleId => {
                                                    const role = roles?.find(r => r.id === roleId);
                                                    return role ? (
                                                        <span key={roleId} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-1">
                                                            {role.name}
                                                        </span>
                                                    ) : null;
                                                })
                                            ) : (
                                                <span className="text-sm text-gray-500">Aucun rôle assigné</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Mot de passe</h4>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {data.password ? 'Sera modifié lors de la sauvegarde' : 'Inchangé'}
                                        </p>
                                    </div>
                                </div>

                                {/* Informations existantes */}
                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Informations système</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">ID:</span>
                                            <span className="text-gray-900">#{user.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Créé le:</span>
                                            <span className="text-gray-900 text-xs">{formatDate(user.created_at)}</span>
                                        </div>
                                        {user.email_verified_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email vérifié:</span>
                                                <span className="text-green-600 text-xs">✓ {formatDate(user.email_verified_at)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Rôles actuels:</span>
                                            <span className="text-gray-900 text-xs">
                                                {user.roles?.length || 0}
                                            </span>
                                        </div>
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
