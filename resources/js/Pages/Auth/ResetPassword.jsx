import React, { useEffect } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    KeyIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const InputField = ({ label, name, type = "text", value, onChange, error, placeholder, required = false, autoComplete, autoFocus = false, disabled = false }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;
    
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                        ${disabled ? 'bg-gray-100 text-gray-500' : ''}
                        ${error 
                            ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-amber-500'
                        }
                    `}
                />
                {type === 'password' && !disabled && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <FrontendLayout title="Nouveau mot de passe - ENMA SPA">
            <Head title="Nouveau mot de passe" />
            
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-8 backdrop-blur-sm">
                            <KeyIcon className="h-10 w-10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Nouveau Mot de Passe
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Choisissez un nouveau mot de passe sécurisé pour votre compte
                        </p>
                    </div>
                </div>
            </section>

            {/* Reset Form Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mb-4">
                                <ShieldCheckIcon className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Nouveau mot de passe
                            </h2>
                            <p className="text-gray-600">
                                Saisissez votre nouveau mot de passe ci-dessous
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email (disabled) */}
                            <InputField
                                label="Adresse email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                disabled={true}
                                autoComplete="username"
                            />

                            {/* New Password */}
                            <InputField
                                label="Nouveau mot de passe"
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                placeholder="Choisissez un mot de passe sécurisé"
                                required
                                autoComplete="new-password"
                                autoFocus
                            />

                            {/* Confirm Password */}
                            <InputField
                                label="Confirmer le mot de passe"
                                name="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                placeholder="Répétez votre nouveau mot de passe"
                                required
                                autoComplete="new-password"
                            />

                            {/* Password Requirements */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Votre mot de passe doit contenir :</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="flex items-center">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        Au moins 8 caractères
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        Au moins une lettre majuscule et minuscule
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        Au moins un chiffre et un caractère spécial
                                    </li>
                                </ul>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-800">
                                            <strong>Sécurité :</strong> Une fois votre mot de passe changé, 
                                            vous serez automatiquement connecté avec vos nouvelles informations.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                                            <span>Mise à jour...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheckIcon className="h-6 w-6" />
                                            <span>Confirmer le nouveau mot de passe</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Security Tips */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Conseils de sécurité
                        </h2>
                        <p className="text-gray-600">
                            Protégez votre compte avec ces bonnes pratiques
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                                <CheckCircleIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Mot de passe unique</h3>
                            <p className="text-sm text-gray-600">
                                Utilisez un mot de passe différent pour chaque compte important
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheckIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Mise à jour régulière</h3>
                            <p className="text-sm text-gray-600">
                                Changez votre mot de passe tous les 3-6 mois pour plus de sécurité
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                                <KeyIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Gestionnaire de mots de passe</h3>
                            <p className="text-sm text-gray-600">
                                Utilisez un gestionnaire pour créer et stocker des mots de passe sécurisés
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
