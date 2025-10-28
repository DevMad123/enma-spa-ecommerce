import React, { useEffect } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    UserPlusIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    GiftIcon
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

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
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
        post(route('register'));
    };

    return (
        <FrontendLayout title="Inscription - ENMA SPA">
            <Head title="Inscription" />
            
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
                            <UserPlusIcon className="h-10 w-10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Inscription
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Rejoignez la communauté ENMA SPA et profitez d'avantages exclusifs dès maintenant
                        </p>
                    </div>
                </div>
            </section>

            {/* Register Form Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Créer un compte
                            </h2>
                            <p className="text-gray-600">
                                Rejoignez-nous et découvrez tous nos avantages
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Name */}
                            <InputField
                                label="Nom complet"
                                name="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                placeholder="Votre nom complet"
                                required
                                autoComplete="name"
                                autoFocus
                            />

                            {/* Email */}
                            <InputField
                                label="Adresse email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                placeholder="votre@email.com"
                                required
                                autoComplete="username"
                            />

                            {/* Password */}
                            <InputField
                                label="Mot de passe"
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                placeholder="Choisissez un mot de passe"
                                required
                                autoComplete="new-password"
                            />

                            {/* Confirm Password */}
                            <InputField
                                label="Confirmer le mot de passe"
                                name="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                placeholder="Répétez votre mot de passe"
                                required
                                autoComplete="new-password"
                            />

                            {/* Password Requirements */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Votre mot de passe doit contenir :</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="flex items-center">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                        Au moins 8 caractères
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                        Au moins une lettre majuscule et minuscule
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                        Au moins un chiffre
                                    </li>
                                </ul>
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
                                            <span>Création du compte...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlusIcon className="h-6 w-6" />
                                            <span>Créer mon compte</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Terms */}
                            <p className="text-xs text-gray-600 text-center">
                                En créant un compte, vous acceptez nos{' '}
                                <Link href="#" className="text-amber-600 hover:text-amber-700">
                                    Conditions d'utilisation
                                </Link>{' '}
                                et notre{' '}
                                <Link href="#" className="text-amber-600 hover:text-amber-700">
                                    Politique de confidentialité
                                </Link>
                            </p>

                            {/* Login Link */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Déjà un compte ?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center"
                                    >
                                        Se connecter
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
                            Vos Avantages Membres
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Profitez d'avantages exclusifs en devenant membre de notre communauté
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                                <GiftIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Offres Exclusives</h3>
                            <p className="text-gray-600">Accédez à des promotions spéciales et des ventes privées réservées aux membres</p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                                <ShieldCheckIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Livraison Prioritaire</h3>
                            <p className="text-gray-600">Bénéficiez d'une livraison express gratuite sur toutes vos commandes</p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                                <CheckCircleIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Support Premium</h3>
                            <p className="text-gray-600">Profitez d'un support client prioritaire et personnalisé 7j/7</p>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
