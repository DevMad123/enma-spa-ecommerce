import { Head, Link } from '@inertiajs/react';
import { HomeIcon, ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound({ status = 404 }) {
    const messages = {
        404: 'Page non trouvée',
        403: 'Accès refusé',
        500: 'Erreur serveur',
        503: 'Service temporairement indisponible',
    };

    const descriptions = {
        404: 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée.',
        403: 'Vous n\'avez pas l\'autorisation d\'accéder à cette page.',
        500: 'Une erreur s\'est produite sur le serveur. Nous travaillons à résoudre le problème.',
        503: 'Le site est actuellement en maintenance. Veuillez réessayer dans quelques instants.',
    };

    const title = messages[status] || 'Une erreur est survenue';
    const description = descriptions[status] || 'Une erreur inattendue s\'est produite.';

    return (
        <>
            <Head title={title} />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full text-center">
                    {/* Illustration 404 */}
                    <div className="mb-8">
                        <div className="relative">
                            <h1 className="text-[180px] sm:text-[240px] font-extrabold text-gray-200 leading-none select-none">
                                {status}
                            </h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white rounded-full p-8 shadow-xl">
                                    <svg
                                        className="w-20 h-20 sm:w-24 sm:h-24 text-indigo-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-4 mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            {title}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            {description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            <HomeIcon className="w-5 h-5" />
                            Retour à l'accueil
                        </Link>

                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-300 hover:border-gray-400"
                        >
                            <ShoppingBagIcon className="w-5 h-5" />
                            Voir la boutique
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            Retour
                        </button>
                    </div>

                    {/* Suggestions */}
                    {status === 404 && (
                        <div className="mt-16 pt-8 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                Peut-être cherchez-vous :
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link
                                    href="/shop"
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Boutique
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Contact
                                </Link>
                                <Link
                                    href="/a-propos"
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    À propos
                                </Link>
                                <Link
                                    href="/aide-faq"
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    FAQ
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    <div className="mt-12 text-sm text-gray-500">
                        Si le problème persiste,{' '}
                        <Link href="/contact" className="text-indigo-600 hover:text-indigo-800 font-medium">
                            contactez-nous
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
