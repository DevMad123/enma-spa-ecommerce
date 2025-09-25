import React, { useEffect } from "react";
import FrontendLayout from "@/Layouts/FrontendLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { 
    UserIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const InputField = ({ label, name, type = "text", value, onChange, error, placeholder, required = false, autoComplete, autoFocus = false }) => {
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
                    className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                        ${error 
                            ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-amber-500'
                        }
                    `}
                />
                {type === 'password' && (
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

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <FrontendLayout title="Connexion - ENMA SPA">
            <Head title="Connexion" />
            
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
                            <UserIcon className="h-10 w-10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Connexion
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Accédez à votre compte ENMA SPA et profitez d'une expérience personnalisée
                        </p>
                    </div>
                </div>
            </section>

            {/* Login Form Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Bon retour !
                            </h2>
                            <p className="text-gray-600">
                                Connectez-vous pour accéder à votre compte
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            {status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email */}
                            <InputField
                                label="Adresse email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                error={errors.email}
                                placeholder="votre@email.com"
                                required
                                autoComplete="username"
                                autoFocus
                            />

                            {/* Password */}
                            <InputField
                                label="Mot de passe"
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                error={errors.password}
                                placeholder="Votre mot de passe"
                                required
                                autoComplete="current-password"
                            />

                            {/* Remember Me */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData("remember", e.target.checked)}
                                        className="rounded border-gray-300 text-amber-600 shadow-sm focus:ring-amber-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
                                        Se souvenir de moi
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                )}
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
                                            <span>Connexion...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserIcon className="h-6 w-6" />
                                            <span>Se connecter</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Register Link */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Pas encore de compte ?{' '}
                                    <Link
                                        href={route('register')}
                                        className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center"
                                    >
                                        Créer un compte
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Pourquoi créer un compte ?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl mb-4">
                                <CheckCircleIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Commandes rapides</h3>
                            <p className="text-gray-600">Passez vos commandes plus rapidement avec vos informations sauvegardées</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mb-4">
                                <UserIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Suivi des commandes</h3>
                            <p className="text-gray-600">Suivez l'état de vos commandes en temps réel depuis votre profil</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4">
                                <ExclamationCircleIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Offres exclusives</h3>
                            <p className="text-gray-600">Profitez d'offres spéciales réservées aux membres inscrits</p>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
