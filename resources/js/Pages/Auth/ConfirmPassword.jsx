import React, { useEffect } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationCircleIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

const InputField = ({ label, name, type = "text", value, onChange, error, placeholder, required = false, autoFocus = false }) => {
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

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <FrontendLayout title="Confirmation de mot de passe - ENMA SPA">
            <Head title="Confirmation de mot de passe" />
            
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
                            <ShieldCheckIcon className="h-10 w-10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Zone Sécurisée
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Confirmez votre mot de passe pour accéder à cette section sécurisée
                        </p>
                    </div>
                </div>
            </section>

            {/* Confirmation Form Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mb-4">
                                <LockClosedIcon className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Confirmation requise
                            </h2>
                            <p className="text-gray-600">
                                Pour votre sécurité, veuillez confirmer votre mot de passe
                            </p>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-amber-800">
                                        <strong>Zone sécurisée :</strong> Cette section contient des informations 
                                        sensibles qui nécessitent une confirmation de votre identité.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Password */}
                            <InputField
                                label="Mot de passe actuel"
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                placeholder="Saisissez votre mot de passe"
                                required
                                autoFocus
                            />

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
                                            <span>Vérification...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheckIcon className="h-6 w-6" />
                                            <span>Confirmer</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-xs text-gray-600 text-center">
                                Votre mot de passe ne sera pas stocké et cette vérification est temporaire 
                                pour cette session uniquement.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* Security Information */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Pourquoi cette vérification ?
                        </h2>
                        <p className="text-gray-600">
                            Nous prenons la sécurité de votre compte très au sérieux
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mb-4">
                                <ShieldCheckIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Protection des données</h3>
                            <p className="text-gray-600">
                                Vos informations personnelles et financières sont protégées par cette vérification supplémentaire
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
                                <LockClosedIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Accès sécurisé</h3>
                            <p className="text-gray-600">
                                Seul le propriétaire du compte peut accéder aux sections sensibles de l'application
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4">
                                <ExclamationCircleIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Prévention des fraudes</h3>
                            <p className="text-gray-600">
                                Cette mesure de sécurité aide à prévenir les accès non autorisés même si votre session est active
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
