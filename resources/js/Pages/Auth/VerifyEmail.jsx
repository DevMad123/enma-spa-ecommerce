import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    EnvelopeIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    InboxIcon
} from '@heroicons/react/24/outline';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <FrontendLayout title="Vérification Email - ENMA SPA">
            <Head title="Vérification Email" />
            
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
                            <EnvelopeIcon className="h-10 w-10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Vérifiez votre Email
                        </h1>
                        
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Nous avons envoyé un lien de vérification à votre adresse email
                        </p>
                    </div>
                </div>
            </section>

            {/* Verification Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
                                <InboxIcon className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Vérification requise
                            </h2>
                            <p className="text-gray-600">
                                Merci de vous être inscrit ! Avant de commencer, veuillez vérifier votre adresse email.
                            </p>
                        </div>

                        {/* Status Message */}
                        {status === 'verification-link-sent' && (
                            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            Un nouveau lien de vérification a été envoyé à votre adresse email !
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions :</h3>
                            <ol className="text-blue-800 space-y-2 text-sm">
                                <li className="flex items-start">
                                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">1</span>
                                    Vérifiez votre boîte de réception (et vos spams)
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">2</span>
                                    Cliquez sur le lien de vérification dans l'email
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">3</span>
                                    Votre compte sera automatiquement activé
                                </li>
                            </ol>
                        </div>

                        {/* Actions */}
                        <form onSubmit={submit} className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-600 mb-6">
                                    Vous n'avez pas reçu l'email ? Nous pouvons vous en envoyer un nouveau.
                                </p>
                                
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            <span>Envoi en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <EnvelopeIcon className="h-5 w-5" />
                                            <span>Renvoyer l'email de vérification</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Logout Link */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Mauvaise adresse email ?{' '}
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center"
                                    >
                                        Se déconnecter
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
                            Questions fréquentes
                        </h2>
                        <p className="text-gray-600">
                            Voici les réponses aux questions les plus courantes sur la vérification email
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <ClockIcon className="h-8 w-8 text-amber-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Délai de réception</h3>
                            </div>
                            <p className="text-gray-600">
                                L'email de vérification arrive généralement dans les 2-5 minutes. 
                                Vérifiez également votre dossier spam ou courrier indésirable.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <ShieldCheckIcon className="h-8 w-8 text-green-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
                            </div>
                            <p className="text-gray-600">
                                La vérification email protège votre compte et vous assure de recevoir 
                                nos communications importantes concernant vos commandes.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Email non reçu</h3>
                            </div>
                            <p className="text-gray-600">
                                Si vous ne recevez pas l'email après 10 minutes, utilisez le bouton 
                                "Renvoyer" ou contactez notre support.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <InboxIcon className="h-8 w-8 text-blue-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Après vérification</h3>
                            </div>
                            <p className="text-gray-600">
                                Une fois votre email vérifié, vous aurez accès à toutes les fonctionnalités 
                                de votre compte ENMA SPA.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            Besoin d'aide supplémentaire ?
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
