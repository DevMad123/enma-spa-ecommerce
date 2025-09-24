import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    UserIcon, 
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function Create({ roles }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: 1,
        roles: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    const handleRoleChange = (roleId) => {
        const newRoles = data.roles.includes(roleId)
            ? data.roles.filter(id => id !== roleId)
            : [...data.roles, roleId];
        
        setData('roles', newRoles);
    };

    return (
        <AdminLayout>
            <Head title="Créer un Utilisateur" />

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
                                            Créer un Utilisateur
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Ajoutez un nouvel utilisateur à votre plateforme.
                                        </p>
                                    </div>
                                </div>
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

                    {/* Form */}
                    <div className="mt-6 bg-white shadow rounded-lg">
                        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="text-base font-medium text-gray-900 mb-4">
                                    Informations de base
                                </h4>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Adresse email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Ex: jean.dupont@example.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Mot de passe *
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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

                                    {/* Password Confirmation */}
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                            Confirmer le mot de passe *
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                id="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            >
                                                {showPasswordConfirmation ? (
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

                            {/* Status */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="text-base font-medium text-gray-900 mb-4">
                                    Configuration
                                </h4>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                        Statut *
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.status ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value={1}>Actif</option>
                                        <option value={0}>Inactif</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            {/* Roles */}
                            <div>
                                <h4 className="text-base font-medium text-gray-900 mb-4">
                                    Rôles et Permissions
                                </h4>
                                <div className="space-y-3">
                                    {roles && roles.length > 0 ? (
                                        roles.map((role) => (
                                            <div key={role.id} className="flex items-center">
                                                <input
                                                    id={`role_${role.id}`}
                                                    type="checkbox"
                                                    checked={data.roles.includes(role.id)}
                                                    onChange={() => handleRoleChange(role.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`role_${role.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                                    {role.name}
                                                    {role.description && (
                                                        <span className="text-gray-500 font-normal ml-2">
                                                            - {role.description}
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">Aucun rôle disponible.</p>
                                    )}
                                </div>
                                {errors.roles && (
                                    <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                                <Link
                                    href={route('admin.users.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                >
                                    {processing ? 'Création...' : 'Créer l\'utilisateur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}