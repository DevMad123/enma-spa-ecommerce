import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    KeyIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const InputField = ({ label, name, type = "text", value, onChange, error, placeholder, required = false, autoFocus = false }) => {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
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
            {error && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <FrontendLayout title="Mot de passe oublié">
            <Head title="Mot de passe oublié" />
            
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
                            Mot de Passe Oublié
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Pas de problème ! Nous vous enverrons un lien de réinitialisation par email
                        </p>
                    </div>
                </div>
            </section>

            {/* Reset Form Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl mb-4">
                                <EnvelopeIcon className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Réinitialiser le mot de passe
                            </h2>
                            <p className="text-gray-600">
                                Saisissez votre adresse email pour recevoir un lien de réinitialisation
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

                        {/* Information Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Sécurisé :</strong> Le lien de réinitialisation expire dans 60 minutes pour votre sécurité.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
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
                                            <span>Envoi en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <EnvelopeIcon className="h-6 w-6" />
                                            <span>Envoyer le lien</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Back to Login */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Vous vous souvenez de votre mot de passe ?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center"
                                    >
                                        Retour à la connexion
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Help Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Besoin d'aide ?
                        </h2>
                        <p className="text-gray-600">
                            Voici quelques informations utiles sur la réinitialisation de votre mot de passe
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <ClockIcon className="h-8 w-8 text-amber-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Délai de réception</h3>
                            </div>
                            <p className="text-gray-600">
                                Le lien de réinitialisation est généralement reçu dans les 2-5 minutes. 
                                Pensez à vérifier votre dossier spam si vous ne le recevez pas.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <ShieldCheckIcon className="h-8 w-8 text-green-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
                            </div>
                            <p className="text-gray-600">
                                Pour votre sécurité, le lien expire dans 60 minutes et ne peut être utilisé qu'une seule fois.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            Toujours des problèmes ? Notre équipe support est là pour vous aider.
                        </p>
                        <Link
                            href={route('contact')}
                            className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                        >
                            Contacter le support
                        </Link>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
